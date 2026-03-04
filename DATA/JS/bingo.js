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
		if (code && name) map[code.trim()] = name.trim();
	});
	document.querySelectorAll('.name').forEach(el => {
		const code = el.textContent.trim();
		if (map[code]) {
			el.textContent = map[code];
		}
	});
})
.catch(err => console.error(err));

document.addEventListener('DOMContentLoaded', () => {

	function updateContainerVisibility(container) {
		const mutantsWrapper = container.querySelector('.mutants');
		if (!mutantsWrapper) return;
		const mutants = Array.from(mutantsWrapper.querySelectorAll('.mutant'));
		const anyVisible = mutants.some(m => !m.classList.contains('hidden'));
		if (anyVisible) container.classList.remove('hidden');
		else container.classList.add('hidden');
	}

	function loadImagesInBatches(images, batchSize = 5, delay = 300) {
		let index = 0;

		function loadBatch() {
			const batch = images.slice(index, index + batchSize);
			batch.forEach(img => {
				img.src = img.dataset.src;
			});
			index += batchSize;
			if (index < images.length) {
				setTimeout(loadBatch, delay);
			}
		}

		loadBatch();
	}

	const allImgs = Array.from(document.querySelectorAll('.mutant img'));
	allImgs.forEach(img => {
		img.dataset.src = img.src;
		img.removeAttribute('src');
	});

	loadImagesInBatches(allImgs, 2, 300);

	document.querySelectorAll('.container').forEach(container => {
		container.classList.add('hidden');
		const imgs = container.querySelectorAll('.mutant img');
		imgs.forEach(img => {
			const parentMutant = img.closest('.mutant');
			if (parentMutant) parentMutant.classList.add('hidden');

			img.addEventListener('load', () => {
				if (img.naturalWidth > 0) {
					parentMutant.classList.remove('hidden');
				} else {
					parentMutant.classList.add('hidden');
				}
				updateContainerVisibility(container);
				scaleSite();
			});

			img.addEventListener('error', () => {
				parentMutant.classList.add('hidden');
				updateContainerVisibility(container);
			});
		});
		updateContainerVisibility(container);
	});
});
