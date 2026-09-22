/**
 * Données MOCKÉES pour le prototype "Composeur d'équipe Ligue 1".
 * Clubs = noms/couleurs réels (choix sûrs, non exhaustifs des 18 clubs de L1).
 * Joueurs = générés aléatoirement (seed fixe) -> à remplacer par l'API réelle.
 */

const CLUBS = [
  { id: "psg", name: "Paris Saint-Germain", short: "PSG", color: "#004170", accent: "#DA291C" },
  { id: "om", name: "Olympique de Marseille", short: "OM", color: "#2FAEE0", accent: "#FFFFFF" },
  { id: "asm", name: "AS Monaco", short: "ASM", color: "#E51A23", accent: "#FFFFFF" },
  { id: "losc", name: "LOSC Lille", short: "LOSC", color: "#C8102E", accent: "#FFFFFF" },
  { id: "ol", name: "Olympique Lyonnais", short: "OL", color: "#0B2E6F", accent: "#E30613" },
  { id: "ogcn", name: "OGC Nice", short: "OGCN", color: "#C8102E", accent: "#000000" },
  { id: "rcl", name: "RC Lens", short: "RCL", color: "#FFD100", accent: "#C8102E" },
  { id: "srfc", name: "Stade Rennais", short: "SRFC", color: "#C8102E", accent: "#000000" },
  { id: "rcs", name: "RC Strasbourg", short: "RCS", color: "#0072CE", accent: "#FFFFFF" },
  { id: "tfc", name: "Toulouse FC", short: "TFC", color: "#4B1E6E", accent: "#E30613" },
  { id: "fcn", name: "FC Nantes", short: "FCN", color: "#FFD700", accent: "#0B7A3E" },
  { id: "sb29", name: "Stade Brestois", short: "SB29", color: "#C8102E", accent: "#FFFFFF" },
];

const POSITIONS = {
  GK: { label: "Gardien", category: "GK" },
  DC: { label: "Défenseur central", category: "DEF" },
  DL: { label: "Défenseur gauche", category: "DEF" },
  DR: { label: "Défenseur droit", category: "DEF" },
  DM: { label: "Milieu défensif", category: "MID" },
  CM: { label: "Milieu central", category: "MID" },
  AM: { label: "Milieu offensif", category: "MID" },
  ML: { label: "Milieu gauche", category: "MID" },
  MR: { label: "Milieu droit", category: "MID" },
  ST: { label: "Attaquant", category: "ATT" },
  LW: { label: "Ailier gauche", category: "ATT" },
  RW: { label: "Ailier droit", category: "ATT" },
};

const CATEGORY_LABELS = {
  GK: "Gardiens",
  DEF: "Défenseurs",
  MID: "Milieux",
  ATT: "Attaquants",
};

// Formations : positions en % (top = profondeur terrain, left = largeur), but attaquant en haut.
const FORMATIONS = {
  "4-3-3": {
    label: "4-3-3",
    slots: [
      { code: "GK", pos: "GK", top: 92, left: 50 },
      { code: "DL", pos: "DL", top: 72, left: 16 },
      { code: "DCG", pos: "DC", top: 76, left: 38 },
      { code: "DCD", pos: "DC", top: 76, left: 62 },
      { code: "DR", pos: "DR", top: 72, left: 84 },
      { code: "MG", pos: "ML", top: 50, left: 24 },
      { code: "MC", pos: "CM", top: 52, left: 50 },
      { code: "MD", pos: "MR", top: 50, left: 76 },
      { code: "AG", pos: "LW", top: 20, left: 22 },
      { code: "BU", pos: "ST", top: 14, left: 50 },
      { code: "AD", pos: "RW", top: 20, left: 78 },
    ],
  },
  "4-4-2": {
    label: "4-4-2",
    slots: [
      { code: "GK", pos: "GK", top: 92, left: 50 },
      { code: "DL", pos: "DL", top: 72, left: 16 },
      { code: "DCG", pos: "DC", top: 76, left: 38 },
      { code: "DCD", pos: "DC", top: 76, left: 62 },
      { code: "DR", pos: "DR", top: 72, left: 84 },
      { code: "MG", pos: "ML", top: 50, left: 14 },
      { code: "MCG", pos: "CM", top: 52, left: 38 },
      { code: "MCD", pos: "CM", top: 52, left: 62 },
      { code: "MD", pos: "MR", top: 50, left: 86 },
      { code: "BU1", pos: "ST", top: 18, left: 38 },
      { code: "BU2", pos: "ST", top: 18, left: 62 },
    ],
  },
  "4-2-3-1": {
    label: "4-2-3-1",
    slots: [
      { code: "GK", pos: "GK", top: 92, left: 50 },
      { code: "DL", pos: "DL", top: 72, left: 16 },
      { code: "DCG", pos: "DC", top: 76, left: 38 },
      { code: "DCD", pos: "DC", top: 76, left: 62 },
      { code: "DR", pos: "DR", top: 72, left: 84 },
      { code: "MDC1", pos: "DM", top: 58, left: 38 },
      { code: "MDC2", pos: "DM", top: 58, left: 62 },
      { code: "MOG", pos: "AM", top: 32, left: 20 },
      { code: "MOC", pos: "AM", top: 30, left: 50 },
      { code: "MOD", pos: "AM", top: 32, left: 80 },
      { code: "BU", pos: "ST", top: 12, left: 50 },
    ],
  },
  "3-5-2": {
    label: "3-5-2",
    slots: [
      { code: "GK", pos: "GK", top: 92, left: 50 },
      { code: "DCG", pos: "DC", top: 76, left: 28 },
      { code: "DC", pos: "DC", top: 78, left: 50 },
      { code: "DCD", pos: "DC", top: 76, left: 72 },
      { code: "MG", pos: "ML", top: 50, left: 10 },
      { code: "MDC1", pos: "DM", top: 56, left: 34 },
      { code: "MC", pos: "CM", top: 50, left: 50 },
      { code: "MDC2", pos: "DM", top: 56, left: 66 },
      { code: "MD", pos: "MR", top: 50, left: 90 },
      { code: "BU1", pos: "ST", top: 18, left: 38 },
      { code: "BU2", pos: "ST", top: 18, left: 62 },
    ],
  },
};

// --- Générateur de joueurs mock (seed fixe pour reproductibilité) ---
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST_NAMES = [
  "Lucas", "Enzo", "Nathan", "Yanis", "Mamadou", "Ibrahim", "Théo", "Rayan",
  "Bilal", "Hugo", "Kylian", "Moussa", "Adama", "Amine", "Noah", "Sacha",
  "Jules", "Leo", "Koffi", "Aurélien", "Souleymane", "Marius", "Ethan", "Idriss",
];
const LAST_NAMES = [
  "Traoré", "Martin", "Diallo", "Bernard", "Fofana", "Petit", "Camara", "Roux",
  "N'Diaye", "Leroy", "Keita", "Girard", "Sow", "Morel", "Coulibaly", "Faure",
  "Kouassi", "Bertrand", "Diop", "Renard", "Bah", "Simon", "Toure", "Perrin",
];

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function generateRoster(clubId, seedBase) {
  const rng = mulberry32(seedBase);
  const plan = [
    ["GK", 2], ["DC", 3], ["DL", 1], ["DR", 1],
    ["DM", 2], ["CM", 2], ["AM", 1], ["ML", 1], ["MR", 1],
    ["ST", 2], ["LW", 1], ["RW", 1],
  ];
  const roster = [];
  let n = 1;
  plan.forEach(([pos, count]) => {
    for (let i = 0; i < count; i++) {
      const first = pick(rng, FIRST_NAMES);
      const last = pick(rng, LAST_NAMES);
      roster.push({
        id: `${clubId}-${n++}`,
        firstName: first,
        lastName: last,
        name: `${first[0]}. ${last}`,
        fullName: `${first} ${last}`,
        pos,
        category: POSITIONS[pos].category,
        clubId,
        age: 18 + Math.floor(rng() * 17),
      });
    }
  });
  return roster;
}

const PLAYERS = CLUBS.flatMap((club, i) => generateRoster(club.id, 1000 + i * 37));

function getClub(clubId) {
  return CLUBS.find((c) => c.id === clubId);
}

function playersByClub(clubId) {
  return PLAYERS.filter((p) => p.clubId === clubId);
}
