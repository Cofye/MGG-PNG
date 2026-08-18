document.addEventListener("DOMContentLoaded", () => {
  const sections = [
    "arenas-pve",
    "arenas-raid",
    "arenas-valentines",
    "arenas-easter",
    "arenas-anniversary",
    "arenas-halloween",
    "arenas-xmas"
  ];

  sections.forEach((containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    const span = container.previousElementSibling;
    if (!span || span.tagName !== "SPAN" || !span.classList.contains("text")) {
      console.warn(`No se encontró un span antes de #${containerId}`);
      return;
    }

    const nameElements = container.querySelectorAll(".name");
    if (nameElements.length === 0) return;
    const fragment = document.createDocumentFragment();
    nameElements.forEach((nameEl) => {
      const id = nameEl.getAttribute("data-id");
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
      fragment.appendChild(block);
    });
    span.after(fragment);
  });
});