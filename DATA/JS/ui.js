let mutantsLoaded = false;

const letters = ["A", "B", "C", "D", "E", "F"];

function generateLetterCombos() {
  let combos = [];
  for (let a of letters) combos.push(a);
  for (let a of letters) for (let b of letters) combos.push(a + b);
  return combos;
}

function generateNumbers() {
  let nums = [];
  for (let i = 1; i <= 15; i++) nums.push(String(i).padStart(2, "0"));
  nums.push("99");
  return nums;
}

function generateAllCodes() {
  const combos = generateLetterCombos();
  const nums = generateNumbers();
  let final = [];
  combos.forEach(code => {
    nums.forEach(num => {
      if (code.length === 1 && num === "02") return;
      final.push(`${code}_${num}`);
    });
  });
  return final;
}

async function loadMutants() {
  const allCodes = generateAllCodes();
  const res = await fetch(`https://s-beta.kobojo.com/mutants/gameconfig/localisation_es.txt?nocache=${Date.now()}`);
  const text = await res.text();
  const lines = text.split("\n");
  const localisation = {};
  lines.forEach(line => {
    const [key, value] = line.split(";");
    if (!key || !value) return;
    const code = key.replace(/specimen_/i, "").trim();
    localisation[code] = value.trim();
  });
  const validMutants = allCodes
    .filter(code => localisation[code])
    .map(code => ({
      code: code,
      name: localisation[code],
      icon: `https://s-beta.kobojo.com/mutants/assets/thumbnails/specimen_${code.toLowerCase()}.png`
    }));
  console.log("Mutantes cargados:", validMutants.length);
  return validMutants;
}

let mutants = [];
let mutantSkinsMap = {};

async function loadGachaTags() {
  const res = await fetch(`https://s-beta.kobojo.com/mutants/gameconfig/gacha.xml?nocache=${Date.now()}`);
  const text = await res.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, "text/xml");

  const gachas = [...xml.querySelectorAll("Gacha")];

  gachas.forEach(gacha => {
    const tag = gacha.getAttribute("id");
    if (!tag) return;

    if (tag.startsWith("seasons") || tag.startsWith("gachaboss")) return;

    const specimens = [...gacha.querySelectorAll("BasicElements GachaSpecimen")];

    specimens.forEach(spec => {
      const raw = spec.getAttribute("specimen");
      if (!raw) return;

      const code = raw.replace("Specimen_", "").trim();

      if (!mutantSkinsMap[code]) {
        mutantSkinsMap[code] = [];
      }

      if (!mutantSkinsMap[code].includes(tag)) {
        mutantSkinsMap[code].push(tag);
      }
    });
  });

  const specialSkins = {
    "AF_10": "purgatory", "DD_05": "spring", "CF_01": "girl", "AD_01": "steampunk",
    "FB_03": "boss", "EA_01": "boss", "DB_01": "boss", "D_01": "boss",
    "EE_01": "boss", "DC_01": "boss", "BA_01": "boss", "FF_01": "boss",
    "E_01": "boss", "DF_01": "boss"
  };

  for (const [code, skin] of Object.entries(specialSkins)) {
    if (!mutantSkinsMap[code]) {
      mutantSkinsMap[code] = [];
    }
    if (!mutantSkinsMap[code].includes(skin)) {
      mutantSkinsMap[code].push(skin);
    }
  }

  console.log("Mapa de skins cargado:", mutantSkinsMap);
}

Promise.all([loadMutants(), loadGachaTags()]).then(([mutantList]) => {
  mutants = mutantList;
  mutantsLoaded = true;
  if (searchInput.value.length > 0) {
    searchInput.dispatchEvent(new Event("input"));
  }
});

const searchInput = document.getElementById("mutant-search");
const resultsBox = document.getElementById("search-results");

function showResults(list) {
  resultsBox.innerHTML = "";
  if (list.length === 0) {
    resultsBox.classList.add("hidden");
    return;
  }
  list.forEach(m => {
    const item = document.createElement("div");
    item.className = "result-item";
    item.innerHTML = `
      <img src="${m.icon}">
      <span class="name-list">${m.name}</span>
    `;
    item.addEventListener("click", () => {
      openMutantModal(m.code, m.name);
    });
    resultsBox.appendChild(item);
  });
  resultsBox.classList.remove("hidden");
}

function normalizeText(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,;:!?¡¿'"()-]/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

searchInput.addEventListener("input", () => {
  const text = normalizeText(searchInput.value);

  if (text.length === 0) {
    resultsBox.classList.add("hidden");
    return;
  }

  if (!mutantsLoaded) {
    resultsBox.innerHTML = `
      <div class="result-item">
        <img src="DATA/IMG/tab-loading.gif">
        <span class="name-list">Cargando mutantes...</span>
      </div>
    `;
    resultsBox.classList.remove("hidden");
    return;
  }

  const filtered = mutants.filter(m => {
    const nameNorm = normalizeText(m.name);
    const codeNorm = normalizeText(m.code);
    return nameNorm.includes(text) || codeNorm.includes(text);
  });

  showResults(filtered);
});

document.addEventListener("click", (e) => {
  if (!searchInput.contains(e.target)) {
    resultsBox.classList.add("hidden");
  }
});

function openMutantModal(code, displayName) {
  const overlay = document.getElementById("overlay");
  const modal = document.getElementById("modal");
  const modalContent = document.getElementById("modal-content");
  overlay.classList.remove("hidden");
  modal.classList.remove("hidden");
  
  const gen1 = code[0].toLowerCase();
  const gen2 = code[1] !== "_" ? code[1].toLowerCase() : null;
  
  modalContent.innerHTML = `
    <div class="container">
      <div class="info">
        <div class="genes">
          <img src="DATA/IMG/gene_${gen1}.png">
          ${gen2 ? `<img src="DATA/IMG/gene_${gen2}.png">` : ""}
        </div>
        <span class="name">${displayName} - ${code}</span>
        <img class="big" src="DATA/IMG/bg_${gen1}.png">
        <img class="larva" src="https://s-beta.kobojo.com/mutants/assets/larvas/larva_${code.toLowerCase()}.png">
      </div>
      <div class="mutants" id="modal-mutants"></div>
    </div>
  `;
  
  loadAllVariations(code);
}

// CORRECCIÓN DE CIERRE: Validamos que el clic sea en el fondo oscuro y no dentro del modal
document.getElementById("overlay").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) {
    document.getElementById("overlay").classList.add("hidden");
    document.getElementById("modal").classList.add("hidden");
  }
});

function loadAllVariations(code) {
  const container = document.getElementById("modal-mutants");
  container.innerHTML = "";

  const versiones = [
    { num: 1, img: "DATA/IMG/star_bronze.png" },
    { num: 2, img: "DATA/IMG/star_silver.png" },
    { num: 3, img: "DATA/IMG/star_gold.png" },
    { num: 4, img: "DATA/IMG/star_platinum.png" }
  ];

  const candidates = [];

  candidates.push({ src: `PNG/${code}.png`, version: null, tag: null, skinIcon: null });

  versiones.forEach(v => {
    candidates.push({ src: `PNG/V${v.num}/${code}.png`, version: v.img, tag: null, skinIcon: null });
  });

  candidates.push({ src: `PNG HD/${code}.png`, version: null, tag: "DATA/IMG/tag_hd.png", skinIcon: null });

  versiones.forEach(v => {
    candidates.push({ src: `PNG HD/V${v.num}/${code}.png`, version: v.img, tag: "DATA/IMG/tag_hd.png", skinIcon: null });
  });

  const skinsTags = mutantSkinsMap[code] || [];
  skinsTags.forEach(tag => {
    const iconLocal = `DATA/IMG/icon_${tag}.png`;
    candidates.push({ src: `PNG/VR/${code}_${tag}.png`, version: null, tag: null, skinIcon: iconLocal });
    candidates.push({ src: `PNG HD/VR/${code}_${tag}.png`, version: null, tag: "DATA/IMG/tag_hd.png", skinIcon: iconLocal });
  });

  candidates.forEach(data => {
    const div = document.createElement("div");
    div.className = "mutant";

    const loader = document.createElement("img");
    loader.className = "loader";
    loader.src = "DATA/IMG/tab-loading.gif";
    loader.alt = "loading";
    div.appendChild(loader);

    const img = document.createElement("img");
    img.className = "png hidden";

    let versionImg = null;
    if (data.version || data.skinIcon) {
      versionImg = document.createElement("img");
      versionImg.className = "version hidden";
      versionImg.src = data.version || data.skinIcon;

      if (data.skinIcon) {
        versionImg.addEventListener("error", () => versionImg.remove(), { once: true });
      }
    }

    let tagImg = null;
    if (data.tag) {
      tagImg = document.createElement("img");
      tagImg.className = "tag hidden";
      tagImg.src = data.tag;
    }

    div.appendChild(img);
    if (versionImg) div.appendChild(versionImg);
    if (tagImg) div.appendChild(tagImg);

    container.appendChild(div);

    img.addEventListener("load", () => {
      if (img.naturalWidth > 0) {
        loader.remove();
        img.classList.remove("hidden");
        if (versionImg) versionImg.classList.remove("hidden");
        if (tagImg) tagImg.classList.remove("hidden");
      } else {
        div.remove();
      }
    }, { once: true });

    img.addEventListener("error", () => {
      div.remove();
    }, { once: true });

    img.src = data.src;
  });

  console.log(`Variaciones procesándose en paralelo ordenado para ${code}`);
}