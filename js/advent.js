/* ==========================================================
   Les Étoiles de la Ligue 1 McDonald's — saison 2 (avent 2026)
   Prototype : calendrier + lecteur story 3 pages, comme les stories 2025
   (couverture → étoile révélée → contenu / CTA).
   ========================================================== */

const ADVENT_STORAGE_KEY = "l1-advent-2026-v1";
const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const L1_LOGO = "assets/logos/competitions/ligue1-mcdonalds.png";

// Pages d'une étoile. duration = défilement auto (ms) ; null = page interactive, pas de chrono.
const STORY_PAGES = [
  { id: "cover", duration: 8000 },
  { id: "reveal", duration: 4000 },
  { id: "content", duration: null },
];

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

// Prochaine étoile accessible pas encore ouverte (pour enchaîner comme des stories).
function nextUnopened(afterDay) {
  const max = Math.min(currentDay(), 24);
  for (let d = 1; d <= max; d++) {
    if (d !== afterDay && !advent.opened[d]) return d;
  }
  return null;
}

// ---------------- Score ----------------
function computeStats() {
  const openedCount = Object.keys(advent.opened).length;
  let points = openedCount * ADVENT_POINTS.open;
  points += Object.keys(advent.lots).length * ADVENT_POINTS.lotEntry;
  for (const [day, choice] of Object.entries(advent.quiz)) {
    if (dayData(Number(day)).answer === choice) points += ADVENT_POINTS.quizCorrect;
  }
  // Série : jours consécutifs ouverts jusqu'à aujourd'hui (hier si l'étoile du jour attend encore).
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

// ---------------- Étoile (SVG) ----------------
function starPoints(cx, cy, outer, inner) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}
const STAR_OUTER = starPoints(50, 54, 46, 20);
const STAR_INNER = starPoints(50, 54, 38, 16.5);

// Le dégradé or (#gold) est défini une seule fois dans advent.html.
function starSVG(day) {
  return `
    <svg class="star" viewBox="0 0 100 100" aria-hidden="true">
      <polygon class="star-outer" points="${STAR_OUTER}" />
      <polygon class="star-inner" points="${STAR_INNER}" />
      <text class="star-num" x="50" y="57">${day}</text>
    </svg>`;
}

// ---------------- Compte à rebours + CTA du hero ----------------
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

function renderHeroCta() {
  const btn = document.getElementById("hero-cta");
  const day = currentDay();
  btn.hidden = day < 1 || day > 24;
  if (!btn.hidden) btn.textContent = advent.opened[day] ? "Revoir l'étoile du jour" : "Ouvrir l'étoile du jour";
}

function renderCountdown() {
  const el = document.getElementById("countdown");
  const day = currentDay();
  const live = advent.demoDay === null;
  clearInterval(countdownTimer);

  if (day === 0) {
    const target = new Date(ADVENT_YEAR, 11, 1);
    const tick = () => { el.innerHTML = `<span class="cd-label">Première étoile dans</span><span class="cd-row">${countdownBlocks(target - new Date())}</span>`; };
    if (live) { tick(); countdownTimer = setInterval(tick, 1000); }
    else el.innerHTML = `<span class="cd-label">Première étoile le 1er décembre</span>`;
  } else if (day === 25) {
    el.innerHTML = `<span class="cd-label">C'est fini pour cette année. Les contenus restent dispo, rendez-vous en 2027 !</span>`;
  } else if (day === 24) {
    el.innerHTML = `<span class="cd-label">Dernière étoile : le gros lot t'attend. Joyeux Noël !</span>`;
  } else if (live) {
    const tick = () => {
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      el.innerHTML = `<span class="cd-label">Étoile n°${day + 1} dans</span><span class="cd-row">${countdownBlocks(midnight - now)}</span>`;
    };
    tick();
    countdownTimer = setInterval(tick, 1000);
  } else {
    el.innerHTML = `<span class="cd-label">Étoile n°${day + 1} demain, le ${day + 1} décembre</span>`;
  }
}

// ---------------- Grille ----------------
function tileState(day) {
  if (advent.opened[day]) return "opened";
  if (!isAvailable(day)) return "locked";
  return day === currentDay() ? "today" : "missed";
}

function tileAriaLabel(day, state) {
  const entry = dayData(day);
  if (state === "locked") return `Étoile ${day}, s'ouvre le ${day} décembre`;
  if (state === "opened") return `Étoile ${day}, ouverte : ${ADVENT_TYPES[entry.type].label}, ${entry.title}`;
  return `Étoile ${day}, à ouvrir${state === "today" ? " aujourd'hui" : ""}`;
}

function renderGrid() {
  const grid = document.getElementById("advent-grid");
  grid.innerHTML = "";
  for (const day of ADVENT_LAYOUT) {
    const entry = dayData(day);
    const club = clubOf(entry);
    const state = tileState(day);
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = `star-tile state-${state} type-${entry.type}${entry.big ? " tile-big" : ""}`;
    tile.dataset.day = day;
    tile.setAttribute("aria-label", tileAriaLabel(day, state));

    let tag = "";
    if (state === "today") tag = `<span class="tile-tag">Aujourd'hui</span>`;
    else if (state === "missed") tag = `<span class="tile-tag tile-tag-soft">À rattraper</span>`;
    else if (state === "locked") tag = `<span class="tile-lock" aria-hidden="true">🔒</span>`;

    const caption = state === "opened"
      ? `${ADVENT_TYPES[entry.type].icon} ${esc(entry.title)}`
      : "Les Étoiles";
    const crest = state === "opened" ? `<img class="tile-crest" src="${club ? club.logo : L1_LOGO}" alt="" loading="lazy" />` : "";

    tile.innerHTML = `${starSVG(day)}${crest}${tag}<span class="tile-caption" aria-hidden="true">${caption}</span>`;
    tile.addEventListener("click", () => onTileClick(day, tile));
    grid.appendChild(tile);
  }
}

function onTileClick(day, tile) {
  if (!isAvailable(day)) {
    tile.classList.remove("shake");
    void tile.offsetWidth; // relance l'animation
    tile.classList.add("shake");
    toast(`Patience ! Cette étoile s'ouvre le ${day} décembre.`);
    return;
  }
  // Depuis la grille, on saute la couverture : on arrive direct sur l'étoile révélée
  // (ou sur le contenu si elle est déjà ouverte).
  openStory(day, advent.opened[day] ? 2 : 1);
}

// ---------------- Lecteur story ----------------
const story = { day: null, index: 0, timer: null, lastFocus: null };

function openStory(day, startIndex = 0) {
  const el = document.getElementById("story");
  if (el.hidden) story.lastFocus = document.activeElement;
  story.day = day;
  advent.opened[day] = true;
  saveAdvent();
  renderStats();
  el.hidden = false;
  document.body.classList.add("modal-open");
  history.replaceState(null, "", urlWith({ case: day }));
  showPage(startIndex);
  document.getElementById("story-close").focus();
}

function closeStory() {
  const el = document.getElementById("story");
  if (el.hidden) return;
  clearTimeout(story.timer);
  el.hidden = true;
  document.body.classList.remove("modal-open");
  history.replaceState(null, "", urlWith({ case: null }));
  renderGrid();
  renderHeroCta();
  const tile = document.querySelector(`.star-tile[data-day="${story.day}"]`);
  (tile || story.lastFocus)?.focus?.();
}

function storyNext() {
  if (story.index < STORY_PAGES.length - 1) { showPage(story.index + 1); return; }
  const next = nextUnopened(story.day);
  if (next) openStory(next, 1);
  else closeStory();
}

function storyPrev() {
  if (story.index > 0) showPage(story.index - 1);
}

function showPage(index) {
  clearTimeout(story.timer);
  story.index = index;
  const page = STORY_PAGES[index];
  const entry = dayData(story.day);
  const club = clubOf(entry);
  const el = document.getElementById("story");
  el.style.setProperty("--club", club ? club.color : "#085FFF");
  el.querySelector(".story").setAttribute("aria-label", `Les Étoiles, ${story.day} décembre`);
  document.getElementById("story-day").textContent = `${story.day} déc.`;

  // Barres de progression
  document.getElementById("story-progress").innerHTML = STORY_PAGES.map((p, i) => {
    let cls = "seg";
    if (i < index || (i === index && !p.duration)) cls += " done";
    else if (i === index) cls += " running";
    const style = i === index && p.duration ? ` style="animation-duration:${p.duration}ms"` : "";
    return `<span class="${cls}"><span class="seg-fill"${style}></span></span>`;
  }).join("");

  const stage = document.getElementById("story-stage");
  stage.className = `story-stage page-${page.id}`;
  if (page.id === "cover") stage.innerHTML = renderCover(entry);
  else if (page.id === "reveal") stage.innerHTML = renderReveal(entry);
  else stage.innerHTML = renderContentPage(entry, club);
  bindPage(entry, club, stage);

  // Zones de tap gauche/droite uniquement sur les pages non interactives
  document.querySelectorAll(".story-tap").forEach((z) => { z.hidden = !page.duration; });

  if (page.duration) story.timer = setTimeout(storyNext, page.duration);
}

function renderCover(entry) {
  const label = entry.day === currentDay() ? "Ouvrir l'étoile du jour" : `Ouvrir l'étoile n°${entry.day}`;
  return `
    <div class="cover-bg" aria-hidden="true"></div>
    <div class="cover-title">
      <span class="cover-les">Les</span>
      <span class="cover-etoiles gold-text">Étoiles</span>
      <span class="cover-dela">de la</span>
      <img class="cover-logo" src="${L1_LOGO}" alt="Ligue 1 McDonald's" />
    </div>
    <p class="cover-date">${entry.day} décembre ${ADVENT_YEAR}</p>
    <button class="btn cover-cta" type="button" data-action="next">${label}</button>`;
}

function renderReveal(entry) {
  return `
    <div class="reveal-star">${starSVG(entry.day)}</div>
    <p class="reveal-cap">${ADVENT_TYPES[entry.type].icon} ${ADVENT_TYPES[entry.type].label}</p>`;
}

function renderContentPage(entry, club) {
  const type = ADVENT_TYPES[entry.type];
  const next = nextUnopened(entry.day);
  return `
    <div class="content-scroll">
      <div class="content-head">
        <img class="content-crest" src="${club ? club.logo : L1_LOGO}" alt="${club ? esc(club.name) : "Ligue 1 McDonald's"}" />
        <div>
          <p class="content-kicker">Étoile n°${entry.day} · ${type.icon} ${type.label}</p>
          <h2 id="story-title">${esc(entry.title)}</h2>
        </div>
      </div>
      <div class="content-body">${renderContent(entry, club)}</div>
    </div>
    <div class="content-foot">
      <button class="btn btn-ghost" type="button" data-action="prev" aria-label="Revoir l'étoile">‹</button>
      <button class="btn btn-ghost" type="button" data-action="share">Partager</button>
      <button class="btn btn-ghost" type="button" data-action="next">${next ? `Étoile n°${next} ›` : "Terminer"}</button>
    </div>`;
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
        ? `<p class="quiz-feedback">${chosen === entry.answer ? `Bien joué, +${ADVENT_POINTS.quizCorrect} points !` : "Raté, ce sera pour la prochaine !"} ${esc(entry.explain)}</p>`
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

function bindPage(entry, club, root) {
  root.querySelectorAll('[data-action="next"]').forEach((b) => b.addEventListener("click", storyNext));
  root.querySelector('[data-action="prev"]')?.addEventListener("click", storyPrev);
  root.querySelector('[data-action="share"]')?.addEventListener("click", () => shareDay(entry));

  root.querySelector('[data-action="participate"]')?.addEventListener("click", () => {
    advent.lots[entry.day] = true;
    saveAdvent();
    renderStats();
    toast(`Participation enregistrée, +${ADVENT_POINTS.lotEntry} points. Bonne chance !`);
    showPage(story.index);
  });

  root.querySelectorAll("[data-answer]").forEach((btn) => btn.addEventListener("click", () => {
    advent.quiz[entry.day] = Number(btn.dataset.answer);
    saveAdvent();
    renderStats();
    showPage(story.index);
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
  const text = `Étoile n°${entry.day} — Les Étoiles de la Ligue 1 McDonald's : ${entry.title}`;
  try {
    if (navigator.share) { await navigator.share({ title: "Les Étoiles de la Ligue 1 McDonald's", text, url }); return; }
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

function goldGradient(ctx, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, "#FBE7A1");
  g.addColorStop(0.35, "#E2B24F");
  g.addColorStop(0.6, "#9C6A1E");
  g.addColorStop(1, "#F3D27C");
  return g;
}

async function paintWallpaper(ctx, w, h, club) {
  // Fond bleu électrique façon stories "Les Étoiles"
  ctx.fillStyle = "#0647C9";
  ctx.fillRect(0, 0, w, h);
  const glow = ctx.createRadialGradient(w * 0.4, h * 0.3, 0, w * 0.4, h * 0.3, w * 1.1);
  glow.addColorStop(0, "#3B86FF");
  glow.addColorStop(1, "#0647C900");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Flocons fixes (graine stable pour un rendu identique à chaque export)
  const rng = mulberry32(2026);
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  for (let i = 0; i < 90; i++) {
    ctx.beginPath();
    ctx.arc(rng() * w, rng() * h, (rng() * 2 + 0.6) * (w / 540), 0, Math.PI * 2);
    ctx.fill();
  }

  // Étoile dorée
  const cx = w / 2, cy = h * 0.42, R = w * 0.44;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? R : R * 0.43;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
  }
  ctx.closePath();
  ctx.lineJoin = "round";
  ctx.lineWidth = w * 0.035;
  ctx.strokeStyle = goldGradient(ctx, cx - R, cy - R, cx + R, cy + R);
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = w * 0.03;
  ctx.stroke();
  ctx.shadowBlur = 0;

  const crest = await loadImage(club ? club.logo : L1_LOGO);
  if (crest) {
    const size = w * 0.26;
    const ratio = crest.width / crest.height;
    const cw = ratio >= 1 ? size : size * ratio;
    const ch = ratio >= 1 ? size / ratio : size;
    ctx.drawImage(crest, cx - cw / 2, cy + R * 0.12 - ch / 2, cw, ch);
  }

  ctx.textAlign = "center";
  ctx.font = `700 ${w * 0.14}px "Insatiable Display Compressed", sans-serif`;
  ctx.fillStyle = goldGradient(ctx, 0, h * 0.68, 0, h * 0.75);
  ctx.fillText("JOYEUX NOËL", w / 2, h * 0.74);
  ctx.font = `400 ${w * 0.045}px "GT America", sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText("Les Étoiles de la Ligue 1 McDonald's", w / 2, h * 0.79);

  const logo = await loadImage(L1_LOGO);
  if (logo && club) {
    const lw = w * 0.16;
    ctx.drawImage(logo, (w - lw) / 2, h * 0.87, lw, lw * (logo.height / logo.width));
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
    a.download = `fond-ecran-les-etoiles-${club ? club.id : "l1"}.png`;
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
  renderHeroCta();
}

// ---------------- Init ----------------
loadAdvent();
initDemo();
refresh();
startSnow();

document.getElementById("hero-cta").addEventListener("click", () => openStory(currentDay(), 0));
document.getElementById("story-close").addEventListener("click", closeStory);
document.getElementById("story-prev").addEventListener("click", storyPrev);
document.getElementById("story-next").addEventListener("click", storyNext);
document.getElementById("story").addEventListener("click", (e) => { if (e.target.id === "story") closeStory(); });
document.addEventListener("keydown", (e) => {
  if (document.getElementById("story").hidden) return;
  if (e.key === "Escape") closeStory();
  else if (e.key === "ArrowRight") storyNext();
  else if (e.key === "ArrowLeft") storyPrev();
});

// Lien partagé (?case=12) : la story démarre sur la couverture, comme en 2025.
const sharedCase = Number(new URLSearchParams(location.search).get("case"));
if (sharedCase >= 1 && sharedCase <= 24 && isAvailable(sharedCase)) openStory(sharedCase, 0);
