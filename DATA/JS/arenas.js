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

document.addEventListener("DOMContentLoaded", () => {
	const arenaList = document.getElementById("arenas-list");
	const scaleContainer = document.getElementById("scale-container");
	const arenas = arenaList.querySelectorAll(".name");
	arenas.forEach(arena => {
		const id = arena.getAttribute("data-id");
		const bg = `https://s-beta.kobojo.com/mutants/assets/hud/dungeons_selection/bg_${id}.png`;
		const title = `https://s-beta.kobojo.com/mutants/assets/pveeventcontent/title_${id}.png`;
		const arenaImg = `https://s-beta.kobojo.com/mutants/assets/arenas/${id}.jpg`;
		const screen = `https://s-beta.kobojo.com/mutants/assets/pveeventcontent/screen_${id}.jpg`;
		const block = document.createElement("div");
		block.className = "arena-block";
		block.innerHTML = `
			<img class="logo" src="${title}">
			<img class="banner" src="${bg}">
			<img class="arena" src="${arenaImg}">
			<img class="arena" src="${screen}">
		`;
		scaleContainer.insertAdjacentElement("beforeend", block);
	});
});
