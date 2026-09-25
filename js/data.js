/**
 * Données MOCKÉES pour le prototype "Compos".
 * Deux compétitions : Ligue 1 McDonald's (18 clubs, saison confirmée par Hugo)
 * et Ligue 2 BKT (clubs ajoutés au fil des logos envoyés par Hugo).
 * Couleurs extraites automatiquement des vrais blasons fournis, logos en local.
 * Joueurs = générés aléatoirement (seed fixe) -> à remplacer par l'API réelle.
 */

const LOGO_BASE = "assets/logos/clubs/";
const LOGO_BASE_L2 = "assets/logos/clubs-l2/";
const LOGO_BASE_L3 = "assets/logos/clubs-l3/";

// Couleurs officielles RVB issues de la "Charte Clubs L1 2025-2026" fournie par Hugo,
// sauf ESTAC et Le Mans FC (absents de ce document) qui gardent les couleurs extraites des logos.
const CLUBS_L1 = [
  { id: "psg", name: "Paris Saint-Germain", short: "PSG", color: "#004F91", accent: "#E30613", logo: LOGO_BASE + "psg.png" },
  { id: "om", name: "Olympique de Marseille", short: "OM", color: "#0098D8", accent: "#FFFFFF", logo: LOGO_BASE + "om-marseille.png" },
  { id: "asm", name: "AS Monaco", short: "ASM", color: "#D70032", accent: "#A8884D", logo: LOGO_BASE + "as-monaco.png" },
  { id: "losc", name: "LOSC Lille", short: "LOSC", color: "#E41B13", accent: "#211E5F", logo: LOGO_BASE + "losc-lille.png" },
  { id: "ol", name: "Olympique Lyonnais", short: "OL", color: "#0F23AA", accent: "#E5202E", logo: LOGO_BASE + "olympique-lyonnais.png" },
  { id: "ogcn", name: "OGC Nice", short: "OGCN", color: "#DA2128", accent: "#2C2A29", logo: LOGO_BASE + "ogc-nice.png" },
  { id: "rcl", name: "RC Lens", short: "RCL", color: "#FFD500", accent: "#C51315", logo: LOGO_BASE + "rc-lens.png" },
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

// Couleurs extraites automatiquement des blasons envoyés par Hugo (pas de charte
// officielle disponible pour la Ligue 2). Liste à compléter au fil des logos reçus.
const CLUBS_L2 = [
  { id: "annecy", name: "FC Annecy", short: "ANNECY", color: "#F00000", accent: "#FFFFFF", logo: LOGO_BASE_L2 + "annecy.png" },
  { id: "usbco", name: "US Boulogne Côte d'Opale", short: "USBCO", color: "#E00000", accent: "#101010", logo: LOGO_BASE_L2 + "us-boulogne.png" },
  { id: "clermont", name: "Clermont Foot 63", short: "CF63", color: "#002060", accent: "#D00030", logo: LOGO_BASE_L2 + "clermont-foot.png" },
  { id: "dijon", name: "Dijon FCO", short: "DFCO", color: "#E00010", accent: "#FFFFFF", logo: LOGO_BASE_L2 + "dijon-fco.png" },
  { id: "dunkerque", name: "USL Dunkerque", short: "USLD", color: "#102030", accent: "#E0B070", logo: LOGO_BASE_L2 + "dunkerque.png" },
  { id: "grenoble", name: "Grenoble Foot 38", short: "GF38", color: "#004090", accent: "#FFFFFF", logo: LOGO_BASE_L2 + "grenoble-foot.png" },
  { id: "guingamp", name: "En Avant Guingamp", short: "EAG", color: "#F00000", accent: "#000000", logo: LOGO_BASE_L2 + "guingamp.png" },
  { id: "laval", name: "Stade Lavallois Mayenne FC", short: "LAVAL", color: "#F05000", accent: "#000000", logo: LOGO_BASE_L2 + "laval.png" },
  { id: "metz", name: "FC Metz", short: "FCM", color: "#800000", accent: "#FFFFFF", logo: LOGO_BASE_L2 + "metz.png" },
  { id: "montpellier", name: "Montpellier HSC", short: "MHSC", color: "#202050", accent: "#F06000", logo: LOGO_BASE_L2 + "montpellier.png" },
  { id: "nancy", name: "AS Nancy Lorraine", short: "ASNL", color: "#F00000", accent: "#FFFFFF", logo: LOGO_BASE_L2 + "nancy.png" },
  { id: "nantes", name: "FC Nantes", short: "FCN", color: "#F0D000", accent: "#00A040", logo: LOGO_BASE_L2 + "nantes.png" },
  { id: "pau", name: "Pau FC", short: "PAU", color: "#202030", accent: "#F0C000", logo: LOGO_BASE_L2 + "pau.png" },
  { id: "redstar", name: "Red Star FC", short: "RSFC", color: "#004030", accent: "#A00010", logo: LOGO_BASE_L2 + "red-star.png" },
  { id: "reims", name: "Stade de Reims", short: "SDR", color: "#F00000", accent: "#FFFFFF", logo: LOGO_BASE_L2 + "reims.png" },
  { id: "rodez", name: "Rodez Aveyron Football", short: "RAF", color: "#D00020", accent: "#F0B000", logo: LOGO_BASE_L2 + "rodez.png" },
  { id: "asse", name: "AS Saint-Étienne", short: "ASSE", color: "#009050", accent: "#FFFFFF", logo: LOGO_BASE_L2 + "saint-etienne.png" },
  { id: "sochaux", name: "FC Sochaux-Montbéliard", short: "FCSM", color: "#003080", accent: "#F0C000", logo: LOGO_BASE_L2 + "sochaux.png" },
];

// Couleurs extraites automatiquement des blasons envoyés par Hugo (pas de charte
// officielle disponible pour la Ligue 3). Liste à compléter au fil des logos reçus
// — deux blasons du premier lot (un bouclier marine "SCAAB" et un casque à cornes
// sans texte) restent en attente, le nom du club n'ayant pas encore été confirmé.
const CLUBS_L3 = [
  { id: "amiens", name: "Amiens SC", short: "AMIENS", color: "#101010", accent: "#FFFFFF", logo: LOGO_BASE_L3 + "amiens-sc.png" },
  { id: "cannes", name: "AS Cannes", short: "CANNES", color: "#C00000", accent: "#FFFFFF", logo: LOGO_BASE_L3 + "as-cannes.png" },
  { id: "bourg-peronnas", name: "Football Bourg-en-Bresse Péronnas 01", short: "FBBP01", color: "#003D8F", accent: "#E6007E", logo: LOGO_BASE_L3 + "fbbp01.png" },
  { id: "bastia", name: "SC Bastia", short: "SCB", color: "#0047BB", accent: "#FFFFFF", logo: LOGO_BASE_L3 + "sc-bastia.png" },
  { id: "concarneau", name: "US Concarneau", short: "USC", color: "#0055A4", accent: "#E1000F", logo: LOGO_BASE_L3 + "us-concarneau.png" },
  { id: "fleury", name: "Fleury Essonne", short: "FLEURY", color: "#1A1A1A", accent: "#E30613", logo: LOGO_BASE_L3 + "fleury-essonne.png" },
  { id: "vendee", name: "Vendée Foot Club", short: "VFC", color: "#E30613", accent: "#FFFFFF", logo: LOGO_BASE_L3 + "vendee-fc.png" },
  { id: "lepuy", name: "Le Puy en Velay Football Club", short: "LE PUY", color: "#0A2A4D", accent: "#4FB6E8", logo: LOGO_BASE_L3 + "le-puy.png" },
  { id: "orleans", name: "US Orléans", short: "USO", color: "#FFD500", accent: "#E30613", logo: LOGO_BASE_L3 + "orleans.png" },
  { id: "paris-atletico", name: "Paris Atletico", short: "PARIS", color: "#101010", accent: "#39E639", logo: LOGO_BASE_L3 + "paris-atletico.png" },
  { id: "qrm", name: "Quevilly Rouen Métropole", short: "QRM", color: "#E30613", accent: "#F5A623", logo: LOGO_BASE_L3 + "qrm.png" },
  { id: "rouen", name: "FC Rouen 1899", short: "FCR", color: "#CE1126", accent: "#0A1F44", logo: LOGO_BASE_L3 + "fc-rouen.png" },
  { id: "thionville", name: "US Thionville Lusitanos", short: "USTL", color: "#1A1A1A", accent: "#C9A227", logo: LOGO_BASE_L3 + "thionville.png" },
  { id: "valenciennes", name: "Valenciennes FC", short: "VAFC", color: "#E30613", accent: "#FFFFFF", logo: LOGO_BASE_L3 + "valenciennes.png" },
  { id: "versailles", name: "Versailles FC", short: "VERSAILLES", color: "#0A3D91", accent: "#C9A227", logo: LOGO_BASE_L3 + "versailles.png" },
  { id: "villefranche", name: "FC Villefranche Beaujolais", short: "FCVB", color: "#0066B3", accent: "#FFFFFF", logo: LOGO_BASE_L3 + "villefranche.png" },
];

const COMPETITIONS = {
  l1: {
    id: "l1",
    name: "Ligue 1 McDonald's",
    short: "Ligue 1",
    logo: "assets/logos/competitions/ligue1-mcdonalds.png",
    clubs: CLUBS_L1,
  },
  l2: {
    id: "l2",
    name: "Ligue 2 BKT",
    short: "Ligue 2",
    logo: "assets/logos/competitions/ligue2-bkt.png",
    clubs: CLUBS_L2,
  },
  l3: {
    id: "l3",
    name: "Ligue 3 Betclic",
    short: "Ligue 3",
    logo: "assets/logos/competitions/ligue3-betclic.png",
    clubs: CLUBS_L3,
  },
};

const ALL_CLUBS = [...CLUBS_L1, ...CLUBS_L2, ...CLUBS_L3];

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

const PLAYERS = ALL_CLUBS.flatMap((club, i) => generateRoster(club.id, 1000 + i * 37));

function getClub(clubId) {
  return ALL_CLUBS.find((c) => c.id === clubId);
}

function playersByClub(clubId) {
  return PLAYERS.filter((p) => p.clubId === clubId);
}
