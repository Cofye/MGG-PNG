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

// Inicialización con carga prioritaria por viewport
document.addEventListener('DOMContentLoaded', () => {
	// Ocultar todas las etiquetas .tag inicialmente
	document.querySelectorAll('.tag').forEach(tag => tag.classList.add('hidden'));

	// Preparar cada mutante
	const mutants = Array.from(document.querySelectorAll('.mutant'));
	const mutantStateMap = new Map();

	mutants.forEach(mutant => {
		// Buscar la imagen (puede ser .png o .pnghd, solo una de ellas)
		const img = mutant.querySelector('.png, .pnghd');
		if (!img) return;

		// Guardar src original y quitar src para carga diferida
		if (!img.dataset.src && img.src) {
			img.dataset.src = img.src;
			img.removeAttribute('src');
		}
		// Ocultar la imagen inicialmente
		img.classList.add('hidden');

		// Crear loader
		const loader = document.createElement('img');
		loader.className = 'loader';
		loader.src = '../IMG/tab-loading.gif'; // Ajusta la ruta si es necesario
		loader.alt = 'loading';
		mutant.appendChild(loader);

		// Buscar tag (si existe)
		const tag = mutant.querySelector('.tag');

		const state = {
			mutant: mutant,
			loader: loader,
			img: img,
			tag: tag,
			resolved: false,
			isHd: img.classList.contains('pnghd')
		};
		mutantStateMap.set(mutant, state);
	});

	// Función para resolver el mutante (imagen cargada o error)
	function resolveMutant(state) {
		if (state.resolved) return;
		state.resolved = true;

		// Eliminar loader
		if (state.loader && state.loader.parentNode) {
			state.loader.remove();
		}

		// Mostrar la imagen si existe y ha cargado correctamente
		if (state.img && state.img.complete && state.img.naturalWidth > 0) {
			state.img.classList.remove('hidden');
			// Si es HD y tiene tag, mostrarlo
			if (state.isHd && state.tag) {
				state.tag.classList.remove('hidden');
			}
		} else if (state.img && state.img.src) {
			// Si hubo error o no cargó, ocultar el mutante completo
			state.mutant.classList.add('hidden');
		}
		scaleSite();
	}

	// Función para iniciar la carga de la imagen del mutante
	function startLoadingMutant(state) {
		if (state.resolved) return;
		if (state.img && state.img.dataset.src && !state.img.src) {
			state.img.src = state.img.dataset.src;
			// Eventos load/error para resolver
			state.img.onload = () => resolveMutant(state);
			state.img.onerror = () => resolveMutant(state);
		} else {
			// Si no hay imagen o ya tenía src, resolver inmediatamente
			resolveMutant(state);
		}
	}

	// Intersection Observer para cargar cuando el mutante entra en el viewport
	const observer = new IntersectionObserver((entries) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				const mutant = entry.target;
				const state = mutantStateMap.get(mutant);
				if (state && !state.resolved) {
					startLoadingMutant(state);
					// Dejar de observar para no disparar de nuevo
					observer.unobserve(mutant);
				}
			}
		});
	}, { threshold: 0.1, rootMargin: '200px' });

	// Observar todos los mutantes
	mutants.forEach(mutant => {
		if (mutantStateMap.has(mutant)) {
			observer.observe(mutant);
		}
	});

	// Carga en segundo plano: después de 3 segundos, cargar los que aún no empezaron
	setTimeout(() => {
		mutants.forEach(mutant => {
			const state = mutantStateMap.get(mutant);
			if (state && !state.resolved) {
				startLoadingMutant(state);
				observer.unobserve(mutant);
			}
		});
	}, 1500);
});