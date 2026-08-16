(function () {
  "use strict";

  const data = window.teamData;
  const escapeHTML = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  document.querySelectorAll("[data-team-name]").forEach((element) => {
    element.textContent = data.name;
  });
  document.title = `${data.name} | Equipo de trabajo`;

  const memberGrid = document.querySelector("#memberGrid");
  memberGrid.innerHTML = data.members.map((member) => {
    const profileAction = member.profileUrl
      ? `<a class="member-profile-action available" href="${escapeHTML(member.profileUrl)}">${escapeHTML(member.profileLabel || "Ver perfil y trayectoria")} <span aria-hidden="true">→</span></a>`
      : `<span class="member-profile-action pending">Trayectoria en preparación</span>`;
    return `
    <article class="member-card" data-tone="${escapeHTML(member.tone)}">
      <div class="member-top">
        <span class="member-avatar" aria-hidden="true">${escapeHTML(member.initials)}</span>
        <p class="member-role">${escapeHTML(member.role)}</p>
      </div>
      <h3>${escapeHTML(member.name)}</h3>
      <p class="member-subtitle">${escapeHTML(member.subtitle)}</p>
      <p class="member-summary">${escapeHTML(member.summary)}</p>
      <div class="member-experience"><b>Experiencia</b>${escapeHTML(member.experience)}</div>
      ${profileAction}
      <div class="skill-chips" aria-label="Áreas principales de ${escapeHTML(member.name)}">
        ${member.skills.map((skill) => `<span class="skill-chip">${escapeHTML(skill)}</span>`).join("")}
      </div>
    </article>
  `;
  }).join("");

  const projectGrid = document.querySelector("#projectGrid");
  projectGrid.innerHTML = data.projects.map((project) => `
    <article class="project-card">
      <div>
        <p class="eyebrow">${escapeHTML(project.label)}</p>
        <h3>${escapeHTML(project.name)}</h3>
        <p>${escapeHTML(project.description)}</p>
        <span class="project-status">${escapeHTML(project.status)}</span>
      </div>
      <div class="project-contributions" aria-label="Participación del equipo en ${escapeHTML(project.name)}">
        ${project.contributions.map(([area, contribution]) => `
          <div><b>${escapeHTML(area)}</b><span>${escapeHTML(contribution)}</span></div>
        `).join("")}
      </div>
    </article>
  `).join("");

  const menuButton = document.querySelector("#menuButton");
  const siteLinks = document.querySelector("#siteLinks");
  menuButton.addEventListener("click", () => {
    const isOpen = siteLinks.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.textContent = isOpen ? "✕" : "☰";
  });
  siteLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    siteLinks.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.textContent = "☰";
  }));
  document.addEventListener("click", (event) => {
    if (window.innerWidth <= 760 && !siteLinks.contains(event.target) && !menuButton.contains(event.target)) {
      siteLinks.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.textContent = "☰";
    }
  });

  document.querySelector("#year").textContent = new Date().getFullYear();
}());
