function scaleSite() {
	const baseWidth = 1265;
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

document.addEventListener('DOMContentLoaded', function () {
  const xmlUrl = 'https://s-beta.kobojo.com/mutants/gameconfig/dailypopup.xml';
  const container = document.querySelector('.popup-block');
  if (!container) {
    console.warn('No se encontró el contenedor .popup-block');
    return;
  }

  fetch(xmlUrl)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.text();
    })
    .then(xmlText => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      const offers = xmlDoc.getElementsByTagName('Offer');
      for (let offer of offers) {
        let imageValue = offer.getAttribute('image');
        if (imageValue) {
          const imagePath = imageValue.replace(/\$\$/g, '-en');
          const src = `https://s-beta.kobojo.com/mutants/assets/${imagePath}`;
          const img = document.createElement('img');
          img.className = 'popup';
          img.src = src;
          const filterEl = offer.getElementsByTagName('Filter')[0];
          const filterValue = filterEl ? filterEl.textContent.trim() : '';
          img.alt = filterValue || 'Oferta';
          container.appendChild(img);
        }
      }
    })
    .catch(error => {
      console.error('Error al cargar o procesar el XML:', error);
    });
});