/* ==========================================================
   Les Étoiles de la Ligue 1 McDonald's — saison 2 (avent 2026)
   Front du calendrier : grille + lecteur story 3 pages
   (couverture → étoile révélée → contenu), branché sur AdventAPI.
   ========================================================== */

const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const L1_LOGO = "assets/logos/competitions/ligue1-mcdonalds.png";
const PARAMS = new URLSearchParams(location.search);
const EMBED = PARAMS.get("embed") === "app"; // intégration dans la webview de l'appli

// Pages d'une étoile. duration = défilement auto (ms) ; null = page interactive, pas de chrono.
const STORY_PAGES = [
  { id: "cover", duration: 8000 },
  { id: "reveal", duration: 4000 },
  { id: "content", duration: null },
];

const ui = {
  demoDay: null, // null = date réelle, sinon 0..25
  calendar: [], // réponse de getCalendar()
};

// ---------------- Dates ----------------
// 0 = avant le 1er décembre, 1..24 = jour en cours, 25 = après Noël.
// En prod, c'est le serveur qui fait foi (heure de Paris) ; le front ne sert qu'à l'affichage.
function realDay() {
  const now = new Date();
  const y = now.getFullYear();
  if (y < ADVENT_YEAR || (y === ADVENT_YEAR && now.getMonth() < 11)) return 0;
  if (y > ADVENT_YEAR || now.getDate() > 24) return 25;
  return now.getDate();
}

function currentDay() {
  return ui.demoDay === null ? realDay() : ui.demoDay;
}
AdventAPI.setClock(currentDay);

function calDay(day) {
  return ui.calendar.find((c) => c.day === day);
}

// Prochaine étoile accessible pas encore ouverte (pour enchaîner comme des stories).
function nextUnopened(afterDay) {
  const next = ui.calendar.find((c) => c.unlocked && !c.opened && c.day !== afterDay);
  return next ? next.day : null;
}

function clubOf(clubId) {
  return clubId ? getClub(clubId) : null;
}

// ---------------- Progression ----------------
async function renderStats() {
  const { openedCount, points, streak } = await AdventAPI.getProgress();
  document.getElementById("stat-opened").textContent = openedCount;
  document.getElementById("stat-streak").textContent = streak;
  document.getElementById("stat-points").textContent = points;
  document.getElementById("hero-progress-fill").style.width = `${(openedCount / 24) * 100}%`;
  document.getElementById("hero-progress-label").textContent =
    openedCount === 0 ? "Aucune étoile allumée pour l'instant" : `${openedCount} étoile${openedCount > 1 ? "s" : ""} allumée${openedCount > 1 ? "s" : ""} sur 24`;
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
      ${day ? `<text class="star-num" x="50" y="57">${day}</text>` : ""}
    </svg>`;
}

// ---------------- Hero : CTA, rappel, compte à rebours ----------------
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
  if (!btn.hidden) btn.textContent = calDay(day)?.opened ? "Revoir l'étoile du jour" : "Ouvrir l'étoile du jour";

  const reminder = document.getElementById("reminder-btn");
  const on = AdventAPI.getReminder();
  reminder.hidden = day > 23;
  reminder.setAttribute("aria-pressed", on);
  reminder.textContent = on ? "🔔 Rappel activé chaque matin" : "🔔 Me rappeler chaque jour";
}

function renderCountdown() {
  const el = document.getElementById("countdown");
  const day = currentDay();
  const live = ui.demoDay === null;
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
function tileState(c) {
  if (c.opened) return "opened";
  if (!c.unlocked) return "locked";
  return c.day === currentDay() ? "today" : "missed";
}

function tileAriaLabel(c, state) {
  if (state === "locked") return `Étoile ${c.day}, s'ouvre le ${c.day} décembre`;
  if (state === "opened") return `Étoile ${c.day}, ouverte : ${ADVENT_TYPES[c.type].label}, ${c.title}`;
  return `Étoile ${c.day}, à ouvrir${state === "today" ? " aujourd'hui" : ""}`;
}

function renderGrid() {
  const grid = document.getElementById("advent-grid");
  grid.innerHTML = "";
  for (const day of ADVENT_LAYOUT) {
    const c = calDay(day);
    const state = tileState(c);
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = `star-tile state-${state}${c.big ? " tile-big" : ""}`;
    tile.dataset.day = day;
    tile.setAttribute("aria-label", tileAriaLabel(c, state));

    let tag = "";
    if (state === "today") tag = `<span class="tile-tag">Aujourd'hui</span>`;
    else if (state === "missed") tag = `<span class="tile-tag tile-tag-soft">À rattraper</span>`;
    else if (state === "locked") tag = `<span class="tile-lock" aria-hidden="true">🔒</span>`;

    let caption = "Les Étoiles";
    let crest = "";
    if (state === "opened") {
      const club = clubOf(c.club);
      caption = `${ADVENT_TYPES[c.type].icon} ${esc(c.title)}`;
      crest = `<img class="tile-crest" src="${club ? club.logo : L1_LOGO}" alt="" loading="lazy" />`;
    }

    tile.innerHTML = `${starSVG(day)}${crest}${tag}<span class="tile-caption" aria-hidden="true">${caption}</span>`;
    tile.addEventListener("click", () => onTileClick(c, tile));
    grid.appendChild(tile);
  }
}

function onTileClick(c, tile) {
  if (!c.unlocked) {
    tile.classList.remove("shake");
    void tile.offsetWidth; // relance l'animation
    tile.classList.add("shake");
    toast(`Patience ! Cette étoile s'ouvre le ${c.day} décembre.`);
    return;
  }
  // Depuis la grille, on saute la couverture : on arrive direct sur l'étoile révélée
  // (ou sur le contenu si elle est déjà ouverte).
  openStory(c.day, c.opened ? 2 : 1);
}

// ---------------- Lecteur story ----------------
const story = { day: null, index: 0, data: null, timer: null, lastFocus: null };

async function openStory(day, startIndex = 0) {
  let data;
  try {
    data = await AdventAPI.openDay(day);
  } catch (e) {
    toast(e.message);
    return;
  }
  const el = document.getElementById("story");
  if (el.hidden) story.lastFocus = document.activeElement;
  story.day = day;
  story.data = data;
  el.hidden = false;
  document.body.classList.add("modal-open");
  history.replaceState(null, "", urlWith({ case: day }));
  await syncCalendar(); // l'étoile passe "ouverte" avant de calculer la suivante
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
  const entry = story.data.entry;
  const club = clubOf(entry.club);
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
  const label = story.data.isToday ? "Ouvrir l'étoile du jour" : `Ouvrir l'étoile n°${entry.day}`;
  return `
    <div class="cover-bg" aria-hidden="true">${starSVG()}</div>
    <div class="cover-title">
      <span class="cover-les">Les</span>
      <span class="cover-etoiles gold-text">Étoiles</span>
      <span class="cover-dela">de la</span>
      <img class="cover-logo" src="${L1_LOGO}" alt="Ligue 1 McDonald's" />
    </div>
    <p class="cover-date">Étoile n°${entry.day} · ${entry.day} décembre ${ADVENT_YEAR}</p>
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
          <h2>${esc(entry.title)}</h2>
        </div>
      </div>
      <div class="content-body">${renderContent(entry)}</div>
    </div>
    <div class="content-foot">
      <button class="btn btn-ghost" type="button" data-action="prev" aria-label="Revoir l'étoile">‹</button>
      <button class="btn btn-ghost" type="button" data-action="share">Partager</button>
      <button class="btn btn-ghost" type="button" data-action="next">${next ? `Étoile n°${next} ›` : "Terminer"}</button>
    </div>`;
}

function renderContent(entry) {
  const { isToday, participated, quiz } = story.data;
  switch (entry.type) {
    case "lot": {
      const closed = !isToday && !participated;
      const signedIn = !!AdventAPI.getUser();
      let label = "Je participe";
      if (participated) label = "Participation enregistrée ✓";
      else if (closed) label = "Concours terminé";
      else if (!signedIn) label = "Se connecter pour participer";
      return `
        <p>${esc(entry.text)}</p>
        <p class="meta">${entry.winners} gagnant${entry.winners > 1 ? "s" : ""} · tirage au sort le ${entry.day} décembre à minuit</p>
        <button class="btn btn-primary btn-wide" type="button" data-action="participate" ${participated || closed ? "disabled" : ""}>${label}</button>
        ${closed ? `<p class="meta">Ce concours n'était ouvert que le ${entry.day} décembre. Active le rappel pour ne plus en rater.</p>` : ""}
        <p class="fine">Jeu gratuit sans obligation d'achat, une participation par compte. Règlement complet à venir (prototype).</p>`;
    }
    case "quiz": {
      const opts = entry.options.map((o, i) => {
        let cls = "quiz-opt";
        if (quiz && i === quiz.answer) cls += " correct";
        else if (quiz && i === quiz.choice) cls += " wrong";
        return `<button class="${cls}" type="button" data-answer="${i}" ${quiz ? "disabled" : ""}>${esc(o)}</button>`;
      }).join("");
      const feedback = quiz
        ? `<p class="quiz-feedback">${quiz.correct ? `Bien joué, +${ADVENT_POINTS.quizCorrect} points !` : "Raté, ce sera pour la prochaine !"} ${esc(quiz.explain)}</p>`
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

  root.querySelector('[data-action="participate"]')?.addEventListener("click", async () => {
    if (!AdventAPI.getUser()) {
      openSignIn("Connecte-toi pour participer au tirage au sort.", () => showPage(story.index));
      return;
    }
    try {
      await AdventAPI.participate(entry.day);
      story.data.participated = true;
      toast(`Participation enregistrée, +${ADVENT_POINTS.lotEntry} points. Bonne chance !`);
      renderStats();
      showPage(story.index);
    } catch (e) {
      toast(e.message);
    }
  });

  root.querySelectorAll("[data-answer]").forEach((btn) => btn.addEventListener("click", async () => {
    root.querySelectorAll("[data-answer]").forEach((b) => { b.disabled = true; });
    story.data.quiz = await AdventAPI.answerQuiz(entry.day, Number(btn.dataset.answer));
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

// ---------------- Compte (connexion simulée) ----------------
let signInCallback = null;

function openSignIn(reason, onDone) {
  signInCallback = onDone || null;
  document.getElementById("signin-reason").textContent = reason;
  document.getElementById("signin").hidden = false;
  document.getElementById("signin-go").focus();
}

function closeSignIn() {
  document.getElementById("signin").hidden = true;
  signInCallback = null;
}

function renderAccount() {
  const btn = document.getElementById("account-btn");
  const user = AdventAPI.getUser();
  btn.textContent = user ? `👤 ${user.name}` : "Se connecter";
  btn.setAttribute("aria-label", user ? `Connecté en tant que ${user.name}, se déconnecter` : "Se connecter");
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

  const fromUrl = PARAMS.get("jour");
  if (fromUrl !== null && /^\d+$/.test(fromUrl) && Number(fromUrl) <= 25) ui.demoDay = Number(fromUrl);
  select.value = ui.demoDay === null ? "real" : String(ui.demoDay);

  select.addEventListener("change", () => {
    ui.demoDay = select.value === "real" ? null : Number(select.value);
    history.replaceState(null, "", urlWith({ jour: ui.demoDay }));
    refresh();
  });

  document.getElementById("demo-reset").addEventListener("click", () => {
    AdventAPI.resetDemo();
    AdventAPI.signOut();
    renderAccount();
    refresh();
    toast("Progression et compte remis à zéro.");
  });
}

// ---------------- Utils ----------------
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

async function syncCalendar() {
  ui.calendar = await AdventAPI.getCalendar();
  renderStats();
}

async function refresh() {
  await syncCalendar();
  renderGrid();
  renderCountdown();
  renderHeroCta();
}

// ---------------- Init ----------------
async function init() {
  if (EMBED) document.body.classList.add("embed");
  initDemo();
  renderAccount();
  startSnow();
  await refresh();

  document.getElementById("hero-cta").addEventListener("click", () => openStory(currentDay(), 0));
  document.getElementById("reminder-btn").addEventListener("click", async () => {
    const on = !AdventAPI.getReminder();
    await AdventAPI.setReminder(on);
    renderHeroCta();
    toast(on
      ? (EMBED ? "C'est noté : une notif chaque matin à 9h jusqu'à Noël." : "C'est noté : un rappel chaque matin à 9h jusqu'à Noël.")
      : "Rappel désactivé.");
  });
  document.getElementById("account-btn").addEventListener("click", () => {
    if (AdventAPI.getUser()) {
      AdventAPI.signOut();
      renderAccount();
      toast("Tu es déconnecté.");
    } else {
      openSignIn("Retrouve ta progression sur le site et l'appli, et participe aux tirages au sort.");
    }
  });
  document.getElementById("signin-go").addEventListener("click", async () => {
    await AdventAPI.signIn();
    renderAccount();
    const cb = signInCallback;
    closeSignIn();
    toast("Connecté, bienvenue !");
    cb?.();
  });
  document.getElementById("signin-later").addEventListener("click", closeSignIn);

  document.getElementById("story-close").addEventListener("click", closeStory);
  document.getElementById("story-prev").addEventListener("click", storyPrev);
  document.getElementById("story-next").addEventListener("click", storyNext);
  document.getElementById("story").addEventListener("click", (e) => { if (e.target.id === "story") closeStory(); });
  document.addEventListener("keydown", (e) => {
    if (!document.getElementById("signin").hidden) { if (e.key === "Escape") closeSignIn(); return; }
    if (document.getElementById("story").hidden) return;
    if (e.key === "Escape") closeStory();
    else if (e.key === "ArrowRight") storyNext();
    else if (e.key === "ArrowLeft") storyPrev();
  });

  // Lien partagé (?case=12) : la story démarre sur la couverture, comme en 2025.
  const sharedCase = Number(PARAMS.get("case"));
  if (sharedCase >= 1 && sharedCase <= 24 && sharedCase <= currentDay()) openStory(sharedCase, 0);
}

init();
