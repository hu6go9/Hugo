/* ==========================================================
   Composeur d'équipe Ligue 1 — prototype front-end (mock data)
   ========================================================== */

const STORAGE_KEY = "l1-composer-state-v1";
const CATS = ["GK", "DEF", "MID", "ATT"];
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
    filterCat: "ALL",
  },
  compo: {
    activeClub: CLUBS[0].id,
    byClub: {}, // clubId -> { formation, assignments: { slotCode: playerId } }
  },
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

function renderQuotaBar() {
  const quotas = groupeQuotas();
  const counts = groupeCounts();
  const wrap = document.getElementById("quota-row");
  wrap.innerHTML = "";
  CATS.forEach((cat) => {
    const full = counts[cat] >= quotas[cat];
    const div = document.createElement("div");
    div.className = "quota-card" + (full ? " full" : "");
    div.innerHTML = `
      <div class="label">${CATEGORY_LABELS[cat]}</div>
      <div class="count">${counts[cat]} / ${quotas[cat]}</div>
      <div class="bar"><span style="width:${Math.min(100, (counts[cat] / quotas[cat]) * 100)}%"></span></div>
    `;
    wrap.appendChild(div);
  });
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const totalMax = Object.values(quotas).reduce((a, b) => a + b, 0);
  document.getElementById("groupe-total").textContent = `${total} / ${totalMax} joueurs sélectionnés`;
}

function filteredGroupePlayers() {
  const { search, filterCat } = state.groupe;
  return PLAYERS.filter((p) => {
    if (filterCat !== "ALL" && p.category !== filterCat) return false;
    if (search) {
      const q = search.toLowerCase();
      const club = getClub(p.clubId).name.toLowerCase();
      if (!p.fullName.toLowerCase().includes(q) && !club.includes(q)) return false;
    }
    return true;
  });
}

function renderGroupePool() {
  const grid = document.getElementById("groupe-grid");
  grid.innerHTML = "";
  const quotas = groupeQuotas();
  const counts = groupeCounts();
  filteredGroupePlayers().forEach((p) => {
    const selected = state.groupe.selectedIds.has(p.id);
    const catFull = counts[p.category] >= quotas[p.category];
    const disabled = !selected && catFull;
    const card = document.createElement("div");
    card.className = "player-card" + (selected ? " selected" : "") + (disabled ? " disabled" : "");
    const club = getClub(p.clubId);
    card.innerHTML = `
      <div class="avatar" style="background:${club.color}">${initials(p)}</div>
      <div class="player-meta">
        <div class="name">${p.fullName}</div>
        <div class="sub">${club.short} · ${p.age} ans</div>
      </div>
      <span class="pos-tag">${p.pos}</span>
    `;
    card.addEventListener("click", () => {
      if (disabled) return;
      toggleGroupeSelection(p.id);
    });
    grid.appendChild(card);
  });
}

function toggleGroupeSelection(id) {
  const p = playerById(id);
  const quotas = groupeQuotas();
  const counts = groupeCounts();
  if (state.groupe.selectedIds.has(id)) {
    state.groupe.selectedIds.delete(id);
  } else {
    if (counts[p.category] >= quotas[p.category]) return;
    state.groupe.selectedIds.add(id);
  }
  scheduleSave();
  renderGroupeView();
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
  document.querySelectorAll("#groupe-filters .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      state.groupe.filterCat = chip.dataset.cat;
      document.querySelectorAll("#groupe-filters .chip").forEach((c) => c.classList.toggle("active", c === chip));
      renderGroupePool();
    });
  });
  document.getElementById("groupe-reset").addEventListener("click", () => {
    if (!confirm("Réinitialiser la sélection du groupe ?")) return;
    state.groupe.selectedIds.clear();
    scheduleSave();
    renderGroupeView();
  });
  document.getElementById("groupe-share").addEventListener("click", () => shareElement(document.getElementById("groupe-summary-panel"), "selection-groupe.png"));
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

function renderClubSelector() {
  const wrap = document.getElementById("club-select-grid");
  wrap.innerHTML = "";
  CLUBS.forEach((club) => {
    const chip = document.createElement("div");
    chip.className = "club-chip" + (club.id === state.compo.activeClub ? " active" : "");
    chip.innerHTML = `<img class="club-logo" src="${club.logo}" alt="${club.name}" />${club.short}`;
    chip.addEventListener("click", () => {
      state.compo.activeClub = club.id;
      renderCompoView();
    });
    wrap.appendChild(chip);
  });
}

function renderFormationSelect() {
  const select = document.getElementById("formation-select");
  select.innerHTML = Object.keys(FORMATIONS)
    .map((key) => `<option value="${key}">${FORMATIONS[key].label}</option>`)
    .join("");
  select.value = currentCompo().formation;
}

function renderPitch() {
  const compo = currentCompo();
  const formation = FORMATIONS[compo.formation];
  const pitch = document.getElementById("pitch");
  pitch.querySelectorAll(".pitch-slot").forEach((el) => el.remove());
  const club = getClub(state.compo.activeClub);

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
      el.innerHTML = `<div class="avatar" style="background:${club.color}">${initials(player)}</div><div class="slot-name">${player.name}</div>`;
      el.addEventListener("pointerdown", (e) => startDrag(e, { type: "slot", slotCode: slot.code, player }));
    } else {
      el.innerHTML = `<div class="slot-label">${slot.pos}</div>`;
    }
    pitch.appendChild(el);
  });
}

function renderRoster() {
  const wrap = document.getElementById("roster-list");
  wrap.innerHTML = "";
  const compo = currentCompo();
  const usedIds = new Set(Object.values(compo.assignments));
  const roster = playersByClub(state.compo.activeClub);
  const club = getClub(state.compo.activeClub);

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
        <div class="avatar" style="background:${club.color}">${initials(p)}</div>
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

function renderActiveClubHeaders() {
  const club = getClub(state.compo.activeClub);
  const html = `<img src="${club.logo}" alt="${club.name}" /><span>${club.name}</span>`;
  document.getElementById("roster-club-header").innerHTML = html;
  document.getElementById("pitch-club-header").innerHTML = html;
}

function renderCompoView() {
  renderClubSelector();
  renderActiveClubHeaders();
  renderFormationSelect();
  renderPitch();
  renderRoster();
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
}

// ---------------- Drag & drop (pointer events, souris + tactile) ----------------
let dragState = null;

function startDrag(e, source) {
  e.preventDefault();
  const ghost = document.createElement("div");
  ghost.className = "drag-ghost";
  const club = getClub(state.compo.activeClub);
  ghost.innerHTML = `<div class="avatar" style="background:${club.color};width:52px;height:52px;font-size:1rem;box-shadow:0 6px 16px rgba(0,0,0,.4)">${initials(source.player)}</div>`;
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
    if (source.player.category !== category) return; // poste incompatible
    const slotCode = targetSlotEl.dataset.slotCode;
    compo.assignments[slotCode] = source.player.id;
  } else if (source.type === "slot") {
    if (!targetSlotEl) {
      delete compo.assignments[source.slotCode];
    } else {
      const targetCode = targetSlotEl.dataset.slotCode;
      const targetCategory = targetSlotEl.dataset.category;
      if (targetCode === source.slotCode) return;
      if (source.player.category !== targetCategory) return;
      const targetPlayerId = compo.assignments[targetCode];
      compo.assignments[targetCode] = source.player.id;
      if (targetPlayerId) compo.assignments[source.slotCode] = targetPlayerId;
      else delete compo.assignments[source.slotCode];
    }
  }
  scheduleSave();
  renderCompoView();
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
  initGroupeControls();
  initCompoControls();
  document.getElementById("groupe-size").value = String(state.groupe.squadSize);
  renderGroupeView();
  renderCompoView();
}

document.addEventListener("DOMContentLoaded", init);
