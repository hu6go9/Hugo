/* ==========================================================
   Compos Ligue 1 — prototype front-end (mock data)
   ========================================================== */

const STORAGE_KEY = "l1-composer-state-v1";
const CATS = ["GK", "DEF", "MID", "ATT"];

const state = {
  compo: {
    competition: "l1",
    activeClub: CLUBS_L1[0].id,
    byClub: {}, // clubId -> { formation, assignments: { slotCode: playerId } }
    step: "competition", // "competition" | "pick" (choix du club) | "squad" (effectif + terrain) — step jamais persisté
  },
};

function defaultCompo() {
  return { formation: "4-3-3", assignments: {} };
}

// ---------------- Persistence ----------------
function saveState() {
  const payload = { compo: state.compo };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    flashSaved();
  } catch (e) {
    /* stockage indisponible (mode privé, quota) — on ignore silencieusement */
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data.compo) {
      state.compo.byClub = data.compo.byClub || {};
      state.compo.competition = COMPETITIONS[data.compo.competition] ? data.compo.competition : "l1";
      state.compo.activeClub = data.compo.activeClub || COMPETITIONS[state.compo.competition].clubs[0].id;
    }
  } catch (e) {
    /* ignore */
  }
}

let saveTimer = null;
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveState, 250);
}

function flashSaved() {
  const el = document.getElementById("save-indicator");
  if (!el) return;
  el.classList.add("show");
  clearTimeout(flashSaved._t);
  flashSaved._t = setTimeout(() => {}, 800);
}

// ---------------- Helpers ----------------
function playerById(id) {
  return PLAYERS.find((p) => p.id === id);
}
function initials(p) {
  return (p.firstName[0] + p.lastName[0]).toUpperCase();
}

// Confirmation en deux clics, sans window.confirm() (bloqué/inerte dans
// certains contextes intégrés) : premier clic -> le bouton passe en mode
// "Confirmer ?", second clic dans les 3s -> exécute l'action.
function initConfirmButton(btn, defaultLabel, onConfirm) {
  let timer = null;
  const reset = () => {
    clearTimeout(timer);
    timer = null;
    btn.textContent = defaultLabel;
    btn.classList.remove("btn-confirm");
  };
  btn.addEventListener("click", () => {
    if (timer) {
      reset();
      onConfirm();
      return;
    }
    btn.textContent = "Confirmer ?";
    btn.classList.add("btn-confirm");
    timer = setTimeout(reset, 3000);
  });
}

// ==========================================================
// COMPO 11 PAR CLUB
// ==========================================================
function currentCompo() {
  if (!state.compo.byClub[state.compo.activeClub]) {
    state.compo.byClub[state.compo.activeClub] = defaultCompo();
  }
  return state.compo.byClub[state.compo.activeClub];
}

function renderCompetitionPicker() {
  const wrap = document.getElementById("competition-picker-grid");
  wrap.innerHTML = "";
  Object.values(COMPETITIONS).forEach((comp) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "competition-card" + (comp.id === state.compo.competition ? " current" : "");
    card.innerHTML = `<img class="competition-logo" src="${comp.logo}" alt="${comp.name}" onerror="this.style.display='none'" /><span class="competition-name">${comp.name}</span>`;
    card.addEventListener("click", () => {
      card.classList.add("picked");
      setTimeout(() => {
        state.compo.competition = comp.id;
        state.compo.step = "pick";
        scheduleSave();
        renderCompoView();
      }, 200);
    });
    wrap.appendChild(card);
  });
}

function renderClubPicker() {
  const wrap = document.getElementById("club-picker-grid");
  wrap.innerHTML = "";
  const hasChosen = Object.keys(state.compo.byClub).length > 0;
  COMPETITIONS[state.compo.competition].clubs.forEach((club) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "club-picker-card" + (hasChosen && club.id === state.compo.activeClub ? " current" : "");
    card.innerHTML = `<img class="club-logo" src="${club.logo}" alt="${club.name}" /><span class="club-name">${club.name}</span>`;
    card.addEventListener("click", () => {
      // Petit "pop" de confirmation dans la couleur du club avant de
      // basculer sur l'effectif — léger retour visuel sur le choix.
      card.style.setProperty("--pick-color", club.color);
      card.classList.add("picked");
      setTimeout(() => {
        state.compo.activeClub = club.id;
        state.compo.step = "squad";
        scheduleSave();
        renderCompoView();
      }, 200);
    });
    wrap.appendChild(card);
  });
}

function renderFormationSelect() {
  const select = document.getElementById("formation-select");
  select.innerHTML = Object.keys(FORMATIONS)
    .map((key) => `<option value="${key}">${FORMATIONS[key].label}</option>`)
    .join("");
  select.value = currentCompo().formation;
}

function avatarColor() {
  return getClub(state.compo.activeClub).color;
}

const DESKTOP_LAYOUT_QUERY = window.matchMedia("(min-width: 901px)");
const PITCH_MIN_HEIGHT = 480; // en dessous, le terrain devient trop petit pour rester lisible

// Borne la hauteur du terrain à l'espace visible sous son point de départ,
// pour qu'il tienne toujours entier à l'écran (jamais besoin de scroller
// la page pour atteindre les attaquants ou les gardiens).
function syncPitchHeight() {
  const pitch = document.getElementById("pitch");
  if (!pitch) return;
  if (!DESKTOP_LAYOUT_QUERY.matches) {
    pitch.style.height = "";
    return;
  }
  pitch.style.height = ""; // repart de la taille naturelle pour mesurer l'espace réellement disponible
  const rect = pitch.getBoundingClientRect();
  if (rect.height <= 0) return; // pas encore visible
  const budget = window.innerHeight - rect.top - 20;
  const target = Math.max(PITCH_MIN_HEIGHT, Math.min(rect.height, budget));
  pitch.style.height = target + "px";
}

function syncRosterHeight() {
  const roster = document.getElementById("roster-list");
  const pitchWrap = document.getElementById("pitch-wrap");
  if (!roster || !pitchWrap) return;
  syncPitchHeight();
  if (DESKTOP_LAYOUT_QUERY.matches) {
    // Aligne le bas de la liste sur le bas du terrain (et non sa hauteur brute) :
    // les deux panneaux n'ont pas le même contenu au-dessus (en-tête club,
    // bouton "Changer de club"...), donc caler juste la hauteur du terrain
    // pouvait faire déborder la liste hors de l'écran.
    const pitchWrapBottom = pitchWrap.getBoundingClientRect().bottom;
    const rosterTop = roster.getBoundingClientRect().top;
    const height = pitchWrapBottom - rosterTop;
    if (height <= 0) return; // pitch pas encore visible/rendu : on ne casse pas la hauteur déjà en place
    roster.style.maxHeight = height + "px";
    roster.style.overflowY = "auto";
  } else {
    roster.style.maxHeight = "";
    roster.style.overflowY = "";
  }
}

function buildPitchSlots(pitchEl, compo, color, { interactive } = { interactive: true }) {
  const formation = FORMATIONS[compo.formation];
  pitchEl.querySelectorAll(".pitch-slot").forEach((el) => el.remove());

  formation.slots.forEach((slot) => {
    const category = POSITIONS[slot.pos].category;
    const playerId = compo.assignments[slot.code];
    const player = playerId ? playerById(playerId) : null;
    const el = document.createElement("div");
    el.className = "pitch-slot " + (player ? "filled" : "empty");
    el.style.top = slot.top + "%";
    el.style.left = slot.left + "%";
    el.dataset.slotCode = slot.code;
    el.dataset.category = category;

    if (player) {
      const outOfPosition = player.category !== category;
      el.classList.toggle("out-of-position", outOfPosition);
      const badge = outOfPosition ? `<span class="oop-badge" title="Hors poste naturel (${player.pos})">${player.pos}</span>` : "";
      el.innerHTML = `<div class="avatar" style="background:${color}">${initials(player)}</div><div class="slot-name">${player.name}</div>${badge}`;
      if (interactive) el.addEventListener("pointerdown", (e) => startDrag(e, { type: "slot", slotCode: slot.code, player }));
    } else {
      el.innerHTML = `<div class="slot-label">${slot.pos}</div>`;
    }
    pitchEl.appendChild(el);
  });
}

function renderPitch() {
  buildPitchSlots(document.getElementById("pitch"), currentCompo(), avatarColor());
}

function renderRoster() {
  const wrap = document.getElementById("roster-list");
  wrap.innerHTML = "";
  const compo = currentCompo();
  const usedIds = new Set(Object.values(compo.assignments));
  const roster = playersByClub(state.compo.activeClub);
  const color = avatarColor();

  CATS.forEach((cat) => {
    const players = roster.filter((p) => p.category === cat);
    if (!players.length) return;
    const label = document.createElement("div");
    label.className = "roster-cat-label";
    label.textContent = CATEGORY_LABELS[cat];
    wrap.appendChild(label);
    players.forEach((p) => {
      const used = usedIds.has(p.id);
      const card = document.createElement("div");
      card.className = "player-card" + (used ? " disabled" : "");
      card.innerHTML = `
        <div class="avatar" style="background:${color}">${initials(p)}</div>
        <div class="player-meta"><div class="name">${p.fullName}</div><div class="sub">${p.age} ans</div></div>
        <span class="pos-tag">${p.pos}</span>
      `;
      if (!used) {
        card.addEventListener("pointerdown", (e) => startDrag(e, { type: "roster", player: p }));
      }
      wrap.appendChild(card);
    });
  });
}

// Personnalise aux couleurs du club ce qui est propre au club (bouton
// principal, focus, avatars joueurs via avatarColor()...) — scoppé à
// l'élément donné pour ne pas déteindre sur l'écran de choix du club.
// Le terrain lui-même reste volontairement à couleur fixe (--pitch,
// définie une fois pour toutes dans :root), il n'est pas personnalisé.
// Luminance relative (WCAG) pour choisir un texte blanc ou charbon lisible
// par-dessus la couleur du club (ex: le jaune de Nantes a besoin de texte foncé).
function relativeLuminance(hex) {
  const rgb = hex.replace("#", "").match(/.{2}/g).map((h) => parseInt(h, 16) / 255);
  const lin = rgb.map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

function applyClubTheme(club, el) {
  el.style.setProperty("--accent", club.color);
  el.style.setProperty("--accent-contrast", relativeLuminance(club.color) > 0.45 ? "#1a1a1a" : "#ffffff");
}

function renderActiveClubHeaders() {
  const club = getClub(state.compo.activeClub);
  const html = `<img src="${club.logo}" alt="${club.name}" /><span>${club.name}</span>`;
  document.getElementById("roster-club-header").innerHTML = html;
  document.getElementById("pitch-club-header").innerHTML = html;
  applyClubTheme(club, document.getElementById("compo-layout"));
}

// Construit une image de partage dédiée (pas une capture de l'UI en direct) :
// habillage brand complet, pensée pour être reconnaissable sur les réseaux.
function renderShareCard() {
  const club = getClub(state.compo.activeClub);
  const compo = currentCompo();
  const competition = COMPETITIONS[state.compo.competition];
  const card = document.getElementById("share-card");
  applyClubTheme(club, card);
  const crest = document.getElementById("share-card-crest");
  crest.style.backgroundImage = `url("${club.logo}"), radial-gradient(circle at 32% 28%, #ffffff, #e7e7e7 78%)`;
  crest.style.borderColor = club.color;
  document.getElementById("share-card-logo").style.backgroundImage = `url("${competition.logo}")`;
  document.getElementById("share-card-club-name").textContent = club.name;
  document.getElementById("share-card-formation").textContent = FORMATIONS[compo.formation].label;
  document.getElementById("share-card-sub").textContent = `${competition.name} · prototype, données fictives`;
  buildPitchSlots(document.getElementById("share-card-pitch"), compo, avatarColor(), { interactive: false });
}

function renderCompoView() {
  const atCompetition = state.compo.step === "competition";
  const atPicking = state.compo.step === "pick";
  document.getElementById("competition-picker").style.display = atCompetition ? "block" : "none";
  document.getElementById("club-picker").style.display = atPicking ? "block" : "none";
  document.getElementById("compo-layout").style.display = state.compo.step === "squad" ? "grid" : "none";
  renderCompetitionPicker();
  if (atCompetition) return;

  renderClubPicker();
  if (atPicking) return;

  renderActiveClubHeaders();
  renderFormationSelect();
  renderPitch();
  renderRoster();
  syncRosterHeight();
}

function initCompoControls() {
  document.getElementById("formation-select").addEventListener("change", (e) => {
    currentCompo().formation = e.target.value;
    currentCompo().assignments = {};
    scheduleSave();
    renderCompoView();
  });
  initConfirmButton(document.getElementById("compo-reset"), "Réinitialiser", () => {
    currentCompo().assignments = {};
    scheduleSave();
    renderCompoView();
  });
  document.getElementById("compo-share").addEventListener("click", () => {
    // Ouverture synchrone (au clic) pour éviter que le navigateur bloque
    // la fenêtre une fois l'export (asynchrone) terminé.
    const shareWindow = window.open("", "_blank");
    renderShareCard();
    shareElement(document.getElementById("share-card"), `compo-${state.compo.activeClub}.png`, shareWindow);
  });
  document.getElementById("change-club-btn").addEventListener("click", () => {
    state.compo.step = "pick";
    renderCompoView();
  });
  document.getElementById("change-competition-btn").addEventListener("click", () => {
    state.compo.step = "competition";
    renderCompoView();
  });
}

// ---------------- Drag & drop (pointer events, souris + tactile) ----------------
let dragState = null;

function startDrag(e, source) {
  e.preventDefault();
  const ghost = document.createElement("div");
  ghost.className = "drag-ghost";
  const color = avatarColor();
  ghost.innerHTML = `<div class="avatar" style="background:${color};width:52px;height:52px;font-size:1rem;box-shadow:0 6px 16px rgba(0,0,0,.4)">${initials(source.player)}</div>`;
  document.body.appendChild(ghost);
  positionGhost(ghost, e.clientX, e.clientY);

  dragState = {
    source,
    ghost,
    startX: e.clientX,
    startY: e.clientY,
    moved: false,
  };

  const move = (ev) => {
    dragState.moved = dragState.moved || Math.hypot(ev.clientX - dragState.startX, ev.clientY - dragState.startY) > 6;
    positionGhost(ghost, ev.clientX, ev.clientY);
    updateDragOverHighlight(ev.clientX, ev.clientY);
  };
  const up = (ev) => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
    ghost.remove();
    clearDragOverHighlight();
    handleDrop(ev.clientX, ev.clientY);
    dragState = null;
  };
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
}

function positionGhost(ghost, x, y) {
  ghost.style.left = x + "px";
  ghost.style.top = y + "px";
}

function canPlaceInSlot(playerCategory, slotCategory) {
  // Liberté totale entre postes de champ (DEF/MID/ATT) pour les placements créatifs.
  // Seul le gardien reste réservé aux gardiens, par réalisme.
  if (playerCategory === "GK" || slotCategory === "GK") {
    return playerCategory === slotCategory;
  }
  return true;
}

function slotUnderPoint(x, y) {
  const el = document.elementFromPoint(x, y);
  return el ? el.closest(".pitch-slot") : null;
}

function updateDragOverHighlight(x, y) {
  clearDragOverHighlight();
  const slot = slotUnderPoint(x, y);
  if (slot) slot.classList.add("dragover");
}
function clearDragOverHighlight() {
  document.querySelectorAll(".pitch-slot.dragover").forEach((s) => s.classList.remove("dragover"));
}

function handleDrop(x, y) {
  if (!dragState) return;
  const { source, moved } = dragState;
  const compo = currentCompo();
  const pitchContainer = document.getElementById("pitch");

  // Clic simple sur un slot rempli -> désassigner
  if (!moved && source.type === "slot") {
    delete compo.assignments[source.slotCode];
    scheduleSave();
    renderCompoView();
    return;
  }
  if (!moved) return;

  const targetSlotEl = slotUnderPoint(x, y);

  if (source.type === "roster") {
    if (!targetSlotEl) return;
    const category = targetSlotEl.dataset.category;
    if (!canPlaceInSlot(source.player.category, category)) return;
    const slotCode = targetSlotEl.dataset.slotCode;
    compo.assignments[slotCode] = source.player.id;
  } else if (source.type === "slot") {
    if (!targetSlotEl) {
      delete compo.assignments[source.slotCode];
    } else {
      const targetCode = targetSlotEl.dataset.slotCode;
      const targetCategory = targetSlotEl.dataset.category;
      if (targetCode === source.slotCode) return;
      if (!canPlaceInSlot(source.player.category, targetCategory)) return;
      const targetPlayerId = compo.assignments[targetCode];
      if (targetPlayerId) {
        const targetPlayer = playerById(targetPlayerId);
        const sourceCategory = pitchContainer.querySelector(`[data-slot-code="${source.slotCode}"]`)?.dataset.category;
        if (!canPlaceInSlot(targetPlayer.category, sourceCategory)) return;
      }
      compo.assignments[targetCode] = source.player.id;
      if (targetPlayerId) compo.assignments[source.slotCode] = targetPlayerId;
      else delete compo.assignments[source.slotCode];
    }
  }
  scheduleSave();
  renderCompoView();
}

// ---------------- Partage (export image) ----------------
// `targetWindow` est un onglet déjà ouvert (de façon synchrone, au clic) où
// afficher l'image une fois l'export terminé : ouvrir un nouvel onglet APRÈS
// un traitement asynchrone est bloqué par la plupart des navigateurs.
async function shareElement(el, filename, targetWindow) {
  const abort = (message) => {
    if (targetWindow && !targetWindow.closed) {
      targetWindow.document.write(`<p style="font:16px sans-serif;padding:24px;">${message}</p>`);
    }
  };
  if (typeof html2canvas === "undefined") {
    abort("Export indisponible (librairie non chargée).");
    return;
  }
  try {
    const canvas = await html2canvas(el, { backgroundColor: "#262626", scale: 2 });
    canvas.toBlob(async (blob) => {
      if (!blob) {
        abort("Export impossible.");
        return;
      }
      const file = new File([blob], filename, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          if (targetWindow && !targetWindow.closed) targetWindow.close();
          await navigator.share({ files: [file], title: "Ma composition Ligue 1" });
          return;
        } catch (e) {
          /* annulé ou non supporté -> fallback nouvel onglet */
        }
      }
      const url = URL.createObjectURL(blob);
      if (targetWindow && !targetWindow.closed) {
        targetWindow.location.href = url;
      } else {
        window.open(url, "_blank");
      }
    }, "image/png");
  } catch (e) {
    abort("Export impossible.");
  }
}

// ==========================================================
// INIT
// ==========================================================
function init() {
  loadState();
  initCompoControls();
  renderCompoView();

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(syncRosterHeight, 120);
  });
}

document.addEventListener("DOMContentLoaded", init);
