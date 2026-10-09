/**
 * API SIMULÉE des Étoiles 2026 — même contrat que l'API réelle à construire
 * (cf. docs/plateforme-les-etoiles-2026.md). Le front ne lit JAMAIS ADVENT_DAYS
 * directement : il passe par ces appels, qui appliquent les règles serveur.
 *
 *   GET  /etoiles/2026                 → getCalendar()
 *   POST /etoiles/2026/:day/open       → openDay(day)
 *   POST /etoiles/2026/:day/entry      → participate(day)       (compte requis)
 *   POST /etoiles/2026/:day/answer     → answerQuiz(day, choice)
 *   GET  /me/etoiles/2026/progress     → getProgress()
 *   PUT  /me/notifications/etoiles     → setReminder(on)
 *
 * En production : déverrouillage à minuit heure de Paris calculé côté serveur,
 * réponses de quiz jamais envoyées avant la réponse du fan, progression liée
 * au compte Ligue 1. Ici tout est stocké en localStorage pour la démo.
 */

const AdventAPI = (() => {
  const STORE_KEY = "l1-advent-2026-v1";
  const USER_KEY = "l1-advent-2026-user";
  let clock = () => 0; // fourni par le front (date réelle ou mode démo)

  const db = { opened: {}, lots: {}, quiz: {}, reminder: false };
  let user = null;

  try {
    Object.assign(db, JSON.parse(localStorage.getItem(STORE_KEY) || "{}"));
    user = JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch (e) {
    /* stockage indisponible : session sans persistance */
  }

  function persist() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(db));
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      /* idem */
    }
  }

  const latency = () => new Promise((r) => setTimeout(r, 120));
  const entryOf = (day) => ADVENT_DAYS.find((d) => d.day === day);
  const fail = (status, message) => Object.assign(new Error(message), { status });

  // Ce qu'un fan a le droit de voir d'une étoile ouverte (sans la bonne réponse).
  function publicEntry(e) {
    const { answer, explain, ...rest } = e;
    return rest;
  }

  function quizState(day) {
    const choice = db.quiz[day];
    if (choice === undefined) return null;
    const e = entryOf(day);
    return { choice, correct: choice === e.answer, answer: e.answer, explain: e.explain };
  }

  return {
    setClock(fn) { clock = fn; },

    async getCalendar() {
      await latency();
      const today = clock();
      return ADVENT_DAYS.map((e) => {
        const base = { day: e.day, big: !!e.big, unlocked: e.day <= today, opened: !!db.opened[e.day] };
        // Le contenu d'une étoile n'est exposé qu'une fois ouverte : rien à "spoiler" dans le réseau.
        return base.opened ? { ...base, type: e.type, title: e.title, club: e.club } : base;
      });
    },

    async openDay(day) {
      await latency();
      if (day > clock()) throw fail(403, `L'étoile n°${day} s'ouvre le ${day} décembre.`);
      db.opened[day] = true;
      persist();
      return {
        entry: publicEntry(entryOf(day)),
        isToday: day === clock(),
        participated: !!db.lots[day],
        quiz: quizState(day),
      };
    },

    async participate(day) {
      await latency();
      if (!user) throw fail(401, "Connecte-toi pour participer.");
      if (day !== clock()) throw fail(410, "Ce concours est terminé.");
      db.lots[day] = true; // une participation par compte et par jour
      persist();
      return { ok: true };
    },

    async answerQuiz(day, choice) {
      await latency();
      if (day > clock()) throw fail(403, "Étoile verrouillée.");
      if (db.quiz[day] === undefined) { db.quiz[day] = choice; persist(); } // une seule tentative
      return quizState(day);
    },

    async getProgress() {
      await latency();
      const openedCount = Object.keys(db.opened).length;
      let points = openedCount * ADVENT_POINTS.open + Object.keys(db.lots).length * ADVENT_POINTS.lotEntry;
      for (const day of Object.keys(db.quiz)) {
        if (quizState(Number(day)).correct) points += ADVENT_POINTS.quizCorrect;
      }
      const today = Math.min(clock(), 24);
      let d = db.opened[today] ? today : today - 1;
      let streak = 0;
      while (d >= 1 && db.opened[d]) { streak++; d--; }
      return { openedCount, points, streak };
    },

    async setReminder(on) {
      await latency();
      db.reminder = on;
      persist();
      return { reminder: on };
    },
    getReminder() { return db.reminder; },

    // Comptes : en prod, SSO du compte Ligue 1 McDonald's (site + appli).
    getUser() { return user; },
    async signIn() {
      await latency();
      user = { name: "Supporter" };
      persist();
      return user;
    },
    signOut() { user = null; persist(); },

    resetDemo() {
      Object.assign(db, { opened: {}, lots: {}, quiz: {}, reminder: false });
      persist();
    },
  };
})();
