/* ==========================================================
   Composeur d'équipe Ligue 1 — prototype front-end (mock data)
   ========================================================== */

const STORAGE_KEY = "l1-composer-state-v1";
const CATS = ["GK", "DEF", "MID", "ATT"];
const CATEGORY_SHORT = { GK: "G", DEF: "DEF", MID: "MIL", ATT: "ATT" };
const QUOTAS = {
  23: { GK: 3, DEF: 7, MID: 7, ATT: 6 },
  26: { GK: 3, DEF: 8, MID: 8, ATT: 7 },
};

const state = {
  activeTab: "groupe",
  groupe: {
    squadSize: 26,
    selectedIds: new Set(),
    search: "",
    filterCat: "GK",
    subTab: "pool",
    screen: "landing", // "landing" (choix groupe/onze) ou "workspace" — jamais persisté
  },
  compo: {
    activeClub: CLUBS[0].id,
    byClub: {}, // clubId -> { formation, assignments: { slotCode: playerId } }
    step: "pick", // "pick" (choix du club) ou "squad" (effectif + terrain) — jamais persisté
  },
  franceCompo: { formation: "4-3-3", assignments: {} },
};

function defaultCompo() {
  return { formation: "4-3-3", assignments: {} };
}

// ---------------- Persistence ----------------
function saveState() {
  const payload = {
    groupe: {
      squadSize: state.groupe.squadSize,
      selectedIds: Array.from(state.groupe.selectedIds),
    },
    compo: state.compo,
    franceCompo: state.franceCompo,
  };
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
    if (data.groupe) {
      state.groupe.squadSize = data.groupe.squadSize || 26;
      state.groupe.selectedIds = new Set(data.groupe.selectedIds || []);
    }
    if (data.compo) {
      state.compo.byClub = data.compo.byClub || {};
      state.compo.activeClub = data.compo.activeClub || CLUBS[0].id;
    }
    if (data.franceCompo) {
      state.franceCompo = data.franceCompo;
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
function clubColor(clubId) {
  return getClub(clubId)?.color || "#334";
}

// ==========================================================
// TAB SWITCHING
// ==========================================================
function initTabs() {
  document.querySelectorAll("nav.tabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.activeTab = btn.dataset.tab;
      document.querySelectorAll("nav.tabs button").forEach((b) => b.classList.toggle("active", b === btn));
      document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.id === "view-" + btn.dataset.tab));
      if (btn.dataset.tab === "compo") {
        state.compo.step = "pick";
        renderCompoView();
      }
      if (btn.dataset.tab === "groupe") {
        state.groupe.screen = "landing";
        renderGroupeScreen();
      }
    });
  });
}

// ==========================================================
// VUE 1 : SÉLECTION DE GROUPE
// ==========================================================
function groupeQuotas() {
  return QUOTAS[state.groupe.squadSize];
}

function groupeCounts() {
  const counts = { GK: 0, DEF: 0, MID: 0, ATT: 0 };
  state.groupe.selectedIds.forEach((id) => {
    const p = playerById(id);
    if (p) counts[p.category]++;
  });
  return counts;
}

function groupeProgress() {
  const quotas = groupeQuotas();
  const counts = groupeCounts();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const totalMax = Object.values(quotas).reduce((a, b) => a + b, 0);
  return { total, totalMax, remaining: Math.max(0, totalMax - total), complete: total >= totalMax };
}

function renderQuotaBar() {
  const quotas = groupeQuotas();
  const counts = groupeCounts();
  const wrap = document.getElementById("quota-row");
  wrap.innerHTML = "";
  CATS.forEach((cat) => {
    const full = counts[cat] >= quotas[cat];
    const current = cat === state.groupe.filterCat;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "quota-card" + (full ? " full" : "") + (current ? " current" : "");
    btn.innerHTML = `
      <div class="label">${CATEGORY_LABELS[cat]}</div>
      <div class="count">${counts[cat]} / ${quotas[cat]}</div>
      <div class="bar"><span style="width:${Math.min(100, (counts[cat] / quotas[cat]) * 100)}%"></span></div>
    `;
    btn.addEventListener("click", () => setGroupeStep(cat));
    wrap.appendChild(btn);
  });
  const { total, totalMax } = groupeProgress();
  document.getElementById("groupe-total").textContent = `${total} / ${totalMax} joueurs sélectionnés`;
}

function renderProgressFloat() {
  const quotas = groupeQuotas();
  const counts = groupeCounts();
  const { total, totalMax, remaining, complete } = groupeProgress();

  document.getElementById("progress-float-value").textContent = `${total}/${totalMax}`;
  document.getElementById("progress-float-sub").textContent = complete
    ? "Groupe complet"
    : `${remaining} joueur${remaining > 1 ? "s" : ""} restant${remaining > 1 ? "s" : ""}`;
  document.getElementById("groupe-progress-float").classList.toggle("complete", complete);

  document.getElementById("progress-float-cats").innerHTML = CATS.map((cat) => {
    const full = counts[cat] >= quotas[cat];
    const current = cat === state.groupe.filterCat ? " current" : "";
    return `<button type="button" class="progress-cat${full ? " full" : ""}${current}" data-cat="${cat}"><span class="cat-code">${CATEGORY_SHORT[cat]}</span><span class="cat-count">${counts[cat]}/${quotas[cat]}</span></button>`;
  }).join("");
  document.querySelectorAll("#progress-float-cats .progress-cat").forEach((btn) => {
    btn.addEventListener("click", () => setGroupeStep(btn.dataset.cat));
  });
}

function filteredGroupePlayers() {
  const { search, filterCat } = state.groupe;
  return PLAYERS.filter((p) => {
    if (p.category !== filterCat) return false;
    if (search && !p.fullName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
}

function renderGroupePool() {
  const grid = document.getElementById("groupe-grid");
  grid.innerHTML = "";
  const quotas = groupeQuotas();
  const counts = groupeCounts();
  const players = filteredGroupePlayers();

  players.forEach((p) => {
    const selected = state.groupe.selectedIds.has(p.id);
    const catFull = counts[p.category] >= quotas[p.category];
    const disabled = !selected && catFull;
    const card = document.createElement("div");
    card.className = "player-card" + (selected ? " selected" : "") + (disabled ? " disabled" : "");
    card.innerHTML = `
      <div class="avatar" style="background:${FRANCE_COLOR}">${initials(p)}</div>
      <div class="player-meta">
        <div class="name">${p.fullName}</div>
        <div class="sub">${p.age} ans</div>
      </div>
      <span class="pos-tag">${p.pos}</span>
    `;
    card.addEventListener("click", () => {
      if (disabled) return;
      toggleGroupeSelection(p.id);
    });
    grid.appendChild(card);
  });

  if (!players.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.style.gridColumn = "1 / -1";
    empty.textContent = "Aucun joueur ne correspond à ta recherche.";
    grid.appendChild(empty);
  }
}

function setGroupeStep(cat) {
  state.groupe.filterCat = cat;
  state.groupe.search = "";
  document.getElementById("groupe-search").value = "";
  renderQuotaBar();
  renderGroupePool();
  renderStepNav();
}

function renderStepNav() {
  const idx = CATS.indexOf(state.groupe.filterCat);
  document.getElementById("step-index").textContent = `Étape ${idx + 1}/${CATS.length}`;
  document.getElementById("step-label").textContent = CATEGORY_LABELS[state.groupe.filterCat];
  document.getElementById("step-prev").disabled = idx <= 0;
  document.getElementById("step-next").disabled = idx >= CATS.length - 1;
}

function pruneFranceAssignments() {
  const assignments = state.franceCompo.assignments;
  Object.keys(assignments).forEach((slotCode) => {
    if (!state.groupe.selectedIds.has(assignments[slotCode])) delete assignments[slotCode];
  });
}

function toggleGroupeSelection(id) {
  const p = playerById(id);
  const quotas = groupeQuotas();
  const counts = groupeCounts();
  if (state.groupe.selectedIds.has(id)) {
    state.groupe.selectedIds.delete(id);
    pruneFranceAssignments();
  } else {
    if (counts[p.category] >= quotas[p.category]) return;
    state.groupe.selectedIds.add(id);
  }
  scheduleSave();
  renderGroupeView();
  if (state.groupe.subTab === "onze") renderFranceOnzeView();
}

function renderGroupeSummary() {
  const wrap = document.getElementById("groupe-summary");
  wrap.innerHTML = "";
  CATS.forEach((cat) => {
    const ids = Array.from(state.groupe.selectedIds).filter((id) => playerById(id)?.category === cat);
    if (!ids.length) return;
    const group = document.createElement("div");
    group.className = "summary-group";
    const chips = ids
      .map((id) => {
        const p = playerById(id);
        return `<div class="summary-chip" data-id="${id}">${p.name} <button data-remove="${id}">✕</button></div>`;
      })
      .join("");
    group.innerHTML = `<div class="cat-label">${CATEGORY_LABELS[cat]} (${ids.length})</div><div class="summary-chips">${chips}</div>`;
    wrap.appendChild(group);
  });
  wrap.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleGroupeSelection(btn.dataset.remove);
    });
  });
}

function renderGroupeView() {
  renderQuotaBar();
  renderGroupePool();
  renderGroupeSummary();
  renderProgressFloat();
  renderStepNav();
}

function renderGroupeLanding() {
  const { total, totalMax } = groupeProgress();
  document.getElementById("landing-pool-sub").textContent = `${total} / ${totalMax} joueurs sélectionnés`;

  const assignedCount = Object.keys(state.franceCompo.assignments).length;
  const onzeSub = document.getElementById("landing-onze-sub");
  if (total === 0) {
    onzeSub.textContent = "Sélectionne d'abord ton groupe";
  } else {
    const formation = FORMATIONS[state.franceCompo.formation];
    onzeSub.textContent = `${formation.label} · ${assignedCount} / ${formation.slots.length} postes pourvus`;
  }
}

function goToGroupeScreen(screen, subTab) {
  state.groupe.screen = screen;
  if (subTab) state.groupe.subTab = subTab;
  renderGroupeScreen();
}

function renderGroupeScreen() {
  const inWorkspace = state.groupe.screen === "workspace";
  document.getElementById("groupe-landing").style.display = inWorkspace ? "none" : "block";
  document.getElementById("groupe-workspace").style.display = inWorkspace ? "block" : "none";
  renderGroupeLanding();
  if (!inWorkspace) return;

  document.querySelectorAll("nav.sub-tabs button").forEach((b) => b.classList.toggle("active", b.dataset.subtab === state.groupe.subTab));
  document.querySelectorAll(".subview").forEach((v) => v.classList.toggle("active", v.id === "subview-" + state.groupe.subTab));
  renderGroupeView();
  if (state.groupe.subTab === "onze") renderFranceOnzeView();
}

function initGroupeLanding() {
  document.getElementById("landing-pool-btn").addEventListener("click", () => goToGroupeScreen("workspace", "pool"));
  document.getElementById("landing-onze-btn").addEventListener("click", () => goToGroupeScreen("workspace", "onze"));
  document.getElementById("groupe-back-btn").addEventListener("click", () => goToGroupeScreen("landing"));
}

function initGroupeControls() {
  document.getElementById("groupe-size").addEventListener("change", (e) => {
    state.groupe.squadSize = Number(e.target.value);
    scheduleSave();
    renderGroupeView();
  });
  document.getElementById("groupe-search").addEventListener("input", (e) => {
    state.groupe.search = e.target.value;
    renderGroupePool();
  });
  document.getElementById("step-prev").addEventListener("click", () => {
    const idx = CATS.indexOf(state.groupe.filterCat);
    if (idx > 0) setGroupeStep(CATS[idx - 1]);
  });
  document.getElementById("step-next").addEventListener("click", () => {
    const idx = CATS.indexOf(state.groupe.filterCat);
    if (idx < CATS.length - 1) setGroupeStep(CATS[idx + 1]);
  });
  document.getElementById("groupe-reset").addEventListener("click", () => {
    if (!confirm("Réinitialiser la sélection du groupe ?")) return;
    state.groupe.selectedIds.clear();
    state.groupe.filterCat = "GK";
    state.franceCompo.assignments = {};
    scheduleSave();
    renderGroupeView();
    if (state.groupe.subTab === "onze") renderFranceOnzeView();
  });
  document.getElementById("groupe-share").addEventListener("click", () => shareElement(document.getElementById("groupe-summary-panel"), "selection-groupe.png"));
  document.getElementById("progress-float-btn").addEventListener("click", () => {
    document.getElementById("groupe-summary-panel").scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

// ==========================================================
// VUE 2 : COMPO 11 PAR CLUB
// ==========================================================
function currentCompo() {
  if (!state.compo.byClub[state.compo.activeClub]) {
    state.compo.byClub[state.compo.activeClub] = defaultCompo();
  }
  return state.compo.byClub[state.compo.activeClub];
}

function renderClubPicker() {
  const wrap = document.getElementById("club-picker-grid");
  wrap.innerHTML = "";
  const hasChosen = Object.keys(state.compo.byClub).length > 0;
  CLUBS.forEach((club) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "club-picker-card" + (hasChosen && club.id === state.compo.activeClub ? " current" : "");
    card.innerHTML = `<img class="club-logo" src="${club.logo}" alt="${club.name}" /><span class="club-name">${club.name}</span>`;
    card.addEventListener("click", () => {
      state.compo.activeClub = club.id;
      state.compo.step = "squad";
      scheduleSave();
      renderCompoView();
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

const FRANCE_COLOR = "#085FFF";

function getCompo(context) {
  return context === "france" ? state.franceCompo : currentCompo();
}
function avatarColor(context) {
  return context === "france" ? FRANCE_COLOR : getClub(state.compo.activeClub).color;
}
function pitchElId(context) {
  return context === "france" ? "france-pitch" : "pitch";
}
function rosterElId(context) {
  return context === "france" ? "france-roster-list" : "roster-list";
}
function pitchWrapElId(context) {
  return context === "france" ? "france-pitch-wrap" : "pitch-wrap";
}

const DESKTOP_LAYOUT_QUERY = window.matchMedia("(min-width: 901px)");

function syncRosterHeight(context) {
  const roster = document.getElementById(rosterElId(context));
  const pitchWrap = document.getElementById(pitchWrapElId(context));
  if (!roster || !pitchWrap) return;
  if (DESKTOP_LAYOUT_QUERY.matches) {
    const height = pitchWrap.getBoundingClientRect().height;
    if (height <= 0) return; // pitch pas encore visible/rendu (ex: onglet caché) : on ne casse pas la hauteur déjà en place
    roster.style.maxHeight = height + "px";
    roster.style.overflowY = "auto";
  } else {
    roster.style.maxHeight = "";
    roster.style.overflowY = "";
  }
}
function franceRoster() {
  return Array.from(state.groupe.selectedIds).map(playerById).filter(Boolean);
}

function renderPitch(context) {
  const compo = getCompo(context);
  const formation = FORMATIONS[compo.formation];
  const pitch = document.getElementById(pitchElId(context));
  pitch.querySelectorAll(".pitch-slot").forEach((el) => el.remove());
  const color = avatarColor(context);

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
      el.addEventListener("pointerdown", (e) => startDrag(e, { type: "slot", slotCode: slot.code, player, context }));
    } else {
      el.innerHTML = `<div class="slot-label">${slot.pos}</div>`;
    }
    pitch.appendChild(el);
  });
}

function renderRoster(context) {
  const wrap = document.getElementById(rosterElId(context));
  wrap.innerHTML = "";
  const compo = getCompo(context);
  const usedIds = new Set(Object.values(compo.assignments));
  const roster = context === "france" ? franceRoster() : playersByClub(state.compo.activeClub);
  const color = avatarColor(context);

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
        card.addEventListener("pointerdown", (e) => startDrag(e, { type: "roster", player: p, context }));
      }
      wrap.appendChild(card);
    });
  });
}

function renderActiveClubHeaders() {
  const club = getClub(state.compo.activeClub);
  const html = `<img src="${club.logo}" alt="${club.name}" /><span>${club.name}</span>`;
  document.getElementById("roster-club-header").innerHTML = html;
  document.getElementById("pitch-club-header").innerHTML = html;
}

function renderCompoView() {
  const picking = state.compo.step !== "squad";
  document.getElementById("club-picker").style.display = picking ? "block" : "none";
  document.getElementById("compo-layout").style.display = picking ? "none" : "grid";
  renderClubPicker();
  if (picking) return;

  renderActiveClubHeaders();
  renderFormationSelect();
  renderPitch("club");
  renderRoster("club");
  syncRosterHeight("club");
}

function initCompoControls() {
  document.getElementById("formation-select").addEventListener("change", (e) => {
    currentCompo().formation = e.target.value;
    currentCompo().assignments = {};
    scheduleSave();
    renderCompoView();
  });
  document.getElementById("compo-reset").addEventListener("click", () => {
    if (!confirm("Réinitialiser cette composition ?")) return;
    currentCompo().assignments = {};
    scheduleSave();
    renderCompoView();
  });
  document.getElementById("compo-share").addEventListener("click", () => shareElement(document.getElementById("pitch-wrap"), `compo-${state.compo.activeClub}.png`));
  document.getElementById("change-club-btn").addEventListener("click", () => {
    state.compo.step = "pick";
    renderCompoView();
  });
}

// ==========================================================
// SOUS-VUE : ONZE DE DÉPART (Équipe de France, à partir du groupe)
// ==========================================================
function renderFranceOnzeView() {
  const hasGroup = state.groupe.selectedIds.size > 0;
  document.getElementById("france-empty-state").style.display = hasGroup ? "none" : "block";
  document.getElementById("france-compo-layout").style.display = hasGroup ? "grid" : "none";
  if (!hasGroup) return;

  const select = document.getElementById("france-formation-select");
  select.innerHTML = Object.keys(FORMATIONS)
    .map((key) => `<option value="${key}">${FORMATIONS[key].label}</option>`)
    .join("");
  select.value = state.franceCompo.formation;

  renderPitch("france");
  renderRoster("france");
  syncRosterHeight("france");
}

function initFranceCompoControls() {
  document.getElementById("france-formation-select").addEventListener("change", (e) => {
    state.franceCompo.formation = e.target.value;
    state.franceCompo.assignments = {};
    scheduleSave();
    renderFranceOnzeView();
  });
  document.getElementById("france-compo-reset").addEventListener("click", () => {
    if (!confirm("Réinitialiser cet onze de départ ?")) return;
    state.franceCompo.assignments = {};
    scheduleSave();
    renderFranceOnzeView();
  });
  document.getElementById("france-compo-share").addEventListener("click", () => shareElement(document.getElementById("france-pitch-wrap"), "onze-equipe-de-france.png"));
}

function initSubTabs() {
  document.querySelectorAll("nav.sub-tabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.groupe.subTab = btn.dataset.subtab;
      document.querySelectorAll("nav.sub-tabs button").forEach((b) => b.classList.toggle("active", b === btn));
      document.querySelectorAll(".subview").forEach((v) => v.classList.toggle("active", v.id === "subview-" + btn.dataset.subtab));
      if (btn.dataset.subtab === "onze") renderFranceOnzeView();
    });
  });
}

// ---------------- Drag & drop (pointer events, souris + tactile) ----------------
let dragState = null;

function startDrag(e, source) {
  e.preventDefault();
  const ghost = document.createElement("div");
  ghost.className = "drag-ghost";
  const color = avatarColor(source.context);
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

function renderForContext(context) {
  if (context === "france") renderFranceOnzeView();
  else renderCompoView();
}

function handleDrop(x, y) {
  if (!dragState) return;
  const { source, moved } = dragState;
  const context = source.context;
  const compo = getCompo(context);
  const pitchContainer = document.getElementById(pitchElId(context));

  // Clic simple sur un slot rempli -> désassigner
  if (!moved && source.type === "slot") {
    delete compo.assignments[source.slotCode];
    scheduleSave();
    renderForContext(context);
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
  renderForContext(context);
}

// ---------------- Partage (export image) ----------------
async function shareElement(el, filename) {
  if (typeof html2canvas === "undefined") {
    alert("Export indisponible hors-ligne (librairie html2canvas non chargée).");
    return;
  }
  const canvas = await html2canvas(el, { backgroundColor: "#0b1224", scale: 2 });
  canvas.toBlob(async (blob) => {
    if (!blob) return;
    const file = new File([blob], filename, { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "Ma composition Ligue 1" });
        return;
      } catch (e) {
        /* annulé ou non supporté -> fallback téléchargement */
      }
    }
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }, "image/png");
}

// ==========================================================
// INIT
// ==========================================================
function init() {
  loadState();
  initTabs();
  initSubTabs();
  initGroupeLanding();
  initGroupeControls();
  initCompoControls();
  initFranceCompoControls();
  document.getElementById("groupe-size").value = String(state.groupe.squadSize);
  pruneFranceAssignments();
  renderGroupeScreen();
  renderCompoView();

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      syncRosterHeight("club");
      syncRosterHeight("france");
    }, 120);
  });
}

document.addEventListener("DOMContentLoaded", init);
