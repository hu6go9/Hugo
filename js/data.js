/**
 * Données MOCKÉES pour le prototype "Compos Ligue 1".
 * Clubs = les 18 clubs de Ligue 1 McDonald's (saison confirmée par Hugo),
 * couleurs extraites automatiquement des vrais blasons fournis, logos en local.
 * Joueurs = générés aléatoirement (seed fixe) -> à remplacer par l'API réelle.
 */

const LOGO_BASE = "assets/logos/clubs/";

// Couleurs officielles RVB issues de la "Charte Clubs L1 2025-2026" fournie par Hugo,
// sauf ESTAC et Le Mans FC (absents de ce document) qui gardent les couleurs extraites des logos.
const CLUBS = [
  { id: "psg", name: "Paris Saint-Germain", short: "PSG", color: "#004F91", accent: "#E30613", logo: LOGO_BASE + "psg.png" },
  { id: "om", name: "Olympique de Marseille", short: "OM", color: "#0098D8", accent: "#FFFFFF", logo: LOGO_BASE + "om-marseille.png" },
  { id: "asm", name: "AS Monaco", short: "ASM", color: "#D70032", accent: "#A8884D", logo: LOGO_BASE + "as-monaco.png" },
  { id: "losc", name: "LOSC Lille", short: "LOSC", color: "#E41B13", accent: "#211E5F", logo: LOGO_BASE + "losc-lille.png" },
  { id: "ol", name: "Olympique Lyonnais", short: "OL", color: "#0F23AA", accent: "#E5202E", logo: LOGO_BASE + "olympique-lyonnais.png" },
  { id: "ogcn", name: "OGC Nice", short: "OGCN", color: "#DA2128", accent: "#2C2A29", logo: LOGO_BASE + "ogc-nice.png" },
  { id: "rcl", name: "RC Lens", short: "RCL", color: "#C51315", accent: "#FFD500", logo: LOGO_BASE + "rc-lens.png" },
  { id: "srfc", name: "Stade Rennais", short: "SRFC", color: "#DA261B", accent: "#0D181C", logo: LOGO_BASE + "stade-rennais.png" },
  { id: "rcs", name: "RC Strasbourg", short: "RCS", color: "#009FE3", accent: "#DC2F34", logo: LOGO_BASE + "rc-strasbourg.png" },
  { id: "tfc", name: "Toulouse FC", short: "TFC", color: "#3F2B56", accent: "#EB0045", logo: LOGO_BASE + "toulouse-fc.png" },
  { id: "sb29", name: "Stade Brestois 29", short: "SB29", color: "#D10A11", accent: "#FFFFFF", logo: LOGO_BASE + "stade-brestois-29.png" },
  { id: "fcl", name: "FC Lorient", short: "FCL", color: "#EC6408", accent: "#161412", logo: LOGO_BASE + "fc-lorient.png" },
  { id: "sco", name: "Angers SCO", short: "SCO", color: "#000000", accent: "#BD9D5F", logo: LOGO_BASE + "angers-sco.png" },
  { id: "aja", name: "AJ Auxerre", short: "AJA", color: "#164194", accent: "#B2B3B6", logo: LOGO_BASE + "aj-auxerre.png" },
  { id: "hac", name: "Le Havre AC", short: "HAC", color: "#183360", accent: "#79BDE8", logo: LOGO_BASE + "le-havre-ac.png" },
  { id: "estac", name: "ESTAC Troyes", short: "ESTAC", color: "#0060B0", accent: "#F0B000", logo: LOGO_BASE + "estac-troyes.webp" },
  { id: "pfc", name: "Paris FC", short: "PFC", color: "#0A0E2D", accent: "#199ACD", logo: LOGO_BASE + "paris-fc.png" },
  { id: "lmfc", name: "Le Mans FC", short: "LMFC", color: "#A00010", accent: "#F0B000", logo: LOGO_BASE + "lemans-fc.png" },
];

const POSITIONS = {
  G: { label: "Gardien", category: "GK" },
  DC: { label: "Défenseur central", category: "DEF" },
  DG: { label: "Défenseur gauche", category: "DEF" },
  DD: { label: "Défenseur droit", category: "DEF" },
  MDC: { label: "Milieu défensif", category: "MID" },
  MC: { label: "Milieu central", category: "MID" },
  MOC: { label: "Milieu offensif", category: "MID" },
  MG: { label: "Milieu gauche", category: "MID" },
  MD: { label: "Milieu droit", category: "MID" },
  BU: { label: "Buteur", category: "ATT" },
  AG: { label: "Ailier gauche", category: "ATT" },
  AD: { label: "Ailier droit", category: "ATT" },
};

const CATEGORY_LABELS = {
  GK: "Gardiens",
  DEF: "Défenseurs",
  MID: "Milieux",
  ATT: "Attaquants",
};

/*
 * Formations : positions en % (top = profondeur terrain depuis le haut, gardien en bas).
 *
 * Deux principes pour un rendu plus naturel :
 * - Horizontal : les postes de côté gardent une marge par rapport aux lignes de touche
 *   (jamais en dessous de ~10% ni au-dessus de ~90%).
 * - Vertical : les lignes ne sont pas plates — les postes de côté d'une ligne sont
 *   légèrement avancés par rapport aux postes axiaux (arc de cercle), ce qui exploite
 *   mieux la profondeur du terrain, comme une vraie feuille de match.
 *
 * Tables horizontales (left) par nombre de postes sur une même ligne :
 * 2 -> [32,68]  3 -> [22,50,78]  4 -> [14,38,62,86]  5 -> [10,30,50,70,90]
 */
const FORMATIONS = {
  "4-3-3": {
    label: "4-3-3",
    slots: [
      { code: "GK", pos: "G", top: 96, left: 50 },
      { code: "DG", pos: "DG", top: 75, left: 14 },
      { code: "DCG", pos: "DC", top: 79, left: 38 },
      { code: "DCD", pos: "DC", top: 79, left: 62 },
      { code: "DD", pos: "DD", top: 75, left: 86 },
      { code: "MG", pos: "MG", top: 46, left: 22 },
      { code: "MC", pos: "MC", top: 55, left: 50 },
      { code: "MD", pos: "MD", top: 46, left: 78 },
      { code: "AG", pos: "AG", top: 22, left: 20 },
      { code: "BU", pos: "BU", top: 8, left: 50 },
      { code: "AD", pos: "AD", top: 22, left: 80 },
    ],
  },
  "4-4-2": {
    label: "4-4-2",
    slots: [
      { code: "GK", pos: "G", top: 96, left: 50 },
      { code: "DG", pos: "DG", top: 75, left: 14 },
      { code: "DCG", pos: "DC", top: 79, left: 38 },
      { code: "DCD", pos: "DC", top: 79, left: 62 },
      { code: "DD", pos: "DD", top: 75, left: 86 },
      { code: "MG", pos: "MG", top: 44, left: 14 },
      { code: "MCG", pos: "MC", top: 53, left: 38 },
      { code: "MCD", pos: "MC", top: 53, left: 62 },
      { code: "MD", pos: "MD", top: 44, left: 86 },
      { code: "BU1", pos: "BU", top: 12, left: 34 },
      { code: "BU2", pos: "BU", top: 16, left: 66 },
    ],
  },
  "4-2-3-1": {
    label: "4-2-3-1",
    slots: [
      { code: "GK", pos: "G", top: 96, left: 50 },
      { code: "DG", pos: "DG", top: 75, left: 14 },
      { code: "DCG", pos: "DC", top: 79, left: 38 },
      { code: "DCD", pos: "DC", top: 79, left: 62 },
      { code: "DD", pos: "DD", top: 75, left: 86 },
      { code: "MDC1", pos: "MDC", top: 63, left: 38 },
      { code: "MDC2", pos: "MDC", top: 63, left: 62 },
      { code: "MOG", pos: "MOC", top: 30, left: 20 },
      { code: "MOC", pos: "MOC", top: 38, left: 50 },
      { code: "MOD", pos: "MOC", top: 30, left: 80 },
      { code: "BU", pos: "BU", top: 8, left: 50 },
    ],
  },
  "3-5-2": {
    label: "3-5-2",
    slots: [
      { code: "GK", pos: "G", top: 96, left: 50 },
      { code: "DCG", pos: "DC", top: 79, left: 22 },
      { code: "DC", pos: "DC", top: 80, left: 50 },
      { code: "DCD", pos: "DC", top: 79, left: 78 },
      { code: "MG", pos: "MG", top: 44, left: 10 },
      { code: "MDC1", pos: "MDC", top: 56, left: 30 },
      { code: "MC", pos: "MC", top: 50, left: 50 },
      { code: "MDC2", pos: "MDC", top: 56, left: 70 },
      { code: "MD", pos: "MD", top: 44, left: 90 },
      { code: "BU1", pos: "BU", top: 12, left: 34 },
      { code: "BU2", pos: "BU", top: 16, left: 66 },
    ],
  },
  "4-1-4-1": {
    label: "4-1-4-1",
    slots: [
      { code: "GK", pos: "G", top: 96, left: 50 },
      { code: "DG", pos: "DG", top: 75, left: 14 },
      { code: "DCG", pos: "DC", top: 79, left: 38 },
      { code: "DCD", pos: "DC", top: 79, left: 62 },
      { code: "DD", pos: "DD", top: 75, left: 86 },
      { code: "MDC", pos: "MDC", top: 63, left: 50 },
      { code: "MG", pos: "MG", top: 42, left: 14 },
      { code: "MCG", pos: "MC", top: 47, left: 38 },
      { code: "MCD", pos: "MC", top: 47, left: 62 },
      { code: "MD", pos: "MD", top: 42, left: 86 },
      { code: "BU", pos: "BU", top: 10, left: 50 },
    ],
  },
  "4-3-1-2": {
    label: "4-3-1-2",
    slots: [
      { code: "GK", pos: "G", top: 96, left: 50 },
      { code: "DG", pos: "DG", top: 75, left: 14 },
      { code: "DCG", pos: "DC", top: 79, left: 38 },
      { code: "DCD", pos: "DC", top: 79, left: 62 },
      { code: "DD", pos: "DD", top: 75, left: 86 },
      { code: "MG", pos: "MDC", top: 58, left: 22 },
      { code: "MC", pos: "MC", top: 63, left: 50 },
      { code: "MD", pos: "MDC", top: 58, left: 78 },
      { code: "MOC", pos: "MOC", top: 34, left: 50 },
      { code: "BU1", pos: "BU", top: 10, left: 34 },
      { code: "BU2", pos: "BU", top: 10, left: 66 },
    ],
  },
  "3-4-3": {
    label: "3-4-3",
    slots: [
      { code: "GK", pos: "G", top: 96, left: 50 },
      { code: "DG", pos: "DG", top: 79, left: 22 },
      { code: "DC", pos: "DC", top: 80, left: 50 },
      { code: "DD", pos: "DD", top: 79, left: 78 },
      { code: "MG", pos: "MG", top: 44, left: 14 },
      { code: "MCG", pos: "MC", top: 53, left: 38 },
      { code: "MCD", pos: "MC", top: 53, left: 62 },
      { code: "MD", pos: "MD", top: 44, left: 86 },
      { code: "AG", pos: "AG", top: 22, left: 20 },
      { code: "BU", pos: "BU", top: 8, left: 50 },
      { code: "AD", pos: "AD", top: 22, left: 80 },
    ],
  },
  "5-3-2": {
    label: "5-3-2",
    slots: [
      { code: "GK", pos: "G", top: 96, left: 50 },
      { code: "DG", pos: "DG", top: 66, left: 10 },
      { code: "DCG", pos: "DC", top: 82, left: 30 },
      { code: "DC", pos: "DC", top: 81, left: 50 },
      { code: "DCD", pos: "DC", top: 82, left: 70 },
      { code: "DD", pos: "DD", top: 66, left: 90 },
      { code: "MG", pos: "MG", top: 46, left: 22 },
      { code: "MC", pos: "MC", top: 52, left: 50 },
      { code: "MD", pos: "MD", top: 46, left: 78 },
      { code: "BU1", pos: "BU", top: 12, left: 34 },
      { code: "BU2", pos: "BU", top: 16, left: 66 },
    ],
  },
  "4-5-1": {
    label: "4-5-1",
    slots: [
      { code: "GK", pos: "G", top: 96, left: 50 },
      { code: "DG", pos: "DG", top: 75, left: 14 },
      { code: "DCG", pos: "DC", top: 79, left: 38 },
      { code: "DCD", pos: "DC", top: 79, left: 62 },
      { code: "DD", pos: "DD", top: 75, left: 86 },
      { code: "MG", pos: "MG", top: 44, left: 10 },
      { code: "MDC1", pos: "MDC", top: 56, left: 30 },
      { code: "MC", pos: "MC", top: 50, left: 50 },
      { code: "MDC2", pos: "MDC", top: 56, left: 70 },
      { code: "MD", pos: "MD", top: 44, left: 90 },
      { code: "BU", pos: "BU", top: 10, left: 50 },
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
    ["G", 2], ["DC", 3], ["DG", 1], ["DD", 1],
    ["MDC", 2], ["MC", 2], ["MOC", 1], ["MG", 1], ["MD", 1],
    ["BU", 2], ["AG", 1], ["AD", 1],
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
