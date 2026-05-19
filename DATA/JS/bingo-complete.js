function scaleSite() {
	const baseWidth = 1840;
	const scale = window.innerWidth / baseWidth;
	const container = document.getElementById("scale-container");
	if (!container) return;
	container.style.transform = `scale(${scale})`;
	container.style.transformOrigin = "top left";
	const containerRect = container.getBoundingClientRect();
	const allDesc = Array.from(container.querySelectorAll("*"));
	let maxBottom = 0;
	allDesc.forEach(el => {
		if (el === container) return;
		if (el.classList && el.classList.contains("hidden")) return;
		const style = getComputedStyle(el);
		if (style.display === "none" || style.visibility === "hidden") return;
		const r = el.getBoundingClientRect();
		if (r.width === 0 && r.height === 0) return;
		const bottomRel = r.bottom - containerRect.top;
		if (bottomRel > maxBottom) maxBottom = bottomRel;
	});
	let unscaledHeight;
	if (maxBottom > 0) {
		unscaledHeight = maxBottom / scale;
	} else {
		unscaledHeight = container.scrollHeight || (containerRect.height / scale);
	}
	const finalHeight = Math.ceil(unscaledHeight * scale);
	container.style.height = finalHeight + "px";
}

document.addEventListener("DOMContentLoaded", scaleSite);
window.addEventListener("resize", scaleSite);
window.addEventListener("load", scaleSite);

function scaleLoaderContainer() {
    const container = document.getElementById("loader-container");
    if (!container) return;
    container.style.width = window.innerWidth + "px";
    container.style.height = window.innerHeight + "px";
    container.style.transform = "";
}

document.addEventListener("DOMContentLoaded", scaleLoaderContainer);
window.addEventListener("resize", scaleLoaderContainer);
window.addEventListener("load", scaleLoaderContainer);

// Carga por lotes con retraso (para imágenes en segundo plano)
function loadImagesInBatches(images, batchSize = 5, delay = 300) {
	let index = 0;
	function loadBatch() {
		const batch = images.slice(index, index + batchSize);
		batch.forEach(img => {
			if (img.dataset.src) {
				img.src = img.dataset.src;
			}
		});
		index += batchSize;
		if (index < images.length) {
			setTimeout(loadBatch, delay);
		}
	}
	loadBatch();
}

// Función principal que se ejecuta después de cargar la localización
function initAfterLocalization(localizationMap) {
	// --- Ocultar el loader global porque vamos a empezar a cargar los mutantes ---
	const loaderContainer = document.getElementById("loader-container");
	if (loaderContainer) loaderContainer.style.display = "none";

	const containers = Array.from(document.querySelectorAll('.container'));
	const visibleContainers = [];
	containers.forEach(container => {
		const nameSpan = container.querySelector('.name');
		if (!nameSpan) {
			container.classList.add('hidden');
			return;
		}
		const code = nameSpan.textContent.trim().toLowerCase();
		if (localizationMap[code]) {
			nameSpan.textContent = localizationMap[code];
			container.classList.remove('hidden');
			visibleContainers.push(container);
		} else {
			container.classList.add('hidden');
		}
	});
	const mutants = [];
	visibleContainers.forEach(container => {
		const containerMutants = Array.from(container.querySelectorAll('.mutant'));
		mutants.push(...containerMutants);
	});
	if (mutants.length === 0) {
		scaleSite();
		return;
	}
	// 1. Preparar todas las imágenes .png y .pnghd dentro de esos mutantes
	const allImages = [];
	mutants.forEach(mutant => {
		const pngs = Array.from(mutant.querySelectorAll('.png'));
		const pnghds = Array.from(mutant.querySelectorAll('.pnghd'));
		allImages.push(...pngs, ...pnghds);
	});
	// Guardar src original y quitar src para carga diferida
	allImages.forEach(img => {
		if (!img.dataset.src && img.src) {
			img.dataset.src = img.src;
			img.removeAttribute('src');
		}
		img.classList.add('hidden');
	});
	// Ocultar tags inicialmente
	mutants.forEach(mutant => {
		const tags = mutant.querySelectorAll('.tag');
		tags.forEach(tag => tag.classList.add('hidden'));
	});
	// Crear estado y loader para cada mutante visible
	const mutantStateMap = new Map();
	mutants.forEach(mutant => {
		const loader = document.createElement('img');
		loader.className = 'loader';
		loader.src = '../IMG/tab-loading.gif';
		loader.alt = 'loading';
		mutant.appendChild(loader);
		const png = mutant.querySelector('.png');
		const pnghd = mutant.querySelector('.pnghd');
		const tag = mutant.querySelector('.tag');
		const state = {
			mutant: mutant,
			loader: loader,
			tag: tag,
			png: png,
			pnghd: pnghd,
			resolved: false,
			pngLoaded: false,
			pnghdLoaded: false,
			pngFailed: false,
			pnghdFailed: false,
			loadingStarted: false
		};
		mutantStateMap.set(mutant, state);
	});
	function resolveMutant(state, winnerType) {
		if (state.resolved) return;
		state.resolved = true;
		if (state.loader && state.loader.parentNode) {
			state.loader.remove();
		}
		if (winnerType === 'png' && state.png) {
			state.png.classList.remove('hidden');
		} else if (winnerType === 'pnghd' && state.pnghd) {
			state.pnghd.classList.remove('hidden');
			if (state.tag) state.tag.classList.remove('hidden');
		} else if (winnerType === null) {
			state.mutant.classList.add('hidden');
		}
		scaleSite();
	}
	// Función para iniciar la carga de las imágenes de un mutante
	function startLoadingMutant(state) {
		if (state.loadingStarted) return;
		state.loadingStarted = true;
		if (state.png && state.png.dataset.src) {
			state.png.src = state.png.dataset.src;
		}
		if (state.pnghd && state.pnghd.dataset.src) {
			state.pnghd.src = state.pnghd.dataset.src;
		}
	}
	// Asignar eventos load/error
	allImages.forEach(img => {
		const mutant = img.closest('.mutant');
		if (!mutant) return;
		const state = mutantStateMap.get(mutant);
		if (!state) return;
		let type = null;
		if (img.classList.contains('png')) type = 'png';
		else if (img.classList.contains('pnghd')) type = 'pnghd';
		if (!type) return;
		const loadHandler = () => {
			if (state.resolved) return;
			if (type === 'png') state.pngLoaded = true;
			else state.pnghdLoaded = true;
			resolveMutant(state, type);
		};
		const errorHandler = () => {
			if (state.resolved) return;
			if (type === 'png') state.pngFailed = true;
			else state.pnghdFailed = true;
			if ((state.pngFailed || !state.png) && (state.pnghdFailed || !state.pnghd)) {
				resolveMutant(state, null);
			}
		};
		img.addEventListener('load', loadHandler);
		img.addEventListener('error', errorHandler);
	});
	// Priorización por viewport
	const observer = new IntersectionObserver((entries) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				const mutant = entry.target;
				const state = mutantStateMap.get(mutant);
				if (state && !state.resolved && !state.loadingStarted) {
					startLoadingMutant(state);
				}
			}
		});
	}, { threshold: 0.1, rootMargin: '200px' });
	mutants.forEach(mutant => {
		observer.observe(mutant);
	});
	// Carga en segundo plano después de 3 segundos
	setTimeout(() => {
		mutants.forEach(mutant => {
			const state = mutantStateMap.get(mutant);
			if (state && !state.resolved && !state.loadingStarted) {
				startLoadingMutant(state);
			}
		});
	}, 1500);
}

// Inicialización principal
document.addEventListener('DOMContentLoaded', () => {
	document.querySelectorAll('.container').forEach(container => {
		container.classList.add('hidden');
	});
	fetch(`https://s-beta.kobojo.com/mutants/gameconfig/localisation_es.txt?nocache=${Date.now()}`)
		.then(res => {
			if (!res.ok) throw new Error('No se pudo cargar localisation_es.txt');
			return res.text();
		})
		.then(text => {
			const map = {};
			text.split(/\r?\n/).forEach(line => {
				if (!line) return;
				const [code, name] = line.split(';');
				if (code && name) {
					const normalizedCode = code.trim().toLowerCase();
					map[normalizedCode] = name.trim();
				}
			});
			initAfterLocalization(map);
		})
		.catch(err => {
			console.error(err);
			const loaderContainer = document.getElementById("loader-container");
			if (loaderContainer) loaderContainer.style.display = "none";
			scaleSite();
		});
});