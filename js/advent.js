/* ==========================================================
   Calendrier de l'avent 2026 — Ligue 1 McDonald's (prototype)
   ========================================================== */

const ADVENT_STORAGE_KEY = "l1-advent-2026-v1";
const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const advent = {
  opened: {}, // day -> true
  lots: {}, // day -> true (participation enregistrée)
  quiz: {}, // day -> index de la réponse choisie
  demoDay: null, // null = date réelle, sinon 0..25
};

// ---------------- Persistence ----------------
function saveAdvent() {
  try {
    localStorage.setItem(ADVENT_STORAGE_KEY, JSON.stringify({ opened: advent.opened, lots: advent.lots, quiz: advent.quiz }));
  } catch (e) {
    /* stockage indisponible (mode privé, quota) — la session continue sans sauvegarde */
  }
}

function loadAdvent() {
  try {
    const data = JSON.parse(localStorage.getItem(ADVENT_STORAGE_KEY) || "{}");
    advent.opened = data.opened || {};
    advent.lots = data.lots || {};
    advent.quiz = data.quiz || {};
  } catch (e) {
    /* données absentes ou corrompues : on repart de zéro */
  }
}

// ---------------- Dates ----------------
// 0 = avant le 1er décembre, 1..24 = jour en cours, 25 = après Noël.
function realDay() {
  const now = new Date();
  const y = now.getFullYear();
  if (y < ADVENT_YEAR || (y === ADVENT_YEAR && now.getMonth() < 11)) return 0;
  if (y > ADVENT_YEAR || now.getDate() > 24) return 25;
  return now.getDate();
}

function currentDay() {
  return advent.demoDay === null ? realDay() : advent.demoDay;
}

function dayData(day) {
  return ADVENT_DAYS.find((d) => d.day === day);
}

function clubOf(entry) {
  return entry.club ? getClub(entry.club) : null;
}

function isAvailable(day) {
  return day <= currentDay();
}

// ---------------- Score ----------------
function computeStats() {
  const openedCount = Object.keys(advent.opened).length;
  let points = openedCount * ADVENT_POINTS.open;
  points += Object.keys(advent.lots).length * ADVENT_POINTS.lotEntry;
  for (const [day, choice] of Object.entries(advent.quiz)) {
    if (dayData(Number(day)).answer === choice) points += ADVENT_POINTS.quizCorrect;
  }
  // Série : jours consécutifs ouverts jusqu'à aujourd'hui (hier si la case du jour attend encore).
  const today = Math.min(currentDay(), 24);
  let d = advent.opened[today] ? today : today - 1;
  let streak = 0;
  while (d >= 1 && advent.opened[d]) { streak++; d--; }
  return { openedCount, points, streak };
}

function renderStats() {
  const { openedCount, points, streak } = computeStats();
  document.getElementById("stat-opened").textContent = openedCount;
  document.getElementById("stat-streak").textContent = streak;
  document.getElementById("stat-points").textContent = points;
}

// ---------------- Compte à rebours ----------------
let countdownTimer = null;

function pad(n) { return String(n).padStart(2, "0"); }

function countdownBlocks(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const parts = [
    [Math.floor(s / 86400), "j"],
    [Math.floor((s % 86400) / 3600), "h"],
    [Math.floor((s % 3600) / 60), "min"],
    [s % 60, "s"],
  ];
  return parts.map(([v, u]) => `<span class="cd-block"><b>${pad(v)}</b><small>${u}</small></span>`).join("");
}

function renderCountdown() {
  const el = document.getElementById("countdown");
  const day = currentDay();
  const live = advent.demoDay === null;
  clearInterval(countdownTimer);

  if (day === 0) {
    const target = new Date(ADVENT_YEAR, 11, 1);
    const tick = () => { el.innerHTML = `<span class="cd-label">Première case dans</span><span class="cd-row">${countdownBlocks(target - new Date())}</span>`; };
    if (live) { tick(); countdownTimer = setInterval(tick, 1000); }
    else el.innerHTML = `<span class="cd-label">Ouverture de la première case le 1er décembre</span>`;
  } else if (day === 25) {
    el.innerHTML = `<span class="cd-label">C'est fini pour cette année. Les contenus restent dispo, rendez-vous en 2027 !</span>`;
  } else if (day === 24) {
    el.innerHTML = `<span class="cd-label">Dernière case : le gros lot t'attend. Joyeux Noël !</span>`;
  } else if (live) {
    const tick = () => {
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      el.innerHTML = `<span class="cd-label">Case n°${day + 1} dans</span><span class="cd-row">${countdownBlocks(midnight - now)}</span>`;
    };
    tick();
    countdownTimer = setInterval(tick, 1000);
  } else {
    el.innerHTML = `<span class="cd-label">Case n°${day + 1} demain, le ${day + 1} décembre</span>`;
  }
}

// ---------------- Grille ----------------
function doorState(day) {
  if (advent.opened[day]) return "opened";
  if (!isAvailable(day)) return "locked";
  return day === currentDay() ? "today" : "missed";
}

function doorAriaLabel(day, state) {
  const entry = dayData(day);
  if (state === "locked") return `Case ${day}, s'ouvre le ${day} décembre`;
  if (state === "opened") return `Case ${day}, ouverte : ${ADVENT_TYPES[entry.type].label}, ${entry.title}`;
  return `Case ${day}, à ouvrir${state === "today" ? " aujourd'hui" : ""}`;
}

function renderGrid() {
  const grid = document.getElementById("advent-grid");
  grid.innerHTML = "";
  for (const day of ADVENT_LAYOUT) {
    const entry = dayData(day);
    const club = clubOf(entry);
    const state = doorState(day);
    const door = document.createElement("button");
    door.type = "button";
    door.className = `door state-${state} type-${entry.type}${entry.big ? " door-big" : ""}`;
    door.dataset.day = day;
    door.style.setProperty("--club", club ? club.color : "var(--blue)");
    door.setAttribute("aria-label", doorAriaLabel(day, state));

    const crest = club ? club.logo : "assets/logos/competitions/ligue1-mcdonalds.png";
    let tag = "";
    if (state === "today") tag = `<span class="door-tag">Aujourd'hui</span>`;
    else if (state === "missed") tag = `<span class="door-tag door-tag-soft">À rattraper</span>`;
    else if (state === "locked") tag = `<span class="door-lock" aria-hidden="true">🔒</span>`;

    door.innerHTML = `
      <span class="door-inner" aria-hidden="true">
        <img class="door-crest" src="${crest}" alt="" loading="lazy" />
        <span class="door-type">${ADVENT_TYPES[entry.type].icon} ${ADVENT_TYPES[entry.type].label}</span>
        <span class="door-title">${esc(entry.title)}</span>
      </span>
      <span class="door-front" aria-hidden="true">
        <span class="door-num">${day}</span>
        <span class="door-month">déc.</span>
        ${tag}
      </span>`;
    door.addEventListener("click", () => onDoorClick(day, door));
    grid.appendChild(door);
  }
}

function onDoorClick(day, door) {
  if (!isAvailable(day)) {
    door.classList.remove("shake");
    void door.offsetWidth; // relance l'animation
    door.classList.add("shake");
    toast(`Patience ! Cette case s'ouvre le ${day} décembre.`);
    return;
  }
  if (advent.opened[day]) { openModal(day); return; }

  advent.opened[day] = true;
  saveAdvent();
  renderStats();
  door.className = door.className.replace(/state-\w+/, "state-opened") + " opening";
  door.setAttribute("aria-label", doorAriaLabel(day, "opened"));
  setTimeout(() => openModal(day), REDUCED_MOTION ? 0 : 750);
}

// ---------------- Fenêtre de contenu ----------------
let lastFocus = null;
let modalDay = null;

function openModal(day) {
  const entry = dayData(day);
  const club = clubOf(entry);
  const body = document.getElementById("modal-body");
  const modal = document.getElementById("modal");
  const type = ADVENT_TYPES[entry.type];

  modal.style.setProperty("--club", club ? club.color : "var(--blue)");
  body.innerHTML = `
    <div class="modal-head">
      <img class="modal-crest" src="${club ? club.logo : "assets/logos/competitions/ligue1-mcdonalds.png"}" alt="${club ? esc(club.name) : "Ligue 1 McDonald's"}" />
      <div>
        <p class="modal-kicker">${day} décembre · ${type.icon} ${type.label}</p>
        <h2 id="modal-title">${esc(entry.title)}</h2>
      </div>
    </div>
    <div class="modal-content">${renderContent(entry, club)}</div>
    <div class="modal-foot">
      <button class="btn btn-ghost" type="button" data-action="share">Partager</button>
    </div>`;
  bindContent(entry, club, body);

  if (modal.hidden) lastFocus = document.activeElement;
  modalDay = day;
  modal.hidden = false;
  document.body.classList.add("modal-open");
  document.getElementById("modal-close").focus();
  history.replaceState(null, "", urlWith({ case: day }));
}

function closeModal() {
  const modal = document.getElementById("modal");
  if (modal.hidden) return;
  modal.hidden = true;
  document.body.classList.remove("modal-open");
  history.replaceState(null, "", urlWith({ case: null }));
  renderGrid();
  const door = document.querySelector(`.door[data-day="${modalDay}"]`);
  (door || lastFocus)?.focus?.();
}

function renderContent(entry, club) {
  const today = entry.day === currentDay();
  switch (entry.type) {
    case "lot": {
      const done = advent.lots[entry.day];
      const closed = !today && !done;
      const label = done ? "Participation enregistrée ✓" : closed ? "Concours terminé" : "Je participe";
      return `
        <p>${esc(entry.text)}</p>
        <p class="meta">${entry.winners} gagnant${entry.winners > 1 ? "s" : ""} · tirage au sort le ${entry.day} décembre à minuit</p>
        <button class="btn btn-primary btn-wide" type="button" data-action="participate" ${done || closed ? "disabled" : ""}>${label}</button>
        ${closed ? `<p class="meta">Ce concours n'était ouvert que le ${entry.day} décembre. Reviens chaque jour pour ne rien rater.</p>` : ""}
        <p class="fine">Jeu gratuit sans obligation d'achat. Règlement complet à venir (prototype).</p>`;
    }
    case "quiz": {
      const chosen = advent.quiz[entry.day];
      const answered = chosen !== undefined;
      const opts = entry.options.map((o, i) => {
        let cls = "quiz-opt";
        if (answered && i === entry.answer) cls += " correct";
        else if (answered && i === chosen) cls += " wrong";
        return `<button class="${cls}" type="button" data-answer="${i}" ${answered ? "disabled" : ""}>${esc(o)}</button>`;
      }).join("");
      const feedback = answered
        ? `<p class="quiz-feedback ${chosen === entry.answer ? "ok" : "ko"}">${chosen === entry.answer ? `Bien joué, +${ADVENT_POINTS.quizCorrect} points !` : "Raté, ce sera pour la prochaine !"} ${esc(entry.explain)}</p>`
        : `<p class="meta">Une seule tentative. Bonne réponse = +${ADVENT_POINTS.quizCorrect} points.</p>`;
      return `<p class="quiz-question">${esc(entry.question)}</p><div class="quiz-opts">${opts}</div>${feedback}`;
    }
    case "promo":
      return `
        <p class="promo-partner">${esc(entry.partner)}</p>
        <p>${esc(entry.text)}</p>
        <div class="promo-code">
          <code>${esc(entry.code)}</code>
          <button class="btn btn-confirm" type="button" data-action="copy">Copier</button>
        </div>
        <p class="meta">${esc(entry.validity)}</p>
        <p class="fine">Offre fictive pour le prototype, à valider avec le partenaire.</p>`;
    case "exclusif":
      if (entry.media === "wallpaper") {
        return `
          <p>${esc(entry.text)}</p>
          <div class="wallpaper-preview"><canvas data-role="wallpaper" width="270" height="480"></canvas></div>
          <button class="btn btn-primary btn-wide" type="button" data-action="wallpaper">Télécharger le fond d'écran</button>`;
      }
      return `
        <button class="video-placeholder" type="button" data-action="play" aria-label="Lire la vidéo">
          <span class="play">▶</span><span class="duration">${esc(entry.duration)}</span>
        </button>
        <p>${esc(entry.text)}</p>`;
  }
  return "";
}

function bindContent(entry, club, root) {
  root.querySelector('[data-action="share"]').addEventListener("click", () => shareDay(entry));

  root.querySelector('[data-action="participate"]')?.addEventListener("click", () => {
    advent.lots[entry.day] = true;
    saveAdvent();
    renderStats();
    toast(`Participation enregistrée, +${ADVENT_POINTS.lotEntry} points. Bonne chance !`);
    openModal(entry.day);
  });

  root.querySelectorAll("[data-answer]").forEach((btn) => btn.addEventListener("click", () => {
    advent.quiz[entry.day] = Number(btn.dataset.answer);
    saveAdvent();
    renderStats();
    openModal(entry.day);
  }));

  root.querySelector('[data-action="copy"]')?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(entry.code);
      toast(`Code ${entry.code} copié !`);
    } catch (e) {
      toast(`Ton code : ${entry.code}`);
    }
  });

  root.querySelector('[data-action="play"]')?.addEventListener("click", () => {
    toast("Vidéo à brancher sur le player officiel (prototype).");
  });

  const canvas = root.querySelector('[data-role="wallpaper"]');
  if (canvas) {
    drawWallpaper(canvas, club);
    root.querySelector('[data-action="wallpaper"]').addEventListener("click", () => downloadWallpaper(club));
  }
}

async function shareDay(entry) {
  const url = location.origin + location.pathname + `?case=${entry.day}`;
  const text = `Case n°${entry.day} du calendrier de l'avent Ligue 1 McDonald's : ${entry.title}`;
  try {
    if (navigator.share) { await navigator.share({ title: "Calendrier de l'avent Ligue 1 McDonald's", text, url }); return; }
    await navigator.clipboard.writeText(`${text} ${url}`);
    toast("Lien copié, à toi de le partager !");
  } catch (e) {
    /* partage annulé par l'utilisateur */
  }
}

// ---------------- Fond d'écran généré ----------------
function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function paintWallpaper(ctx, w, h, club) {
  const color = club ? club.color : "#085FFF";
  ctx.fillStyle = "#262626";
  ctx.fillRect(0, 0, w, h);
  const glow = ctx.createRadialGradient(w / 2, h * 0.42, 0, w / 2, h * 0.42, w * 0.9);
  glow.addColorStop(0, color + "cc");
  glow.addColorStop(1, "#26262600");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Flocons fixes (graine stable pour un rendu identique à chaque export)
  const rng = mulberry32(2026);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  for (let i = 0; i < 90; i++) {
    ctx.beginPath();
    ctx.arc(rng() * w, rng() * h, (rng() * 2 + 0.6) * (w / 540), 0, Math.PI * 2);
    ctx.fill();
  }

  const crest = await loadImage(club ? club.logo : "assets/logos/competitions/ligue1-mcdonalds.png");
  if (crest) {
    const size = w * 0.42;
    const ratio = crest.width / crest.height;
    const cw = ratio >= 1 ? size : size * ratio;
    const ch = ratio >= 1 ? size / ratio : size;
    ctx.drawImage(crest, (w - cw) / 2, h * 0.42 - ch / 2, cw, ch);
  }

  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.font = `700 ${w * 0.13}px "Insatiable Display Compressed", sans-serif`;
  ctx.fillText("JOYEUX NOËL", w / 2, h * 0.72);
  ctx.font = `400 ${w * 0.045}px "GT America", sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillText("Calendrier de l'avent 2026", w / 2, h * 0.77);

  const logo = await loadImage("assets/logos/competitions/ligue1-mcdonalds.png");
  if (logo && club) {
    const lw = w * 0.16;
    ctx.drawImage(logo, (w - lw) / 2, h * 0.86, lw, lw * (logo.height / logo.width));
  }
}

async function drawWallpaper(canvas, club) {
  await paintWallpaper(canvas.getContext("2d"), canvas.width, canvas.height, club);
}

async function downloadWallpaper(club) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  await paintWallpaper(canvas.getContext("2d"), canvas.width, canvas.height, club);
  try {
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `fond-ecran-noel-ligue1-${club ? club.id : "l1"}.png`;
    a.click();
  } catch (e) {
    // Canvas "taché" quand la page est ouverte en file:// : il faut la servir en http.
    toast("Téléchargement indisponible hors serveur web (prototype).");
  }
}

// ---------------- Toast ----------------
let toastTimer = null;
function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2800);
}

// ---------------- Neige ----------------
function startSnow() {
  const canvas = document.getElementById("snow");
  if (REDUCED_MOTION) { canvas.remove(); return; }
  const ctx = canvas.getContext("2d");
  let flakes = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const count = Math.round(Math.min(90, canvas.width / 14));
    flakes = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.6,
      vy: Math.random() * 0.5 + 0.25,
      drift: Math.random() * Math.PI * 2,
    }));
  }

  function frame() {
    if (!document.hidden) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      for (const f of flakes) {
        f.y += f.vy;
        f.drift += 0.01;
        f.x += Math.sin(f.drift) * 0.3;
        if (f.y > canvas.height + 4) { f.y = -4; f.x = Math.random() * canvas.width; }
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);
  resize();
  frame();
}

// ---------------- Mode démo ----------------
function urlWith(changes) {
  const params = new URLSearchParams(location.search);
  for (const [k, v] of Object.entries(changes)) {
    if (v === null || v === undefined) params.delete(k);
    else params.set(k, v);
  }
  const q = params.toString();
  return location.pathname + (q ? `?${q}` : "");
}

function initDemo() {
  const select = document.getElementById("demo-day");
  const options = [["real", "Date réelle"], ["0", "Avant le 1er déc."]];
  for (let d = 1; d <= 24; d++) options.push([String(d), `${d} décembre`]);
  options.push(["25", "Après Noël"]);
  select.innerHTML = options.map(([v, l]) => `<option value="${v}">${l}</option>`).join("");

  const fromUrl = new URLSearchParams(location.search).get("jour");
  if (fromUrl !== null && /^\d+$/.test(fromUrl) && Number(fromUrl) <= 25) advent.demoDay = Number(fromUrl);
  select.value = advent.demoDay === null ? "real" : String(advent.demoDay);

  select.addEventListener("change", () => {
    advent.demoDay = select.value === "real" ? null : Number(select.value);
    history.replaceState(null, "", urlWith({ jour: advent.demoDay }));
    refresh();
  });

  document.getElementById("demo-reset").addEventListener("click", () => {
    advent.opened = {};
    advent.lots = {};
    advent.quiz = {};
    saveAdvent();
    refresh();
    toast("Progression remise à zéro.");
  });
}

// ---------------- Utils ----------------
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function refresh() {
  renderGrid();
  renderStats();
  renderCountdown();
}

// ---------------- Init ----------------
loadAdvent();
initDemo();
refresh();
startSnow();

document.getElementById("modal-close").addEventListener("click", closeModal);
document.getElementById("modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

// Lien direct vers une case (?case=12) : on ouvre si elle est déjà accessible.
const sharedCase = Number(new URLSearchParams(location.search).get("case"));
if (sharedCase >= 1 && sharedCase <= 24 && isAvailable(sharedCase)) {
  advent.opened[sharedCase] = true;
  saveAdvent();
  refresh();
  openModal(sharedCase);
}
