// ============================================================
//  VARIABLES GLOBALES
// ============================================================
let selectedVariant = null;
let currentMutant = null;
let currentBingoUrl = null;
let currentBingoData = null;

let mutantExists = {};
let mutantNames = {};
let mutantTypes = {};
let mutantSkinsMap = {};


// Lista de botones (ejemplo)
const bingoButtons = [
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_starter.xml", icon: "../IMG/morphology_starter.png", name: "Iniciación" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_season_1.xml", icon: "../IMG/morphology_season_1.png", name: "Hibridación" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_season_2.xml", icon: "../IMG/morphology_season_2.png", name: "Investigación I" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_season_3.xml", icon: "../IMG/morphology_season_3.png", name: "Investigación II" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_season_4.xml", icon: "../IMG/morphology_season_4.png", name: "Investigación III" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_season_5.xml", icon: "../IMG/morphology_season_5.png", name: "Investigación IV" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_season_6.xml", icon: "../IMG/morphology_season_6.png", name: "Investigación V" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_season_7.xml", icon: "../IMG/morphology_season_7.png", name: "Investigación VI" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_season_8.xml", icon: "../IMG/morphology_season_8.png", name: "Investigación VII" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_season_9.xml", icon: "../IMG/morphology_season_9.png", name: "Investigación VIII" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_season_10.xml", icon: "../IMG/morphology_season_10.png", name: "Investigación IX" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_season_11.xml", icon: "../IMG/morphology_season_11.png", name: "Investigación X" },
  { enabled: false, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_season_12.xml", icon: "../IMG/morphology_season_12.png", name: "Investigación XI" },
  { enabled: false, url: "https://cofye.github.io/MGG-PNG/DATA/BINGOS/morphology_season_13.xml", icon: "../IMG/morphology_season_13.png", name: "Investigación XII" },
  { enabled: false, url: "https://cofye.github.io/MGG-PNG/DATA/BINGOS/morphology_season_14.xml", icon: "../IMG/morphology_season_14.png", name: "Investigación XIII" },
  { enabled: false, url: "https://cofye.github.io/MGG-PNG/DATA/BINGOS/morphology_season_15.xml", icon: "../IMG/morphology_season_15.png", name: "Investigación XIV" },
  { enabled: false, url: "https://cofye.github.io/MGG-PNG/DATA/BINGOS/morphology_season_99.xml", icon: "../IMG/morphology_season_99.png", name: "Investigación Indefinida" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_reactor_1.xml", icon: "../IMG/morphology_reactor_1.png", name: "Reactor I" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_legendary.xml", icon: "../IMG/morphology_legendary.png", name: "Legendarios" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_zodiac.xml", icon: "../IMG/morphology_zodiac.png", name: "Zodiaco" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_zodiac_silver.xml", icon: "../IMG/morphology_zodiac_silver.png", name: "Zodiaco Plata" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_event_xmas2015.xml", icon: "../IMG/bingo_event.png", name: "Eventos" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_amazons.xml", icon: "../IMG/bingo_amazons.png", name: "Amazonas Plata" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_season_1_bronze.xml", icon: "../IMG/bingo_bronze.png", name: "Hibridación Bronce" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_season_1_silver.xml", icon: "../IMG/bingo_silver.png", name: "Hibridación Plata" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_season_1_gold.xml", icon: "../IMG/bingo_gold.png", name: "Hibridación Oro" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_season_1_platinum.xml", icon: "../IMG/bingo_platinum.png", name: "Hibridación Platino" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_starter_platinum.xml", icon: "../IMG/morphology_starter_platinum.png", name: "Iniciación Platino" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_season_1_rumble.xml", icon: "../IMG/morphology_rumble.png", name: "Pelea" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_heroic.xml", icon: "../IMG/morphology_heroic.png", name: "Heroicos" },
  { enabled: false, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_xmas2016.xml", icon: "../IMG/morphology_winter.png", name: "Invierno" },
  { enabled: false, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_xmas2017.xml", icon: "../IMG/morphology_winter.png", name: "Invierno" },
  { enabled: false, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_xmas2018.xml", icon: "../IMG/morphology_winter.png", name: "Invierno" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_event_2019.xml", icon: "../IMG/morphology_event_2019.png", name: "2019 Eventos" },
  { enabled: false, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_xmas2019.xml", icon: "../IMG/morphology_winter.png", name: "Invierno" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_event_2020.xml", icon: "../IMG/morphology_event_2019.png", name: "2020 Eventos" },
  { enabled: false, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_xmas2020.xml", icon: "../IMG/morphology_winter.png", name: "Invierno" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_event_2021.xml", icon: "../IMG/morphology_event_2019.png", name: "2021 Eventos" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_anniversary21.xml", icon: "../IMG/morphology_event_2019.png", name: "8° Aniversario" },
  { enabled: false, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_xmas2021.xml", icon: "../IMG/morphology_winter.png", name: "Invierno" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_event_2022.xml", icon: "../IMG/morphology_event_2019.png", name: "2022 Eventos" },
  { enabled: false, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_xmas2022.xml", icon: "../IMG/morphology_winter.png", name: "Invierno" },
  { enabled: false, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_event_2023.xml", icon: "../IMG/morphology_event_2019.png", name: "2023 Eventos" },
  { enabled: false, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_10years.xml", icon: "../IMG/morphology_10years.png", name: "Realidades Cruzadas" },
  { enabled: false, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_xmas2023.xml", icon: "../IMG/morphology_winter.png", name: "Invierno" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_event_2024.xml", icon: "../IMG/morphology_event_2019.png", name: "2024 Eventos" },
  { enabled: false, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_anniversary24.xml", icon: "../IMG/morphology_conspiracy.png", name: "11° Aniversario" },
  { enabled: false, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_xmas2024.xml", icon: "../IMG/morphology_winter.png", name: "Invierno 2024" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_2025_skins.xml", icon: "../IMG/morphology_2025_skins.png", name: "Skins 2025" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_2025_mutants.xml", icon: "../IMG/morphology_2025_mutants.png", name: "Mutantes 2025" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_2025_events.xml", icon: "../IMG/morphology_2025_events.png", name: "2025 Eventos" },
  { enabled: false, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_anniversary25.xml", icon: "../IMG/morphology_10years.png", name: "12° Aniversario" },
  { enabled: false, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_xmas2025.xml", icon: "../IMG/morphology_winter.png", name: "Invierno 2025" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_2026_skins.xml", icon: "../IMG/morphology_2026_skins.png", name: "Skins 2026" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_2026_mutants.xml", icon: "../IMG/morphology_2026_mutants.png", name: "Mutantes 2026" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_2026_events.xml", icon: "../IMG/morphology_2026_events.png", name: "Eventos 2026" },
  { enabled: true, url: "https://s-beta.kobojo.com/mutants/gameconfig/morphology/morphology_anniversary26.xml", icon: "../IMG/morpho_hexcity.png", name: "13° Aniversario" },
  { enabled: false, url: "https://cofye.github.io/MGG-PNG/DATA/BINGOS/morphology_monogene_1.xml", icon: "../IMG/morphology_monogen.png", name: "Monogen 1" },
  { enabled: false, url: "https://cofye.github.io/MGG-PNG/DATA/BINGOS/morphology_monogene_2.xml", icon: "../IMG/morphology_monogen.png", name: "Monogen 2" },
];

function renderBingoButtons() {
  const container = document.getElementById('bingo-buttons');
  container.innerHTML = '';

  bingoButtons.forEach(btn => {
    const a = document.createElement('a');
    a.className = 'bingo-selector';
    a.dataset.url = btn.url;
    const enabled = btn.enabled !== false; // por defecto true
    a.dataset.enabled = enabled ? 'true' : 'false';

    const bgImg = enabled ? '../IMG/icon_type_tab.png' : '../IMG/icon_type_tab_disabled.png';
    a.innerHTML = `
      <div class="bingo-icon">
        <img class="b-background" src="${bgImg}">
        <img class="b-icon" src="${btn.icon}">
      </div>
    `;
    container.appendChild(a);
  });
}

// ============================================================
//  UTILIDADES
// ============================================================
function checkImage(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

function getGenesFromCode(code) {
  const match = code.match(/^([A-Z]{1,2})_/);
  if (!match) return { gen1: 'none', gen2: 'none' };
  const genes = match[1].toLowerCase();
  if (genes.length === 1) {
    return { gen1: 'none', gen2: genes };
  } else {
    return { gen1: genes[0], gen2: genes[1] };
  }
}

function formatRewardAmount(amount) {
  if (!amount && amount !== 0) return ' ';
  const num = Number(amount);
  if (num === 1) return '­';
  const numStr = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return 'x' + numStr;
}

// ============================================================
//  OBTENER URL DE SKIN (para mutantes y recompensas)
// ============================================================
function getSkinImageUrl(skin) {
  if (!skin) return '';
  const lowerSkin = skin.toLowerCase();
  // Estrellas especiales
  if (['bronze', 'silver', 'gold', 'platinum'].includes(lowerSkin)) {
    return `https://s-ak.kobojo.com/mutants/assets/thumbnails/star_${lowerSkin}.png`;
  } else {
    return `../IMG/icon_${lowerSkin}.png`;
  }
}

// ============================================================
//  PRECARGA DE LOCALISATION
// ============================================================
async function preloadAllMutants() {
  console.log("Precargando localisation...");
  const res = await fetch(`https://s-beta.kobojo.com/mutants/gameconfig/localisation_es.txt?nocache=${Date.now()}`);
  const text = await res.text();
  const lines = text.split("\n");

  lines.forEach(line => {
    const [key, value] = line.split(";");
    if (!key || !value) return;
    const cleanKey = key.trim().toLowerCase();
    if (!/^specimen_[a-z]{1,2}_\d{1,2}$/i.test(cleanKey)) return;
    const code = cleanKey.replace("specimen_", "").toUpperCase();
    mutantExists[code] = true;
    mutantNames[code] = value.trim();
  });

  console.log(`Precarga completada. ${Object.values(mutantExists).filter(v => v).length} mutantes encontrados.`);
}

// ============================================================
//  CARGA DE TIPOS
// ============================================================
let gameDefsLoaded = false;
let gameDefsDoc = null;

async function loadGameDefinitions(codes) {
  if (!codes.length) return;
  if (!gameDefsLoaded) {
    const res = await fetch("https://s-beta.kobojo.com/mutants/gameconfig/gamedefinitions.xml");
    const text = await res.text();
    gameDefsDoc = new DOMParser().parseFromString(text, "text/xml");
    gameDefsLoaded = true;
  }

  codes.forEach(code => {
    if (!mutantExists[code]) {
      mutantTypes[code] = "normal";
      return;
    }
    const entity = gameDefsDoc.querySelector(`EntityDescriptor[id="Specimen_${code}"]`);
    if (!entity) {
      mutantTypes[code] = "normal";
      return;
    }
    const typeTag = entity.querySelector('Tag[key="type"]');
    mutantTypes[code] = typeTag ? typeTag.getAttribute("value").toLowerCase() : "normal";
  });
}

// ============================================================
//  CARGA DE SKINS
// ============================================================
async function loadGachaTags() {
  console.log("Cargando skins desde gacha.xml...");
  const res = await fetch(`https://s-beta.kobojo.com/mutants/gameconfig/gacha.xml?nocache=${Date.now()}`);
  const text = await res.text();
  const xml = new DOMParser().parseFromString(text, "text/xml");
  const gachas = [...xml.querySelectorAll("Gacha")];

  gachas.forEach(gacha => {
    const tag = gacha.getAttribute("id");
    if (!tag) return;
    if (tag.startsWith("seasons") || tag.startsWith("gachaboss") || tag === "CompletionReward") return;

    const specimens = [...gacha.querySelectorAll("BasicElements GachaSpecimen")];
    specimens.forEach(spec => {
      const raw = spec.getAttribute("specimen");
      if (!raw) return;
      let code = raw.replace("Specimen_", "").trim().toUpperCase();
      if (!mutantSkinsMap[code]) mutantSkinsMap[code] = [];
      if (!mutantSkinsMap[code].includes(tag)) {
        mutantSkinsMap[code].push(tag);
      }
    });
  });

  // Skins especiales manuales
  const specialSkins = {
    "AF_10": "purgatory",
    "CF_01": "girl",
    "AD_01": "steampunk",
    "FB_03": "boss",
    "EA_01": "boss",
    "DB_01": "boss",
    "D_01": "boss",
    "EE_01": "boss",
    "DC_01": "boss",
    "BA_01": "boss",
    "FF_01": "boss",
    "E_01": "boss",
    "DF_01": "boss"
  };
  for (const [code, skin] of Object.entries(specialSkins)) {
    if (!mutantSkinsMap[code]) mutantSkinsMap[code] = [];
    if (!mutantSkinsMap[code].includes(skin)) {
      mutantSkinsMap[code].push(skin);
    }
  }

  console.log("Skins cargadas por código:", mutantSkinsMap);
}

// ============================================================
//  CONSTRUCCIÓN DE ICONO DE RECOMPENSA (definitiva)
// ============================================================
function buildRewardIcon(reward, iconClass) {
  // iconClass: "rv-icon", "rh-icon", "r-icon"
  if (!reward) {
    return `<img class="${iconClass}" src="" style="display:none;">`;
  }

  const type = reward.type;
  const id = (reward.id || '').trim();
  const skin = reward.skin || null;

  // Caso 1: Softcurrency
  if (type === "softcurrency") {
    const url = "https://s-ak.kobojo.com/mutants/assets/thumbnails/sc1000.png";
    return `<img class="${iconClass}" src="${url}" onerror="this.style.display='none'">`;
  }

  // Caso 2: Hardcurrency
  if (type === "hardcurrency") {
    const url = "https://s-ak.kobojo.com/mutants/assets/thumbnails/hardcurrency.png";
    return `<img class="${iconClass}" src="${url}" onerror="this.style.display='none'">`;
  }

  // Caso 3: Entity
  if (type === "entity") {
    const isSpecimen = id.toLowerCase().startsWith("specimen_");
    const actualClass = isSpecimen ? iconClass.replace('-icon', '-larva') : iconClass;

    if (isSpecimen) {
      const code = id.replace(/^Specimen_/i, "").toLowerCase();
      const larvaUrl = `https://s-ak.kobojo.com/mutants/assets/larvas/larva_${code}.png`;

      if (skin) {
        // Skin: usamos la función auxiliar
        const skinUrl = getSkinImageUrl(skin);
        const skinClass = actualClass + '-skin';
        return `
          <img class="${actualClass}" src="${larvaUrl}" onerror="this.style.display='none'">
          <img class="${skinClass}" src="${skinUrl}" onerror="this.style.display='none'">
        `;
      } else {
        return `<img class="${actualClass}" src="${larvaUrl}" onerror="this.src='https://s-ak.kobojo.com/mutants/assets/thumbnails/specimen_default.png'">`;
      }
    } else {
      // Otras entidades (items) usan thumbnail
      const url = `https://s-ak.kobojo.com/mutants/assets/thumbnails/${id.toLowerCase()}.png`;
      return `<img class="${actualClass}" src="${url}" onerror="this.style.display='none'">`;
    }
  }

  // Caso por defecto
  if (id) {
    const url = `https://s-ak.kobojo.com/mutants/assets/thumbnails/${id.toLowerCase()}.png`;
    return `<img class="${iconClass}" src="${url}" onerror="this.style.display='none'">`;
  } else {
    return `<img class="${iconClass}" src="" style="display:none;">`;
  }
}

// ============================================================
//  CONSTRUCCIÓN DE LA CUADRÍCULA DESDE XML
// ============================================================
function buildGrid(data) {
  const container = document.getElementById("bingo");
  container.innerHTML = "";

  const { colIcons, lineIcons, matrix, colRewards, lineRewards, specialReward } = data;
  const numCols = matrix[0] ? matrix[0].length : 0;
  const numRows = matrix.length;

  if (numRows === 0 || numCols === 0) {
    console.warn("Matriz vacía.");
    return;
  }

  // Primera columna (encabezados de fila)
  const firstCol = document.createElement("div");
  firstCol.className = "no-column";
  for (let r = 0; r < numRows; r++) {
    const geneh = document.createElement("a");
    geneh.className = "geneh";
    const iconPath = lineIcons && lineIcons[r] ? lineIcons[r] : "icon-morpho/gene_all.png";
    geneh.innerHTML = `
      <div class="geneh-icon">
        <img class="gh-background" src="https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/morphology/bg_gene.png">
        <img class="gh-icon" src="https://s-ak.kobojo.com/mutants/assets/${iconPath}">
      </div>
    `;
    firstCol.appendChild(geneh);
  }
  container.appendChild(firstCol);

  // Columnas de mutantes
  for (let c = 0; c < numCols; c++) {
    const colDiv = document.createElement("div");
    colDiv.className = "column";

    // Encabezado de columna
    const gene = document.createElement("a");
    gene.className = "gene";
    const colIcon = colIcons && colIcons[c] ? colIcons[c] : "icon-morpho/gene_all.png";
    gene.innerHTML = `
      <div class="gene-icon">
        <img class="g-background" src="https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/morphology/bg_gene_v.png">
        <img class="g-gen" src="https://s-ak.kobojo.com/mutants/assets/${colIcon}">
      </div>
    `;
    colDiv.appendChild(gene);

    // Mutantes
    for (let r = 0; r < numRows; r++) {
      const cell = matrix[r] && matrix[r][c];
      if (!cell) continue;
      const { specimenId, skin, variantType, variantValue } = cell;
      const code = specimenId.toUpperCase();

      const selector = document.createElement("a");
      selector.className = "selector";
      selector.dataset.code = code;

      // Guardar datos de variante si existe
      if (skin) {
        selector.dataset.skin = skin;
      }
      if (variantType === 'base') {
        selector.dataset.variantType = 'base';
        selector.dataset.variantValue = variantValue;
      }

      // URL de thumbnail (con skin si existe, o sin ella)
      let thumbUrl = `https://s-ak.kobojo.com/mutants/assets/thumbnails/specimen_${code.toLowerCase()}.png`;
      if (skin) {
        thumbUrl = `https://s-ak.kobojo.com/mutants/assets/thumbnails/specimen_${code.toLowerCase()}_${skin.toLowerCase()}.png`;
      } else if (variantType === 'base') {
        // Las estrellas no cambian la miniatura, usamos la base
        thumbUrl = `https://s-ak.kobojo.com/mutants/assets/thumbnails/specimen_${code.toLowerCase()}.png`;
      }

      // Genes (con lógica para monogen)
      const { gen1, gen2 } = getGenesFromCode(code);

      // Skin overlay para la miniatura (si no es estrella)
      let skinImgHTML = '';
      if (skin) {
        const skinUrl = getSkinImageUrl(skin);
        skinImgHTML = `<img class="m-skin" src="${skinUrl}" onerror="this.style.display='none'">`;
      }

      selector.innerHTML = `
        <div class="mutant-icon">
          <img class="m-background" src="https://s-ak.kobojo.com/mutants/assets/mobile/hud/mutopedia/slot_background_on.png">
          <img class="m-icon" src="${thumbUrl}" onerror="this.src='https://s-ak.kobojo.com/mutants/assets/thumbnails/specimen_default.png'">
          ${skinImgHTML}
          <img class="m-gen1" src="../IMG/gene_${gen1}.png">
          <img class="m-gen2" src="../IMG/gene_${gen2}.png">
        </div>
      `;

      // Deshabilitar si no existe el mutante
      if (!mutantExists[code]) {
        selector.classList.add('disabled');
        selector.style.cursor = 'default';
        selector.title = 'Mutante no disponible';
      } else {
        selector.addEventListener("click", (e) => {
          e.preventDefault();
          const code = selector.dataset.code;
          const skin = selector.dataset.skin || null;
          const variantType = selector.dataset.variantType || null;
          const variantValue = selector.dataset.variantValue ? parseInt(selector.dataset.variantValue) : null;
          if (code) loadProfile(code, skin, variantType, variantValue);
        });
      }

      colDiv.appendChild(selector);
    }

    // Recompensa vertical
    const rewardV = colRewards && colRewards[c] ? colRewards[c] : null;
    const rewardv = document.createElement("a");
    rewardv.className = "rewardv";
    rewardv.dataset.col = c;
    const vAmount = rewardV ? formatRewardAmount(rewardV.amount) : ' ';
    const vIconHTML = rewardV ? buildRewardIcon(rewardV, "rv-icon") : `<img class="rv-icon" src="" style="display:none;">`;
    rewardv.innerHTML = `
      <div class="rewardv-icon">
        <img class="rv-background" src="https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/morphology/bg_reward_v.png">
        ${vIconHTML}
        <span class="text rv-text">${vAmount}</span>
      </div>
    `;
    colDiv.appendChild(rewardv);

    container.appendChild(colDiv);
  }

  // Última columna (recompensas horizontales y especial)
  const lastCol = document.createElement("div");
  lastCol.className = "no-column";

  for (let r = 0; r < numRows; r++) {
    const reward = lineRewards && lineRewards[r] ? lineRewards[r] : null;
    const rewardh = document.createElement("a");
    rewardh.className = "rewardh";
    rewardh.dataset.row = r;
    const hAmount = reward ? formatRewardAmount(reward.amount) : ' ';
    const hIconHTML = reward ? buildRewardIcon(reward, "rh-icon") : `<img class="rh-icon" src="" style="display:none;">`;
    rewardh.innerHTML = `
      <div class="rewardh-icon">
        <img class="rh-background" src="https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/morphology/bg_reward.png">
        ${hIconHTML}
        <span class="text rh-text">${hAmount}</span>
      </div>
    `;
    lastCol.appendChild(rewardh);
  }

  // Recompensa especial
  const special = document.createElement("a");
  special.className = "reward";
  const spAmount = specialReward ? formatRewardAmount(specialReward.amount) : ' ';
  const spIconHTML = specialReward ? buildRewardIcon(specialReward, "r-icon") : `<img class="r-icon" src="" style="display:none;">`;
  special.innerHTML = `
    <div class="reward-icon">
      <img class="r-background" src="https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/morphology/bg_reward_final.png">
      ${spIconHTML}
      <span class="text r-text">${spAmount}</span>
    </div>
  `;
  lastCol.appendChild(special);

  container.appendChild(lastCol);
}

// ============================================================
//  SELECCIÓN DE BINGO
// ============================================================
async function selectBingo(bingoUrl, force = false) {
  if (!force && bingoUrl === currentBingoUrl) return;
  currentBingoUrl = bingoUrl;

  console.log("Cargando bingo desde:", bingoUrl);
  const response = await fetch(bingoUrl);
  const xmlText = await response.text();
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");

  // Headers
  const colNodes = [...xmlDoc.querySelectorAll("headers cols col")];
  const lineNodes = [...xmlDoc.querySelectorAll("headers lines line")];
  const colIcons = colNodes.map(col => col.getAttribute("icon"));
  const lineIcons = lineNodes.map(line => line.getAttribute("icon"));

  // Matriz
  const lineElements = [...xmlDoc.querySelectorAll(":root > line")];
  const matrix = lineElements.map(line => {
    const cols = [...line.querySelectorAll("col")];
    return cols.map(col => {
      const specimenId = col.getAttribute("specimenId").replace(/^Specimen_/i, "").toUpperCase();
      const skinValue = col.getAttribute("skin") || "_any";
      let skin = null;
      let variantType = null;
      let variantValue = null;

      if (skinValue !== "_any") {
        const lowerSkin = skinValue.toLowerCase();
        if (['bronze', 'silver', 'gold', 'platinum'].includes(lowerSkin)) {
          variantType = 'base';
          variantValue = ['bronze', 'silver', 'gold', 'platinum'].indexOf(lowerSkin) + 1; // 1-4
        } else {
          skin = skinValue;
        }
      }
      return { specimenId, skin, variantType, variantValue };
    });
  });

  // Recompensas (con tags)
  const rewardsSection = xmlDoc.querySelector("rewards");
  let colRewards = [];
  let lineRewards = [];
  let specialReward = null;
  if (rewardsSection) {
    colRewards = [...rewardsSection.querySelectorAll("col")].map(col => {
      const reward = {
        rewardId: col.getAttribute("rewardId"),
        amount: col.getAttribute("amount"),
        type: col.getAttribute("type"),
        id: col.getAttribute("id")
      };
      const tags = [...col.querySelectorAll("Tag")];
      tags.forEach(tag => {
        const key = tag.getAttribute("key");
        const value = tag.getAttribute("value");
        if (key && value) reward[key] = value;
      });
      return reward;
    });
    lineRewards = [...rewardsSection.querySelectorAll("line")].map(line => {
      const reward = {
        rewardId: line.getAttribute("rewardId"),
        amount: line.getAttribute("amount"),
        type: line.getAttribute("type"),
        id: line.getAttribute("id")
      };
      const tags = [...line.querySelectorAll("Tag")];
      tags.forEach(tag => {
        const key = tag.getAttribute("key");
        const value = tag.getAttribute("value");
        if (key && value) reward[key] = value;
      });
      return reward;
    });
    const specialNode = rewardsSection.querySelector("special");
    if (specialNode) {
      specialReward = {
        rewardId: specialNode.getAttribute("rewardId"),
        amount: specialNode.getAttribute("amount"),
        type: specialNode.getAttribute("type"),
        id: specialNode.getAttribute("id")
      };
      const tags = [...specialNode.querySelectorAll("Tag")];
      tags.forEach(tag => {
        const key = tag.getAttribute("key");
        const value = tag.getAttribute("value");
        if (key && value) specialReward[key] = value;
      });
    }
  }

  currentBingoData = { colIcons, lineIcons, matrix, colRewards, lineRewards, specialReward };

  // Cargar tipos de los mutantes que aparecen
  const codes = matrix.flat().map(cell => cell.specimenId);
  await loadGameDefinitions(codes);

  buildGrid(currentBingoData);

  // Actualizar fondos de los botones
  document.querySelectorAll('#bingo-buttons .bingo-selector').forEach(btn => {
    const bg = btn.querySelector('.b-background');
    const url = btn.dataset.url;
    const enabled = btn.dataset.enabled === 'true';

    if (url === bingoUrl) {
      bg.src = '../IMG/icon_type_tab_select.png';
    } else {
      bg.src = enabled ? '../IMG/icon_type_tab.png' : '../IMG/icon_type_tab_disabled.png';
    }
  });

  // Actualizar título
  const btnData = bingoButtons.find(b => b.url === bingoUrl);
  const titleSpan = document.querySelector('.text-title');
  if (titleSpan && btnData) {
    titleSpan.textContent = btnData.name;
  } else if (titleSpan) {
    titleSpan.textContent = 'Bingo';
  }

  // Ya no se llama a initProfileEmpty()
  console.log("Bingo cargado y renderizado.");
}

// ============================================================
//  PERFIL DEL MUTANTE (con PNG/PNG HD)
// ============================================================
async function loadProfile(code, skin = null, variantType = null, variantValue = null) {
  if (!mutantExists[code]) {
    console.warn("Mutante no existe:", code);
    return;
  }
  currentMutant = code;

  const { gen1, gen2 } = getGenesFromCode(code);
  const genImgs = document.querySelectorAll(".p-gen");
  genImgs[0].src = `../IMG/gene_${gen1}.png`;
  genImgs[1].src = `../IMG/gene_${gen2}.png`;

  // Ajustar visibilidad y centrado si solo hay un gen
  const genContainer = document.querySelector(".profil-gen");
  if (gen1 === 'none') {
    genImgs[0].style.display = 'none';
    genImgs[1].style.display = 'block';
    genContainer.style.justifyContent = 'center';
  } else {
    genImgs[0].style.display = 'block';
    genImgs[1].style.display = 'block';
    genContainer.style.justifyContent = 'flex-start'; // o el valor por defecto
  }

  document.querySelector(".mutant").style.display = "block";
  document.querySelector(".profil-text").style.display = "block";
  document.querySelector(".profil-gen").style.display = "flex";
  document.querySelector(".versions").style.display = "flex";

  const name = mutantNames[code] || code;
  document.querySelector(".profil-text").textContent = name;

  document.querySelector(".larva").src = `https://s-ak.kobojo.com/mutants/assets/larvas/larva_${code.toLowerCase()}.png`;

  const type = mutantTypes[code] || "normal";
  const typeImg = document.querySelector(".type");
  if (type === "normal") {
    typeImg.style.display = "none";
  } else {
    typeImg.style.display = "block";
    typeImg.src = `https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/icon_${type}.png`;
  }
  document.querySelector(".bg").src = `https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/profil_bg_${type}.png`;

  // Determinar la variante a cargar
  let variant = null;
  if (variantType === 'base') {
    variant = { type: 'base', value: variantValue };
  } else if (skin) {
    variant = { type: 'skin', value: skin };
  }
  // Si no hay ni skin ni variante base, variant queda null (carga base)

  await loadMutantImage(code, variant);
  await generateVariants(code, type, variant); // pasamos la variante actual
}

async function loadMutantImage(code, variant = null) {
  let paths = [];
  if (!variant) {
    // Base: sin variante (PNG o PNG HD)
    paths = [`../../PNG/${code}.png`, `../../PNG HD/${code}.png`];
  } else if (variant.type === "base") {
    // Estrella: V1, V2, V3, V4
    paths = [`../../PNG/V${variant.value}/${code}.png`, `../../PNG HD/V${variant.value}/${code}.png`];
  } else if (variant.type === "skin") {
    // Skin: VR + nombre de la skin
    paths = [`../../PNG/VR/${code}_${variant.value}.png`, `../../PNG HD/VR/${code}_${variant.value}.png`];
  }

  for (let p of paths) {
    if (await checkImage(p)) {
      document.querySelector(".mutant").src = p;
      return;
    }
  }
  // Si no se encuentra, usar thumbnail por defecto
  document.querySelector(".mutant").src = "https://s-ak.kobojo.com/mutants/assets/thumbnails/specimen_default.png";
}

async function generateVariants(code, type, currentVariant = null) {
  const container = document.querySelector(".versions");
  container.innerHTML = "";

  const variantNames = ["bronze", "silver", "gold", "platinum"];
  const allVariants = [];

  // Estrellas según tipo
  if (type === "zodiac") {
    allVariants.push({ type: "base", value: 2, icon: `../IMG/star_${variantNames[1]}.png` });
  } else if (["normal", "pvp", "legend", "heroic", "recipe"].includes(type)) {
    for (let v of [1, 2, 3, 4]) {
      allVariants.push({ type: "base", value: v, icon: `../IMG/star_${variantNames[v-1]}.png` });
    }
  }

  // Skins de gacha + especiales
  const base = code.replace(/_\d+$/, "");
  let skins = mutantSkinsMap[code] || [];
  if (mutantSkinsMap[base]) {
    skins = [...skins, ...mutantSkinsMap[base]];
  }
  skins = [...new Set(skins)];

  // Si la variante actual es una skin y no está en la lista, añadirla
  if (currentVariant && currentVariant.type === 'skin' && !skins.includes(currentVariant.value)) {
    skins.push(currentVariant.value);
  }

  skins.forEach(tag => {
    allVariants.push({ type: "skin", value: tag, icon: `../IMG/icon_${tag}.png` });
  });

  if (allVariants.length === 0) {
    container.style.display = "none";
    return;
  }
  container.style.display = "flex";

  let selectedIndex = -1;
  allVariants.forEach((v, idx) => {
    const el = document.createElement("a");
    el.className = "variant";
    el.innerHTML = `
      <div class="skin">
        <img class="skin-background" src="https://s-ak.kobojo.com/mutants/assets/mobile/hud/mutopedia/btn_black.png">
        <img class="skin-icon" src="${v.icon}">
      </div>
    `;
    el.addEventListener("click", async () => {
      await toggleVariant(v, el, code);
    });
    container.appendChild(el);

    // Marcar si coincide con la variante actual
    if (currentVariant) {
      if (v.type === currentVariant.type && v.value === currentVariant.value) {
        selectedIndex = idx;
      }
    }
  });

  // Si no se encontró coincidencia, NO seleccionamos nada (dejamos base)
  if (selectedIndex !== -1) {
    const el = container.children[selectedIndex];
    const variant = allVariants[selectedIndex];
    el.querySelector(".skin-background").src = "https://s-ak.kobojo.com/mutants/assets/mobile/hud/mutopedia/btn_white.png";
    selectedVariant = variant;
    // Ya la imagen está cargada, no es necesario recargar
  } else {
    // Si no hay selección, aseguramos que selectedVariant sea null
    selectedVariant = null;
    // La imagen ya se cargó con loadMutantImage con variant=null
  }
}

async function toggleVariant(variant, el, code) {
  if (selectedVariant && JSON.stringify(selectedVariant) === JSON.stringify(variant)) {
    // Deseleccionar
    selectedVariant = null;
    el.querySelector(".skin-background").src = "https://s-ak.kobojo.com/mutants/assets/mobile/hud/mutopedia/btn_black.png";
    await loadMutantImage(code, null);
    return;
  }
  // Seleccionar
  selectedVariant = variant;
  document.querySelectorAll(".skin-background").forEach(bg => {
    bg.src = "https://s-ak.kobojo.com/mutants/assets/mobile/hud/mutopedia/btn_black.png";
  });
  el.querySelector(".skin-background").src = "https://s-ak.kobojo.com/mutants/assets/mobile/hud/mutopedia/btn_white.png";
  await loadMutantImage(code, variant);
}

function initProfileEmpty() {
  document.querySelector(".mutant").style.display = "none";
  document.querySelector(".profil-text").style.display = "none";
  document.querySelector(".versions").style.display = "none";
  document.querySelector(".type").style.display = "none";
  document.querySelector(".larva").src = "https://s-ak.kobojo.com/mutants/assets/larvas/larva_mystery.png";
  // También restaurar los genes por si acaso
  const genImgs = document.querySelectorAll(".p-gen");
  genImgs.forEach(img => img.style.display = 'block');
  document.querySelector(".profil-gen").style.justifyContent = 'flex-start';
}

// ============================================================
//  INICIALIZACIÓN
// ============================================================
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Inicializando...");
  initProfileEmpty();

  await preloadAllMutants();
  await loadGachaTags();

  // Renderizar botones de bingo
  renderBingoButtons();

  // Asignar eventos
  document.querySelectorAll('#bingo-buttons .bingo-selector').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const url = btn.dataset.url;
      if (url) selectBingo(url);
    });
  });

  // Cargar primer bingo por defecto
  const firstBtn = document.querySelector('#bingo-buttons .bingo-selector');
  if (firstBtn) {
    const defaultUrl = firstBtn.dataset.url;
    if (defaultUrl) {
      await selectBingo(defaultUrl, true);
    }
  }

  console.log("Inicialización completa.");
});