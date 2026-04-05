let selectedVariant = null;
let currentMutant = null;
let currentBingo = "01";

let mutantTypes = {};           // fullCode -> type
let mutantNames = {};           // fullCode -> name
let mutantExists = {};          // fullCode -> boolean
let mutantSkinsMap = {};        // fullCode (o base) -> [skin tags]

let rewardsRenderId = 0;

const ALL_BASE_GENES = (() => {
  const bases = [];
  const letters = ['A','B','C','D','E','F'];
  for (let g1 of letters) {
    for (let g2 of letters) {
      bases.push(g1 + g2);
    }
  }
  return bases;
})();

const ALL_BINGOS = ['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','99'];

// --------------------------------------------------------------
// Utilidades
// --------------------------------------------------------------
function checkImage(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

function getBaseGenesFromGrid() {
  const genes = new Set();
  document.querySelectorAll(".selector").forEach(sel => {
    const code = sel.getAttribute("data");
    if (code) genes.add(code);
  });
  return [...genes];
}

function getFullCodesForBingo(bingo) {
  const baseGenes = getBaseGenesFromGrid();
  return baseGenes.map(g => `${g}_${bingo}`);
}

// --------------------------------------------------------------
// Precarga de todos los mutantes (localisation)
// --------------------------------------------------------------
async function preloadAllMutants() {
  console.log("Precargando localisation...");
  const res = await fetch(`https://s-beta.kobojo.com/mutants/gameconfig/localisation_es.txt?nocache=${Date.now()}`);
  const text = await res.text();
  const lines = text.split("\n");

  for (let base of ALL_BASE_GENES) {
    for (let bingo of ALL_BINGOS) {
      const fullCode = `${base}_${bingo}`;
      mutantExists[fullCode] = false;
    }
  }

  lines.forEach(line => {
    const [key, value] = line.split(";");
    if (!key || !value) return;
    const cleanKey = key.trim().toLowerCase();
    if (!/^specimen_[a-z]{2}_\d{2}$/i.test(cleanKey)) return;
    const code = cleanKey.replace("specimen_", "").toUpperCase();
    if (mutantExists.hasOwnProperty(code)) {
      mutantExists[code] = true;
      mutantNames[code] = value.trim();
    }
  });

  console.log(`Precarga completada. ${Object.values(mutantExists).filter(v => v).length} mutantes encontrados.`);
}

// --------------------------------------------------------------
// Carga de tipos (solo para los que existen)
// --------------------------------------------------------------
async function loadGameDefinitions(codes) {
  if (!codes.length) return;
  const res = await fetch("https://s-beta.kobojo.com/mutants/gameconfig/gamedefinitions.xml");
  const text = await res.text();
  const xml = new DOMParser().parseFromString(text, "text/xml");

  codes.forEach(code => {
    if (!mutantExists[code]) {
      mutantTypes[code] = "normal";
      return;
    }
    const entity = xml.querySelector(`EntityDescriptor[id="Specimen_${code}"]`);
    if (!entity) {
      mutantTypes[code] = "normal";
      return;
    }
    const typeTag = entity.querySelector('Tag[key="type"]');
    mutantTypes[code] = typeTag ? typeTag.getAttribute("value").toLowerCase() : "normal";
  });
}

// --------------------------------------------------------------
// Carga de skins (por código completo o base) + manuales
// --------------------------------------------------------------
async function loadGachaTags() {
  console.log("Cargando skins desde gacha.xml...");
  const res = await fetch(`https://s-beta.kobojo.com/mutants/gameconfig/gacha.xml?nocache=${Date.now()}`);
  const text = await res.text();
  const xml = new DOMParser().parseFromString(text, "text/xml");
  const gachas = [...xml.querySelectorAll("Gacha")];

  // Inicializar mapa para todos los códigos completos y bases
  for (let base of ALL_BASE_GENES) {
    mutantSkinsMap[base] = [];
    for (let bingo of ALL_BINGOS) {
      mutantSkinsMap[`${base}_${bingo}`] = [];
    }
  }

  gachas.forEach(gacha => {
    const tag = gacha.getAttribute("id");
    if (!tag) return;
    if (tag.startsWith("seasons") || tag.startsWith("gachaboss") || tag === "CompletionReward") return;

    const specimens = [...gacha.querySelectorAll("BasicElements GachaSpecimen")];
    specimens.forEach(spec => {
      const raw = spec.getAttribute("specimen");
      if (!raw) return;
      let code = raw.replace("Specimen_", "").trim().toUpperCase();
      if (mutantSkinsMap[code] && !mutantSkinsMap[code].includes(tag)) {
        mutantSkinsMap[code].push(tag);
      }
    });
  });

  // Añadir skins especiales manualmente
  const specialSkins = {
    "AF_10": "purrgatory",
    "CF_01": "girl",
    "AD_01": "steampunk"
  };
  for (const [code, skin] of Object.entries(specialSkins)) {
    if (!mutantSkinsMap[code]) mutantSkinsMap[code] = [];
    if (!mutantSkinsMap[code].includes(skin)) {
      mutantSkinsMap[code].push(skin);
    }
  }

  console.log("Skins cargadas por código:", mutantSkinsMap);
}

// --------------------------------------------------------------
// Renderizado de iconos según bingo actual
// --------------------------------------------------------------
async function renderMutantIcons() {
  console.log(`Renderizando mutantes para bingo ${currentBingo}`);
  const selectors = document.querySelectorAll(".selector");
  for (let sel of selectors) {
    const baseGenes = sel.getAttribute("data");
    if (!baseGenes) continue;
    const fullCode = `${baseGenes}_${currentBingo}`;
    const img = sel.querySelector(".m-icon");
    
    if (mutantExists[fullCode]) {
      const newSrc = `https://s-ak.kobojo.com/mutants/assets/thumbnails/specimen_${fullCode.toLowerCase()}.png`;
      const exists = await checkImage(newSrc);
      if (exists) {
        img.src = newSrc;
        img.dataset.invalid = "false";
        sel.setAttribute("data-fullcode", fullCode);
      } else {
        img.src = "https://s-ak.kobojo.com/mutants/assets/thumbnails/specimen_default.png";
        img.dataset.invalid = "true";
        sel.removeAttribute("data-fullcode");
      }
    } else {
      img.src = "https://s-ak.kobojo.com/mutants/assets/thumbnails/specimen_default.png";
      img.dataset.invalid = "true";
      sel.removeAttribute("data-fullcode");
    }
  }
}

// --------------------------------------------------------------
// Resetear rewards a valores por defecto (vacío)
// --------------------------------------------------------------
function resetRewardsToDefault() {
  // Verticales
  document.querySelectorAll(".rewardv .rv-text").forEach(span => span.textContent = " ");
  document.querySelectorAll(".rewardv .rv-icon").forEach(icon => icon.src = "");
  // Horizontales
  document.querySelectorAll(".rewardh .rh-text").forEach(span => span.textContent = " ");
  document.querySelectorAll(".rewardh .rh-icon").forEach(icon => icon.src = "");
  // Especial
  const specialText = document.querySelector(".reward .r-text");
  const specialIcon = document.querySelector(".reward .r-icon");
  if (specialText) specialText.textContent = " ";
  if (specialIcon) specialIcon.src = "";
}

// --------------------------------------------------------------
// Recompensas (ahora con reseteo previo)
// --------------------------------------------------------------
function renderRewards() {
  rewardsRenderId++; // 🔥 invalida renders anteriores
  const currentRenderId = rewardsRenderId;

  resetRewardsToDefault();

  if (typeof window.bingoRewards === "undefined") {
    console.warn("bingoRewards no definido");
    return;
  }

  const verticals = document.querySelectorAll(".rewardv");
  verticals.forEach((reward, idx) => {
    const colNum = idx + 1;
    const rewardId = `${currentBingo}c${colNum}`;
    const data = window.bingoRewards[rewardId];
    const textSpan = reward.querySelector(".rv-text");
    const iconImg = reward.querySelector(".rv-icon");
    if (data) {
      if (textSpan) textSpan.textContent = data.amount || " ";
      if (iconImg) {
        let iconSrc = "";
        if (data.id && data.id.toLowerCase().startsWith("specimen_")) {
          const specimenCode = data.id.replace(/^Specimen_/i, "").toLowerCase();
          iconSrc = `https://s-ak.kobojo.com/mutants/assets/larvas/larva_${specimenCode}.png`;
        } else if (data.id) {
          iconSrc = `https://s-ak.kobojo.com/mutants/assets/thumbnails/${data.id.toLowerCase()}.png`;
        }
        if (iconSrc) {
          checkImage(iconSrc).then(exists => { if (exists) iconImg.src = iconSrc; });
        }
      }
    }
  });

  const horizontals = document.querySelectorAll(".rewardh");
  horizontals.forEach((reward, idx) => {
    const rowNum = idx + 1;
    const rewardId = `${currentBingo}l${rowNum}`;
    const data = window.bingoRewards[rewardId];
    const textSpan = reward.querySelector(".rh-text");
    const iconImg = reward.querySelector(".rh-icon");
    if (data) {
      if (textSpan) textSpan.textContent = data.amount || " ";
      if (iconImg) {
        let iconSrc = "";
        if (data.id && data.id.toLowerCase().startsWith("specimen_")) {
          const specimenCode = data.id.replace(/^Specimen_/i, "").toLowerCase();
          iconSrc = `https://s-ak.kobojo.com/mutants/assets/larvas/larva_${specimenCode}.png`;
        } else if (data.id) {
          iconSrc = `https://s-ak.kobojo.com/mutants/assets/thumbnails/${data.id.toLowerCase()}.png`;
        }
        if (iconSrc) {
          checkImage(iconSrc).then(exists => { if (exists) iconImg.src = iconSrc; });
        }
      }
    }
  });

  const special = document.querySelector(".reward");
  if (special) {
    const rewardId = `${currentBingo}s1`;
    const data = window.bingoRewards[rewardId];
    const textSpan = special.querySelector(".r-text");
    let iconImg = special.querySelector(".r-icon, .r-larva");
    if (data) {
  if (textSpan) textSpan.textContent = data.amount || " ";

  if (data.id) {
    let iconSrc = "";
    let isSpecimen = data.id.toLowerCase().startsWith("specimen_");

    if (isSpecimen) {
      const specimenCode = data.id.replace(/^Specimen_/i, "").toLowerCase();
      iconSrc = `https://s-ak.kobojo.com/mutants/assets/larvas/larva_${specimenCode}.png`;
    } else {
      iconSrc = `https://s-ak.kobojo.com/mutants/assets/thumbnails/${data.id.toLowerCase()}.png`;
    }

    if (iconSrc) {
      checkImage(iconSrc).then(exists => {
  if (!exists) return;

  // 🚨 si este render ya no es el actual, cancelar
  if (currentRenderId !== rewardsRenderId) return;

  const container = special.querySelector(".reward-icon");

  // limpiar SIEMPRE antes de insertar
  container.querySelectorAll(".r-icon, .r-larva").forEach(el => el.remove());

  const newImg = document.createElement("img");
  newImg.src = iconSrc;
  newImg.className = isSpecimen ? "r-larva" : "r-icon";

  container.appendChild(newImg);
});
    }
  }
}
  }
}

function resetRewardsToDefault() {
  document.querySelectorAll(".rewardv .rv-text").forEach(span => span.textContent = " ");
  document.querySelectorAll(".rewardv .rv-icon").forEach(icon => icon.src = "");

  document.querySelectorAll(".rewardh .rh-text").forEach(span => span.textContent = " ");
  document.querySelectorAll(".rewardh .rh-icon").forEach(icon => icon.src = "");

  const special = document.querySelector(".reward");
  if (special) {
    const text = special.querySelector(".r-text");
    if (text) text.textContent = " ";

    const container = special.querySelector(".reward-icon");

    // 🔥 LIMPIEZA REAL
    container.querySelectorAll(".r-icon, .r-larva").forEach(el => el.remove());

    // 🔥 opcional: restaurar estructura base
    const baseImg = document.createElement("img");
    baseImg.className = "r-icon";
    baseImg.src = "";
    container.appendChild(baseImg);
  }
}

// --------------------------------------------------------------
// Cambio de bingo
// --------------------------------------------------------------
async function selectBingo(bingoId, force = false) {
  console.log("selectBingo llamado con:", bingoId, "force:", force);

  if (!force && bingoId === currentBingo) {
    console.log("IGNORADO porque es el mismo bingo");
    return;
  }

  currentBingo = bingoId;
  console.log("currentBingo ahora es:", currentBingo);

  const buttons = document.querySelectorAll(".bingo-selector");
  console.log("Botones encontrados:", buttons.length);

  buttons.forEach(btn => {
    const bg = btn.querySelector(".b-background");
    const btnId = btn.getAttribute("data");

    console.log("Comparando botón:", btnId, "con", currentBingo);

    if (btnId === currentBingo) {
      console.log("-> ESTE debería activarse");
      bg.src = "../IMG/icon_type_tab_select.png";
    } else {
      bg.src = "../IMG/icon_type_tab.png";
    }
  });

  const fullCodes = getFullCodesForBingo(currentBingo);
  console.log("Full codes:", fullCodes);

  const existingCodes = fullCodes.filter(code => mutantExists[code]);
  console.log("Existing codes:", existingCodes);

  await loadGameDefinitions(existingCodes);
  console.log("Tipos cargados");

  await renderMutantIcons();
  console.log("Iconos renderizados");

  renderRewards();
  console.log("Rewards renderizados");
}

// --------------------------------------------------------------
// Perfil y variantes (con skins filtradas por bingo)
// --------------------------------------------------------------
async function loadProfile(fullCode) {
  if (!mutantExists[fullCode]) return;
  currentMutant = fullCode;

  const match = fullCode.match(/^([A-Z]{2})_(\d{2})$/);
  if (!match) return;
  const baseGenes = match[1];
  const bingo = match[2];

  const gen1 = baseGenes[0].toLowerCase();
  const gen2 = baseGenes[1].toLowerCase();

  document.querySelectorAll(".p-gen")[0].src = `../IMG/gene_${gen1}.png`;
  document.querySelectorAll(".p-gen")[1].src = `../IMG/gene_${gen2}.png`;

  document.querySelector(".mutant").style.display = "block";
  document.querySelector(".profil-text").style.display = "block";
  document.querySelector(".profil-gen").style.display = "flex";
  document.querySelector(".versions").style.display = "flex";

  const name = mutantNames[fullCode] || fullCode;
  document.querySelector(".profil-text").textContent = name;

  document.querySelector(".larva").src = `https://s-ak.kobojo.com/mutants/assets/larvas/larva_${fullCode.toLowerCase()}.png`;

  const type = mutantTypes[fullCode] || "normal";
  const typeImg = document.querySelector(".type");
  if (type === "normal") {
    typeImg.style.display = "none";
  } else {
    typeImg.style.display = "block";
    typeImg.src = `https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/icon_${type}.png`;
  }

  document.querySelector(".bg").src = `https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/profil_bg_${type}.png`;

  await loadMutantImage(fullCode);
  await generateVariants(fullCode, baseGenes, type);
}

async function loadMutantImage(fullCode, variant = null) {
  let paths = [];
  if (!variant) {
    paths = [`../../PNG/${fullCode}.png`, `../../PNG HD/${fullCode}.png`];
  } else if (variant.type === "base") {
    paths = [`../../PNG/V${variant.value}/${fullCode}.png`, `../../PNG HD/V${variant.value}/${fullCode}.png`];
  } else if (variant.type === "skin") {
    paths = [`../../PNG/VR/${fullCode}_${variant.value}.png`, `../../PNG HD/VR/${fullCode}_${variant.value}.png`];
  }

  for (let p of paths) {
    if (await checkImage(p)) {
      document.querySelector(".mutant").src = p;
      return;
    }
  }
  document.querySelector(".mutant").src = "https://s-ak.kobojo.com/mutants/assets/thumbnails/specimen_default.png";
}

async function generateVariants(fullCode, baseGenes, type) {
  const container = document.querySelector(".versions");
  container.innerHTML = "";

  const variantNames = ["bronze","silver","gold","platinum"];
  const allVariants = [];

  // Estrellas según tipo
  if (type === "zodiac") {
    allVariants.push({ type: "base", value: 2, icon: `../IMG/star_${variantNames[1]}.png` });
  } else if (["normal","pvp","legend","heroic","recipe"].includes(type)) {
    for (let v of [1,2,3,4]) {
      allVariants.push({ type: "base", value: v, icon: `../IMG/star_${variantNames[v-1]}.png` });
    }
  }

  // Skins: primero buscar por código completo, luego por base (sin número)
  let skins = mutantSkinsMap[fullCode] || [];
  if (mutantSkinsMap[baseGenes]) {
    skins = [...skins, ...mutantSkinsMap[baseGenes]];
  }
  // Eliminar duplicados
  skins = [...new Set(skins)];

  skins.forEach(tag => {
    allVariants.push({ type: "skin", value: tag, icon: `../IMG/icon_${tag}.png` });
  });

  if (allVariants.length === 0) {
    container.style.display = "none";
    return;
  }
  container.style.display = "flex";

  allVariants.forEach(v => {
    const el = document.createElement("a");
    el.className = "variant";
    el.innerHTML = `
      <div class="skin">
        <img class="skin-background" src="https://s-ak.kobojo.com/mutants/assets/mobile/hud/mutopedia/btn_black.png">
        <img class="skin-icon" src="${v.icon}">
      </div>
    `;
    el.addEventListener("click", async () => { await toggleVariant(v, el); });
    container.appendChild(el);
  });

  if (selectedVariant) {
    const match = allVariants.find(v => JSON.stringify(v) === JSON.stringify(selectedVariant));
    if (match) {
      const index = allVariants.indexOf(match);
      const el = container.children[index];
      toggleVariant(match, el, true);
    } else {
      selectedVariant = null;
    }
  }
}

async function toggleVariant(variant, el, isRestoring = false) {
  if (!isRestoring && selectedVariant && JSON.stringify(selectedVariant) === JSON.stringify(variant)) {
    selectedVariant = null;
    resetVariants();
    await loadMutantImage(currentMutant);
    return;
  }
  selectedVariant = variant;
  resetVariants();
  el.querySelector(".skin-background").src = "https://s-ak.kobojo.com/mutants/assets/mobile/hud/mutopedia/btn_white.png";
  await loadMutantImage(currentMutant, variant);
}

function resetVariants() {
  document.querySelectorAll(".skin-background").forEach(bg => {
    bg.src = "https://s-ak.kobojo.com/mutants/assets/mobile/hud/mutopedia/btn_black.png";
  });
}

function initProfileEmpty() {
  document.querySelector(".mutant").style.display = "none";
  document.querySelector(".profil-text").style.display = "none";
  document.querySelector(".versions").style.display = "none";
  document.querySelector(".type").style.display = "none";
  document.querySelector(".larva").src = "https://s-ak.kobojo.com/mutants/assets/larvas/larva_mystery.png";
}

// --------------------------------------------------------------
// Inicialización de eventos
// --------------------------------------------------------------
function initClicks() {
  document.querySelectorAll(".selector").forEach(el => {
    el.addEventListener("click", async (e) => {
      e.preventDefault();
      const fullCode = el.getAttribute("data-fullcode");
      if (fullCode) await loadProfile(fullCode);
    });
  });
}

function initBingoButtons() {
  const bingoBtns = document.querySelectorAll(".bingo-selector");
  bingoBtns.forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const bingoId = btn.getAttribute("data");
      if (bingoId) await selectBingo(bingoId);
    });
  });
}

// --------------------------------------------------------------
// Arranque principal
// --------------------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Inicializando...");
  initProfileEmpty();

  await preloadAllMutants();
  console.log("Mutants precargados");

  await loadGachaTags();
  console.log("Skins cargadas");

  initBingoButtons();
  console.log("Botones bingo inicializados");

  console.log("ANTES de selectBingo");
  await selectBingo("01", true);
  console.log("DESPUÉS de selectBingo");

  initClicks();
  console.log("Inicialización completa");
});