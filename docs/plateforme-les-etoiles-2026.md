# Les Étoiles de la Ligue 1 McDonald's — saison 2 : la plateforme

*Note de cadrage — LFP Media, 9 octobre 2026. Prototype associé : `advent.html` (démo : `advent.html?jour=12`, version appli : `advent.html?jour=12&embed=app`).*

## 1. Le constat de 2025

Les Étoiles 2025 étaient 24 stories indépendantes publiées dans le CMS stories, avec le même format : couverture « Ouvrir l'étoile du jour », étoile révélée, page contenu avec CTA. Le format a posé un code visuel fort (l'étoile dorée sur fond bleu électrique) et un rendez-vous quotidien. Il a aussi trois limites. Rien ne retient le fan d'un jour à l'autre : pas de progression, pas de raison de revenir si on a raté un jour. On ne sait pas qui joue, donc pas de base qualifiée à la sortie. Enfin, chaque étoile est une story à monter et publier à la main, sans vue d'ensemble.

La saison 2 garde le format et le code visuel, qui ont fait leurs preuves, et ajoute ce qui manquait : un calendrier qui sert de point d'entrée, une progression liée au compte, et un rappel quotidien.

## 2. Ce qu'on vise

L'objectif n'est pas « faire un calendrier » mais trois choses mesurables. Installer une habitude quotidienne pendant la trêve de décembre, au moment où il y a moins de matchs. Transformer l'audience des stories en comptes identifiés et en opt-in notifications, qui servent toute la saison. Donner aux partenaires (McDonald's, boutique, Ligue 1+) une visibilité mesurable, avec des codes dont on suit l'usage.

| Indicateur | Ce qu'il dit | Où il se lit |
|---|---|---|
| Ouvreurs uniques par jour | La portée réelle de l'étoile du jour | API (`open`) |
| Rétention J+1 / J+7 | Est-ce que l'habitude prend | API, par compte |
| Série moyenne | Profondeur d'engagement | API |
| Comptes créés / connectés via Les Étoiles | Ce que l'opération rapporte à la base | SSO |
| Opt-in rappel quotidien | Le canal qu'on garde après Noël | API + outil push |
| Participations par concours | Attractivité des lots | API (`entry`) |
| Codes promo utilisés | Valeur pour le partenaire | Remontée partenaire |
| Provenance (story, push, site, partage) | Quel canal ramène les fans | Paramètres d'URL |

Les objectifs chiffrés sont à fixer à partir des chiffres 2025 (vues et taux de clic des stories), que je n'ai pas.

## 3. Le parcours

Le fan arrive par l'un des quatre canaux : la story du jour (toujours publiée dans le CMS stories, c'est là que se fait la portée), la notification du matin, la bannière du site ou un lien partagé. Tous mènent à la même expérience : la story de l'étoile en 3 pages, puis le calendrier.

Ouvrir une étoile ne demande pas de compte. C'est volontaire : on ne met pas de mur devant la portée. Le compte est demandé au moment où il a un sens pour le fan, c'est-à-dire quand il veut participer à un tirage au sort ou retrouver sa progression sur un autre appareil. Le rappel quotidien est proposé dès l'accueil, puis relancé quand un fan découvre un concours terminé (« Active le rappel pour ne plus en rater »).

Les étoiles passées restent ouvrables : on peut rattraper le contenu, le quiz et le code promo s'il est encore valide. En revanche, chaque concours n'est ouvert que le jour J. C'est ce qui crée l'enjeu de revenir chaque jour.

## 4. Architecture

Le principe : une seule interface, intégrée partout, et un serveur qui fait foi.

**Un front unique.** Le calendrier est une page web autonome, intégrée sur le site (page dédiée) et dans l'appli via une webview (`?embed=app` masque l'en-tête, que l'appli fournit déjà). Avantage décisif à 7 semaines du lancement : pas besoin de sortir une nouvelle version de l'appli ni de passer la validation des stores pour le calendrier lui-même, seulement d'y ajouter un point d'entrée (bannière, onglet, lien profond), idéalement piloté à distance.

**Une API qui détient les règles.** Le prototype appelle déjà cette API (simulée dans `js/advent-api.js`), avec le contrat suivant :

| Appel | Rôle | Règle appliquée côté serveur |
|---|---|---|
| `GET /etoiles/2026` | État des 24 étoiles | Une étoile verrouillée ne renvoie que son numéro, aucun contenu |
| `POST /etoiles/2026/:jour/open` | Ouvrir une étoile | Refus (403) avant minuit heure de Paris du jour J |
| `POST /etoiles/2026/:jour/entry` | Participer au tirage | Compte obligatoire, jour J seulement, une participation par compte |
| `POST /etoiles/2026/:jour/answer` | Répondre au quiz | Une seule tentative ; la bonne réponse n'est envoyée qu'après |
| `GET /me/etoiles/2026/progress` | Étoiles, points, série | Calculé côté serveur |
| `PUT /me/notifications/etoiles` | Rappel quotidien | Inscription au segment push / e-mail |

C'est le point le plus important pour la viabilité. Si le contenu est livré dans le navigateur, les codes promo et les réponses du quiz du 24 décembre sont lisibles dès le 1er, et l'heure de déverrouillage dépend de l'horloge du téléphone du fan.

**Le contenu dans le CMS.** Les 24 étoiles sont saisies dans un CMS (le CMS stories s'il permet des types de contenu structurés, sinon un CMS headless), avec ce modèle :

| Champ | Exemple |
|---|---|
| Jour, mécanique | 12, `promo` (`lot`, `exclusif`, `quiz`, `promo`) |
| Club associé (facultatif) | `srfc` → blason et couleur de la page |
| Titre, texte | « Un mois offert » |
| Lot : nombre de gagnants, référence du règlement | 2 |
| Quiz : question, 4 options, bonne réponse, explication | — |
| Promo : partenaire, code, validité | Ligue 1+, `L1PLUSNOEL`, 31/12 |
| Exclusif : vidéo (player officiel) ou fond d'écran | — |
| Statut de validation | Brouillon → validé partenaire → validé juridique → programmé |

**Les briques existantes à réutiliser.** Le compte Ligue 1 McDonald's (SSO commun au site et à l'appli), l'outil de notifications push et d'e-mailing, le player vidéo officiel, l'outil d'analytics. Je ne connais pas les outils précis en place chez LFP Media : c'est la première chose à vérifier avec l'équipe produit, parce que ça décide du temps de développement.

**La charge.** Deux pics par jour : minuit (les plus motivés) et l'heure du rappel. Le contenu d'une étoile est identique pour tout le monde, il se met en cache sur un CDN à partir du déverrouillage ; seuls les appels personnels (progression, participation) touchent le serveur. Un test de charge sur le scénario « push à 9h » est à prévoir en recette.

## 5. Les opérations au quotidien

Une plateforme viable, c'est aussi qui fait quoi pendant 24 jours. Le contenu doit être entièrement saisi et validé avant le 1er décembre, pour que décembre ne soit que de l'exploitation.

Chaque jour : l'étoile se déverrouille automatiquement à minuit. Le community manager publie la story du jour dans le CMS stories, avec un CTA vers le calendrier (`?case=N&utm_source=story`). Le rappel part à 9h aux inscrits. Le lendemain matin, on fait le tirage au sort du concours de la veille parmi les participations enregistrées et on prévient les gagnants. Une personne d'astreinte surveille le déverrouillage de minuit et peut dépublier une étoile en cas de problème (code partenaire invalide, erreur de contenu).

## 6. Juridique et données

À valider par le juridique, je donne les points d'attention sans me substituer à eux. Il faut un règlement du jeu-concours : gratuité, modalités du tirage, dotations, gagnants, et cas des mineurs (autorisation parentale). Le dépôt auprès d'un commissaire de justice est recommandé. Le consentement marketing doit être séparé de la participation : on ne conditionne pas la participation à l'acceptation de la newsletter. La mention d'information RGPD doit apparaître au moment de la création de compte et de la participation. Enfin, les codes et offres partenaires doivent être validés par écrit par chaque partenaire, avec leurs conditions.

## 7. Rétroplanning (7 semaines)

| Semaine | Étape |
|---|---|
| 12–16 oct. | Cadrage avec produit et data : outils en place (CMS, SSO, push, analytics), choix de l'intégration appli. Objectifs chiffrés à partir de 2025. |
| 12–30 oct. | Grille éditoriale des 24 étoiles, négociation des lots et codes partenaires, rédaction du règlement. Création des visuels (étoile 3D, couverture) dans la continuité de 2025. |
| 19 oct.–13 nov. | Développement de l'API et branchement du front existant, intégration SSO, push et analytics. Point d'entrée dans l'appli. |
| 16–20 nov. | Saisie et validation des 24 étoiles dans le CMS, recette complète (dont simulation des 24 jours), test de charge. |
| 23–27 nov. | Gel. Teasing (stories, réseaux, compte à rebours sur le site), ouverture des inscriptions au rappel. |
| 1er déc. | Première étoile à minuit. |
| 26 déc.–janv. | Bilan des indicateurs, récap envoyé aux fans (« ta saison des Étoiles »), retours partenaires. |

## 8. Risques principaux

Le plus probable est le retard des validations partenaires et juridiques, d'où un gel du contenu au 20 novembre. Le plus coûteux serait une fuite de contenu ou de codes, que le déverrouillage côté serveur règle. Il faut aussi surveiller un pic de charge mal absorbé à l'envoi du push, couvert par le cache CDN et le test de charge, et une friction trop forte à la connexion, qu'on limite en ne demandant le compte qu'au moment de participer.

## 9. Ce que le prototype montre déjà

L'interface finale (grille des étoiles, story en 3 pages, quatre mécaniques), l'API simulée avec les règles serveur ci-dessus, la connexion demandée uniquement pour participer, le rappel quotidien, la progression (étoiles, points, série), le rattrapage des étoiles manquées et le mode intégré à l'appli. Tous les lots, codes et contenus sont fictifs.
