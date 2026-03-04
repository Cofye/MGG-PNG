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
					<img src="IMG/gene_${gen1}.png">
					${gen2 ? `<img src="IMG/gene_${gen2}.png">` : ""}
				</div>
				<span class="name">${displayName} - ${code}</span>
				<img class="big" src="IMG/bg_${gen1}.png">
				<img class="larva" src="https://s-beta.kobojo.com/mutants/assets/larvas/larva_${code.toLowerCase()}.png">
			</div>
			<div class="mutants" id="modal-mutants"></div>
		</div>
	`;
	loadAllVariations(code);
}

document.getElementById("overlay").addEventListener("click", () => {
	document.getElementById("overlay").classList.add("hidden");
	document.getElementById("modal").classList.add("hidden");
});

function loadAllVariations(code) {
	const container = document.getElementById("modal-mutants");
	container.innerHTML = "";
	addImageIfExists(container, `../../MGG/${code}.png`);
	for (let v = 1; v <= 4; v++) {
		addImageIfExists(container, `../../MGG/V${v}/${code}.png`);
	}
	vrTags.forEach(tag => {
		addImageIfExists(container, `../../MGG/VR/${code}_${tag}.png`);
	});
}

function addImageIfExists(container, src) {
	const img = new Image();
	img.src = src;

	img.onload = () => {
		const div = document.createElement("div");
		div.className = "mutant";
		div.innerHTML = `<img src="${src}">`;
		container.appendChild(div);
	};
}
