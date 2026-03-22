function scaleSite() {
  const baseWidth = 1840;
  const scale = window.innerWidth / baseWidth;
  const main = document.getElementById("scale-container");
  const modal = document.getElementById("modal-content");
  main.style.transform = `scale(${scale})`;
  modal.style.transform = `scale(${scale})`;
  main.style.transformOrigin = "top left";
  modal.style.transformOrigin = "top left";
}

document.addEventListener("DOMContentLoaded", scaleSite);
window.addEventListener("resize", scaleSite);
window.addEventListener("load", scaleSite);

const letters = ["A", "B", "C", "D", "E", "F"];

function generateLetterCombos() {
	let combos = [];
	for (let a of letters) combos.push(a);
	for (let a of letters) for (let b of letters) combos.push(a + b);
	return combos;
}

function generateNumbers() {
	let nums = [];
	for (let i = 1; i <= 14; i++) nums.push(String(i).padStart(2, "0"));
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
		const code = key.replace("Specimen_", "").trim();
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

let vrTags = [];
	
async function loadGachaTags() {
  const res = await fetch("https://s-beta.kobojo.com/mutants/gameconfig/gacha.xml?nocache=${Date.now()}");
  const text = await res.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, "text/xml");
  let tags = [...xml.querySelectorAll("Gacha")]
    .map(g => g.getAttribute("id"))
    .filter(id => id)
    .filter(id =>
      !id.startsWith("seasons") &&
      !id.startsWith("gachaboss")
    );
  tags.push("boss");
  tags = [...new Set(tags)];
  console.log("VR tags cargados:", tags);
  vrTags = tags;
}

Promise.all([loadMutants(), loadGachaTags()]).then(([mutantList]) => {
	mutants = mutantList;
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
	
	// Obtener los genes y convertirlos a minúsculas
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
	
	// Cargar todas las variaciones después de crear el modal
	loadAllVariations(code);
}

document.getElementById("overlay").addEventListener("click", () => {
	document.getElementById("overlay").classList.add("hidden");
	document.getElementById("modal").classList.add("hidden");
});

async function loadAllVariations(code) {
	const container = document.getElementById("modal-mutants");
	container.innerHTML = "";

	function checkImage(src) {
		return new Promise(resolve => {
			const img = new Image();
			img.onload = () => resolve(true);
			img.onerror = () => resolve(false);
			img.src = src;
		});
	}

	const normal = [];
	const versions = [null, null, null, null]; // V1, V2, V3, V4
	const hd = [];
	const hdVersions = [null, null, null, null];
	const skins = [];

	// 🧩 NORMAL BASE
	if (await checkImage(`PNG/${code}.png`)) {
		normal.push({
			src: `PNG/${code}.png`
		});
	}

	// ⭐ VERSIONES (ordenadas SIEMPRE)
	const versiones = [
		{ num: 1, img: "DATA/IMG/star_bronze.png" },
		{ num: 2, img: "DATA/IMG/star_silver.png" },
		{ num: 3, img: "DATA/IMG/star_gold.png" },
		{ num: 4, img: "DATA/IMG/star_platinum.png" }
	];

	for (let i = 0; i < versiones.length; i++) {
		const v = versiones[i];
		const src = `PNG/V${v.num}/${code}.png`;
		if (await checkImage(src)) {
			versions[i] = {
				src,
				version: v.img
			};
		}
	}

	// 🧩 HD BASE
	if (await checkImage(`PNG HD/${code}.png`)) {
		hd.push({
			src: `PNG HD/${code}.png`,
			tag: "DATA/IMG/tag_hd.png"
		});
	}

	// ⭐ HD VERSIONES
	for (let i = 0; i < versiones.length; i++) {
		const v = versiones[i];
		const src = `PNG HD/V${v.num}/${code}.png`;
		if (await checkImage(src)) {
			hdVersions[i] = {
				src,
				version: v.img,
				tag: "DATA/IMG/tag_hd.png"
			};
		}
	}

	// 🎰 SKINS (orden libre)
	for (let tag of vrTags) {
	const normalSrc = `PNG/VR/${code}_${tag}.png`;
	const hdSrc = `PNG HD/VR/${code}_${tag}.png`;

	const iconLocal = `DATA/IMG/icon_${tag}.png`;

	// Verificar icono SIEMPRE (independiente de si existe la skin)
	const iconExists = await checkImage(iconLocal);

	if (!iconExists) {
		console.warn(`⚠️ Falta icono de skin: ${tag} (${iconLocal})`);
	}

	// NORMAL
	if (await checkImage(normalSrc)) {
		skins.push({
			src: normalSrc,
			skinIcon: iconExists ? iconLocal : null
		});
	}

	// HD
	if (await checkImage(hdSrc)) {
		skins.push({
			src: hdSrc,
			tag: "DATA/IMG/tag_hd.png",
			skinIcon: iconExists ? iconLocal : null
		});
	}
}

	// 🧱 RENDER ORDENADO

function createDiv(data) {
	const div = document.createElement("div");
	div.className = "mutant";

	let html = `<img class="png" src="${data.src}">`;

	// ⭐ estrellas (bronce, plata, etc)
	if (data.version) {
		html += `<img class="version" src="${data.version}">`;
	}

	// 🎰 icono de skin (también es "version")
	if (data.skinIcon) {
		html += `<img class="version" src="${data.skinIcon}">`;
	}

	// 🟢 tag HD (único que usa class="tag")
	if (data.tag) {
		html += `<img class="tag" src="${data.tag}">`;
	}

	div.innerHTML = html;
	return div;
}

	// ORDEN EXACTO QUE QUIERES:

	// base
	normal.forEach(m => container.appendChild(createDiv(m)));

	// V1 → V4
	versions.forEach(m => {
		if (m) container.appendChild(createDiv(m));
	});

	// HD base
	hd.forEach(m => container.appendChild(createDiv(m)));

	// HD V1 → V4
	hdVersions.forEach(m => {
		if (m) container.appendChild(createDiv(m));
	});

	// skins (desorden permitido)
	skins.forEach(m => container.appendChild(createDiv(m)));

	console.log(`Variaciones ordenadas para ${code}`);
}

function addImageIfExists(container, src) {
	const img = new Image();
	img.src = src;

	img.onload = () => {
		const div = document.createElement("div");
		div.className = "mutant";
		div.innerHTML = `
		<img class="png" src="${src}">
		<img class="version" src="">`;
		container.appendChild(div);
	};
}
