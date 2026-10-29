# Job Automation — Roadmap produit SaaS et plan de développement

> Ce document sert de référence unique pour faire évoluer Job Automation (nom actuel dans l'interface : **LinkedAI**) d'un outil personnel vers un SaaS multi-utilisateur.
> Il a été préparé le **29 octobre 2026**, à partir du code de la branche `main` (commit `fbeaf5c`) et d'une recherche web faite le même jour.
> Aucun code applicatif n'a été modifié pour l'écrire.
> Le plan d'origine (mai 2026) reste disponible dans [docs/plan-initial.md](docs/plan-initial.md).

---

## Sommaire

1. [Conventions de lecture](#1-conventions-de-lecture)
2. [Résumé](#2-résumé)
3. [Audit de l'existant](#3-audit-de-lexistant)
   - 3.1 [Architecture actuelle](#31-architecture-actuelle)
   - 3.2 [Inventaire des fonctionnalités](#32-inventaire-des-fonctionnalités)
   - 3.3 [Scraping : flux réel et causes des problèmes](#33-scraping--flux-réel-et-causes-des-problèmes)
   - 3.4 [Génération de contenus](#34-génération-de-contenus)
   - 3.5 [Personnalisation](#35-personnalisation)
   - 3.6 [Persistance, utilisateurs et limites multi-utilisateurs](#36-persistance-utilisateurs-et-limites-multi-utilisateurs)
   - 3.7 [Qualité, tests et sécurité](#37-qualité-tests-et-sécurité)
   - 3.8 [La Skill skill-cv-ats](#38-la-skill-skill-cv-ats)
   - 3.9 [Risques et blocages identifiés](#39-risques-et-blocages-identifiés)
4. [Vision produit](#4-vision-produit)
5. [Étude concurrentielle](#5-étude-concurrentielle)
   - 5.1 [Méthode et fiabilité des sources](#51-méthode-et-fiabilité-des-sources)
   - 5.2 [Tableau de synthèse](#52-tableau-de-synthèse)
   - 5.3 [Fiches concurrents](#53-fiches-concurrents)
   - 5.4 [Sources d'offres d'emploi utilisables légalement](#54-sources-doffres-demploi-utilisables-légalement)
   - 5.5 [Positionnement SaaS de Job Automation](#55-positionnement-saas-de-job-automation)
6. [Architecture cible et dépendances](#6-architecture-cible-et-dépendances)
7. [Décisions à valider](#7-décisions-à-valider)
8. [Méthode de travail et stratégie de test](#8-méthode-de-travail-et-stratégie-de-test)
9. [Phase 0 — Socle technique](#phase-0--socle-technique)
10. [Phase 1 — Fiabilisation du scraping](#phase-1--fiabilisation-du-scraping)
11. [Phase 2 — Gestion des offres d'emploi](#phase-2--gestion-des-offres-demploi)
12. [Phase 3 — Génération de CV et intégration de la Skill ATS](#phase-3--génération-de-cv-et-intégration-de-la-skill-ats)
13. [Phase 4 — Lettres de motivation et publications](#phase-4--lettres-de-motivation-et-publications)
14. [Phase 5 — Suivi des candidatures et progression](#phase-5--suivi-des-candidatures-et-progression)
15. [Phase 6 — Personnalisation et durcissement multi-utilisateur](#phase-6--personnalisation-et-durcissement-multi-utilisateur)
16. [Phase 7 — Assistant IA (plus tard)](#phase-7--assistant-ia-plus-tard)
17. [Phase 8 — Préparation à la commercialisation](#phase-8--préparation-à-la-commercialisation)
18. [Registre des risques](#18-registre-des-risques)
19. [Sources](#19-sources)

---

## 1. Conventions de lecture

### État d'une fonctionnalité

| Marque | Sens |
|---|---|
| ✅ **Opérationnel** | Existe dans le code et a été testé de bout en bout (parcours réel, données réelles). |
| 🛠 **À corriger** | Existe, mais un défaut ou une limite est établi dans le code. |
| 🆕 **À développer** | N'existe pas, ou seulement sous forme de page d'attente. Prévu dans ce plan. |
| 🔭 **Plus tard** | Idée retenue, hors des priorités de livraison. |

### Niveau de certitude

| Marque | Sens |
|---|---|
| **Vérifié** | Lu dans le code, dans un fichier du projet, ou dans une source officielle citée. |
| **Source secondaire** | Lu dans un article ou un comparatif tiers daté, pas sur le site officiel. |
| **Hypothèse** | Déduction raisonnable, à confirmer avant de s'en servir. |

### Identifiants

- Phases : `P0` à `P8`. Lots : `L<phase>.<numéro>`, par exemple `L1.3`.
- Décisions à valider : `D-01`, `D-02`… (section 7).
- Risques : `R-01`, `R-02`… (section 18).
- Tests : `TU` unitaire, `TI` intégration, `TF` fonctionnel, `TNR` non-régression, `TS` multi-utilisateur et sécurité.

---

## 2. Résumé

**Ce qui marche aujourd'hui** (vérifié de bout en bout) : génération de posts LinkedIn par l'IA (DeepSeek via OpenRouter, clé gardée côté serveur), ressources et conseils associés, visuel IA exportable en PNG, scraper de profils LinkedIn publics via n8n et Google Custom Search, dashboard calculé à partir des vraies données, interface refaite.

**Ce qui bloque la transformation en SaaS** :

1. **Il n'y a pas d'utilisateurs.** Pas d'authentification, pas de comptes. Le propriétaire est écrit en dur dans `frontend/src/lib/profil.js`.
2. **Les données de l'utilisateur vivent dans le navigateur** (`localStorage`). La base serveur ne garde qu'un journal des posts, sans lien avec un compte.
3. **Le scraper dépend d'une API qui ferme.** Google a annoncé l'arrêt de la Custom Search JSON API au **1er janvier 2027**, soit dans environ deux mois (source secondaire concordante, voir 3.9). Sans action, le scraper cessera de fonctionner.
4. **Aucun test automatisé** n'existe dans le dépôt.
5. **Lettre de motivation, offres d'emploi et CV n'existent pas** : les deux premières sont des pages d'attente, le CV n'a aucune trace dans le code.

**Ordre proposé** :

- une **Phase 0 de socle** (tests, base PostgreSQL, comptes) est ajoutée avant le scraping, parce que la persistance après déconnexion et reconnexion, demandée en Phase 1, suppose des comptes ;
- viennent ensuite le scraping, les offres, le CV, les lettres et posts, puis le suivi des candidatures ;
- la personnalisation avancée, l'assistant IA et la commercialisation ferment la marche.

**Décisions urgentes** :

- `D-01` : quelle source de profils après l'arrêt de Google Custom Search ;
- `D-05` : comment intégrer la Skill CV, qui est propriétaire et ne tourne que sur macOS, dans un dépôt aujourd'hui public.

---

## 3. Audit de l'existant

### 3.1 Architecture actuelle

```text
Navigateur — React 18, Vite 5, Tailwind 3, zustand (persist → localStorage « linkedai-storage »)
  └─▶ Backend Express :4000 (seul service exposé)
        ├─▶ OpenRouter, modèle deepseek/deepseek-chat   POST /api/posts/generate
        ├─▶ n8n :5678 (Docker), 3 webhooks en liste blanche   POST /api/n8n/:nom
        │     ├─ resource-suggestions   règles locales, aucun appel externe
        │     ├─ generate-visual        HTML animé généré par deepseek
        │     └─ scraper                Google Custom Search « site:linkedin.com/in »
        └─▶ SQLite via Prisma 6, une seule table : GeneratedPostLog
```

| Élément | Fichiers clés | Constat |
|---|---|---|
| Routes front | `frontend/src/App.jsx` | 7 routes : `/dashboard`, `/posts`, `/scraper`, `/lettre`, `/offres`, `/settings`, `*` |
| Données front | `frontend/src/store/useAppStore.js` | posts (50 gardés), profils (200), lettres (20), offres sauvées, paramètres |
| Appels réseau | `frontend/src/services/api.js`, `frontend/src/pages/Scraper.jsx` | `generatePost`, `getResources`, `generateVisual` ; le scraper appelle axios directement |
| Backend | `backend/src/index.js`, `routes/posts.js`, `routes/n8n.js`, `lib/rateLimit.js` | CORS par variable, limite 20 appels/min/IP en mémoire, `trust proxy` |
| Base | `backend/prisma/schema.prisma` | `GeneratedPostLog` avec un `userId` optionnel, jamais rempli par le front |
| Workflows | `n8n-workflows/*.json` | 3 workflows, clés dans `~/n8n.env` hors dépôt |
| Design | `frontend/design.md`, `palette.md`, `animation.md` | méthode CloneMe, contrôle `verifier-synchro.mjs` |
| Qualité | `frontend/.eslintrc.cjs` | lint en place ; **aucun test** (aucun fichier `*.test.*`) |
| Déploiement | `.github/workflows/deploy-pages.yml`, `frontend/vercel.json`, `docs/demo.md` | front statique ; backend local exposé par tunnel pour une démo |

### 3.2 Inventaire des fonctionnalités

| Fonctionnalité | État | Détail vérifié |
|---|---|---|
| Génération de posts LinkedIn | ✅ | Prompt construit côté serveur, validation (description obligatoire, 2 000 caractères au plus), journal en base. |
| Réédition d'un post | 🛠 | Le texte est modifiable dans une zone de texte (`PostGenerator.jsx:155`), mais **la modification n'est jamais enregistrée** : le store n'a pas de fonction `updatePost`. |
| Ressources d'un post | ✅ | Liens de documentation et conseils, choisis par règles dans n8n. |
| Visuel IA + export PNG | ✅ | iframe isolée (`sandbox="allow-scripts"`), export par html-to-image et `postMessage`. |
| Scraper de profils | 🛠 | Fonctionne, mais persistance, dédoublonnage et détail sont insuffisants (voir 3.3). Source condamnée au 01/01/2027. |
| Export CSV des profils | ✅ | `frontend/src/lib/exportCsv.js`. |
| Dashboard | ✅ | Chiffres calculés depuis les données réelles (`lib/stats.js`), pas de valeur fictive. Les compteurs « Lettres » et « Offres » restent à 0 tant que ces modules n'existent pas. |
| Recherche globale, notifications | ✅ | Composants de layout, sur les données du store. |
| Paramètres | ✅ | Ton par défaut, webhook scraper facultatif, modèle affiché en lecture seule. |
| Lettre de motivation | 🆕 | Page d'attente (`MotivationLetter.jsx`). Le store prévoit `letters` et `addLetter`, que rien n'utilise. |
| Offres d'emploi | 🆕 | Page d'attente (`JobsFinder.jsx`). Le store prévoit `savedJobs` et `toggleSavedJob`, que rien n'utilise. |
| Génération de CV | 🆕 | Absente du code. La Skill `cv-ats` existe à part (voir 3.8). |
| Suivi des candidatures | 🆕 | Absent. |
| Comptes, connexion | 🆕 | Absent. |
| Assistant IA | 🔭 | Absent. |

### 3.3 Scraping : flux réel et causes des problèmes

**Flux actuel** (vérifié) :

1. `Scraper.jsx` envoie `{ query, location, maxPages }` à `POST /api/n8n/scraper`, ou au webhook réglé dans Paramètres.
2. Le workflow `linkedin-scraper-webhook.json` interroge Google Custom Search `"<requête> <lieu> site:linkedin.com/in"`, 10 résultats par page, 10 pages au plus, avec 400 ms entre deux pages.
3. Pour chaque résultat, le workflow découpe le titre Google sur `" - "` :
   - le premier morceau devient `name` ;
   - le reste devient `title`.

   Il garde aussi `link`, `snippet` et la vignette `image`. Le nœud de réponse filtre les entrées sans `link`.
4. Le front lit la réponse avec une analyse souple (`findProfiles`), puis appelle `addProfiles(profiles)`.
5. `zustand/persist` écrit l'état dans `localStorage`, en gardant les **200 premiers** profils.

**Causes réelles des problèmes de sauvegarde** (vérifiées dans le code) :

| # | Cause | Où | Effet observable |
|---|---|---|---|
| C1 | Les profils ne sont **jamais envoyés au serveur**. Aucune table Prisma ne les accueille. | `schema.prisma`, `useAppStore.js` | Perdus si l'on change de navigateur ou d'appareil, si l'on passe en navigation privée ou si l'on efface les données du site. |
| C2 | **Troncature silencieuse** : `partialize` ne persiste que `scrapedProfiles.slice(0, 200)`. Les nouveaux profils passent devant. | `useAppStore.js` | Après actualisation, les plus anciens disparaissent sans prévenir. Avec 10 pages par recherche, deux recherches suffisent à dépasser la limite. |
| C3 | **Aucun dédoublonnage** : `addProfiles` concatène. | `useAppStore.js` | Relancer la même recherche crée des doublons, ce qui accélère la troncature C2. |
| C4 | **Aucune normalisation ni validation** : l'objet brut renvoyé par n8n est stocké tel quel. | `Scraper.jsx`, workflow | Pas de schéma stable ; un changement côté workflow casse l'affichage sans erreur. |
| C5 | **Aucune métadonnée** : ni requête d'origine, ni date de collecte, ni source. | idem | Impossible de trier, de regrouper par recherche ou de rafraîchir un profil. |
| C6 | **Un seul utilisateur implicite** : la donnée appartient au navigateur, pas à un compte. | architecture | La persistance « après déconnexion et reconnexion » n'a pas de sens tant que les comptes n'existent pas. |
| C7 | « Vider » efface **tous** les profils, sans confirmation ni annulation. | `Scraper.jsx` | Perte de données sur un clic. |
| C8 | **Découpage fragile du titre Google.** Hypothèse à vérifier sur un échantillon réel : le suffixe « \| LinkedIn » et l'entreprise restent mêlés au poste. | workflow | Titre peu lisible, entreprise non exploitable. |

**Causes du manque de détail à l'écran** (vérifiées) :

- La table (`TableProfils.jsx`) n'affiche que 4 colonnes : photo, nom, titre, extrait, lien. L'extrait est tronqué sur une ligne.
- Il n'y a pas de fiche détaillée, pas de tri, pas d'étiquette, pas de note, pas d'action (enregistrer, relier à une offre, contacter).
- La source ne fournit, de toute façon, que le titre, l'extrait et une vignette de la page de résultats Google. Elle ne donne ni l'expérience, ni l'entreprise structurée, ni la localisation fiable.

  **Plus de détail ne peut donc venir que d'une autre source autorisée**, ou de ce que l'utilisateur saisit lui-même (voir `D-01`).

### 3.4 Génération de contenus

| Contenu | Où | Constat |
|---|---|---|
| Post LinkedIn | `backend/src/routes/posts.js` | Modèle fixe `deepseek/deepseek-chat`. Le prompt est construit côté serveur à partir du type, de la description, des technologies et du ton. La réponse est journalisée dans `GeneratedPostLog`. Le front garde aussi une copie dans `localStorage` (deux sources de vérité). |
| Visuel | workflow `linkedin-visual-generator.json` | HTML généré par deepseek, affiché en iframe isolée. Aucun enregistrement serveur du visuel. |
| Ressources | workflow `linkedin-resource-suggestions.json` | Règles déterministes, sans IA ni appel externe. |
| Lettre | — | Rien, hormis le schéma prévu dans le store. |
| Offre d'emploi | — | Rien. |
| CV | — | Rien dans le dépôt. |

Il n'existe pas encore de **service commun de génération** : l'appel à OpenRouter est écrit dans la route des posts, et l'appel du visuel est dans n8n. Lettres et CV devront réutiliser un même client IA (journal, coûts, quotas, gestion d'erreur).

### 3.5 Personnalisation

Ce qui existe (vérifié) : le **ton par défaut** et un **webhook scraper** facultatif. Ils sont enregistrés dans `localStorage`.

Ce qui n'existe pas :

- profil professionnel de l'utilisateur (expériences, compétences) ;
- langue de sortie ;
- longueur, style, signature ;
- modèles de documents ;
- choix du modèle IA ;
- préférences de recherche (métiers, lieux, télétravail).

Le nom, les initiales et le rôle affichés sont des constantes dans `frontend/src/lib/profil.js`.

### 3.6 Persistance, utilisateurs et limites multi-utilisateurs

| Donnée | Stockage actuel | Rattachée à un utilisateur ? |
|---|---|---|
| Posts | `localStorage` (50) + `GeneratedPostLog` côté serveur | Non. `userId` existe en base mais n'est jamais envoyé. |
| Profils scrapés | `localStorage` (200) | Non |
| Lettres, offres sauvées | prévues dans `localStorage`, inutilisées | Non |
| Paramètres | `localStorage` | Non |
| Visuels | aucun | — |

Limites établies :

- `GET /api/posts/logs` renvoie les 50 derniers journaux **de tout le monde**, sans authentification. Un `userId` passé en paramètre suffit à filtrer : rien ne vérifie qui le demande.
- SQLite convient à un poste unique. Pour plusieurs instances du backend, PostgreSQL est le choix standard de Prisma (voir `D-02`).
- La limite d'appels est gardée en mémoire, par adresse IP : elle se remet à zéro à chaque redémarrage et ne se partage pas entre instances.
- Il n'y a ni quota par utilisateur ni suivi du coût IA par compte.

### 3.7 Qualité, tests et sécurité

| Point | Constat (vérifié) |
|---|---|
| Tests automatisés | **Aucun**, ni au front ni au backend. Pas de script `test`. |
| Lint | ESLint configuré au front, sans erreur. Rien au backend. |
| CI | Le workflow GitHub Pages construit et publie le front. Il ne lance ni lint ni test. |
| Secrets | Clés dans `backend/.env` et `~/n8n.env`, hors dépôt. Une ancienne clé Google reste dans l'historique git du dépôt public ; elle est toujours valide et il est recommandé de la restreindre. |
| API ouverte | `GET /api/posts/logs` est lisible par tous (voir 3.6). |
| Données personnelles | Les profils scrapés sont des données personnelles de tiers. Il n'y a ni registre, ni durée de conservation, ni procédure de suppression. |
| Front | iframe du visuel isolée ; aucun `dangerouslySetInnerHTML` relevé dans les pages. |

### 3.8 La Skill skill-cv-ats

**Où elle est** (vérifié) :

- dépôt [StackLLM/skill-cv-ats](https://github.com/StackLLM/skill-cv-ats), **privé**, version `0.1.0` du 25/10/2026 ;
- copie locale dans `~/.claude/skills/cv-ats`, dont le `SKILL.md` est identique à celui du dépôt.

**Ce qu'elle fait** (vérifié dans `SKILL.md`, `references/schema.md` et `scripts/cv.py`) :

| Aspect | Détail |
|---|---|
| Entrées | Une source : fichier Markdown, ancien CV en PDF, texte, ou image. Photo facultative. |
| Rôle du modèle | Comprendre la source, détecter domaine et niveau, réécrire et structurer, puis produire un fichier `cv.json`. Règle absolue : **ne jamais inventer**. Toute information manquante ou ambiguë va dans `a_confirmer`. |
| Format pivot | `cv.json` : identité, profil, expériences, réalisations, projets, formation, compétences, certifications, langues, `a_confirmer`, avec les réglages `langue`, `marche`, `domaine` et `niveau`. Seuls `identite.nom`, `identite.email` et une expérience ou une formation sont obligatoires. |
| Rendu | `rendu.py` transforme le JSON en HTML (gabarit V4, `assets/cv.css`). `assets/ajustement.js` fait tenir le contenu sur une page. `cvtool.swift` produit le PDF A4 avec **WebKit**. |
| Sorties | 3 PDF (thèmes bleu, émeraude, bordeaux), `cv.json` éditable, dossier `_controle/` avec `rapport.md` et des aperçus PNG. |
| Contrôles | `verifications.py` vérifie les données (dates incohérentes, champs manquants), la lecture ATS (le texte extrait du PDF contient-il les éléments attendus ?), les ligatures et polices, le contraste, et l'identité de contenu entre les 3 variantes. Le script sort avec le code 1 en cas d'erreur bloquante. |
| Photo | Incluse seulement si elle est fournie et d'usage sur le marché visé (oui pour le Maroc, la France et l'Allemagne ; non pour les USA, le Royaume-Uni et le Canada, sauf `photo_forcee`). Recadrage automatique du visage par Apple **Vision**. |
| Tests | `tests/lancer_tests.py` : 6 profils fictifs passent par toute la chaîne. |

**Contraintes qui pèsent sur l'intégration** (vérifiées) :

1. **macOS uniquement.** `cv.py` refuse de tourner sans `darwin` et `swiftc` : le PDF, l'extraction de texte, les aperçus et le recadrage passent tous par `cvtool.swift` (WebKit et Vision). Un serveur Linux classique ne peut pas l'exécuter tel quel.
2. **Licence propriétaire** (StackLLM, tous droits réservés), alors que le dépôt `job-automation-` est **public**. Copier les scripts dans ce dépôt les publierait.
3. **Pas de prise en compte d'une offre ciblée.** La Skill reconstruit un CV à partir d'une source ; elle ne compare pas le CV à une offre d'emploi. L'adaptation à une offre est donc à construire **autour** d'elle.
4. **Le modèle fait partie de la chaîne.** L'étape « source → `cv.json` » est faite par un LLM qui suit les règles du `SKILL.md`. Dans le SaaS, cette étape devient un appel IA côté backend, avec une sortie JSON validée par un schéma.

### 3.9 Risques et blocages identifiés

| Sujet | Constat | Certitude |
|---|---|---|
| **Fin de Google Custom Search JSON API** | Fermée aux nouveaux clients, arrêt pour les clients existants le **1er janvier 2027**. Le successeur indiqué par Google (Vertex AI Search, renommé Agent Search) ne renvoie pas les résultats publics du web comme le faisait l'API. | Source secondaire, plusieurs sources concordantes ([Brave](https://brave.com/learn/google-api-shutdown/), [Firecrawl](https://www.firecrawl.dev/blog/google-search-json-api-alternative)). À confirmer sur la documentation Google. |
| **Conditions d'utilisation de LinkedIn** | LinkedIn poursuit les acteurs du scraping au titre de son contrat d'utilisation : Proxycurl en 2025, réglé en juillet 2025 ; ProAPIs en octobre 2025. Les affaires les plus lourdes concernent le contournement de la connexion. | Source secondaire ([LinkedIn Newsroom](https://news.linkedin.com/2025/LinkedInWinsLegalBattleToProtectMemberData), [Bloomberg Law](https://news.bloomberglaw.com/ip-law/linkedin-battles-online-scrapers-in-perpetual-struggle-over-data)). Le texte du contrat n'a pas été relu. |
| Licence de la Skill CV | Propriétaire, dans un dépôt privé. Le dépôt de l'application est public. | Vérifié |
| Skill CV liée à macOS | WebKit et Vision par Swift. | Vérifié |
| Absence de tests | Toute refonte de la persistance se fera sans filet si l'outillage n'est pas posé d'abord. | Vérifié |

Le plan **ne propose aucun contournement** de protection (connexion LinkedIn simulée, faux comptes, extension qui lit les pages connectées, rotation d'adresses IP).

---

## 4. Vision produit

**Cible** : un assistant complet de recherche d'emploi, qui accompagne l'utilisateur de la prospection jusqu'au suivi de ses candidatures et de sa progression.

| # | Capacité | État aujourd'hui | Phase |
|---|---|---|---|
| 1 | Trouver des profils et des informations professionnelles, les enregistrer, les organiser | 🛠 scraper fragile, données locales | P1 |
| 2 | Gérer les opportunités et les offres d'emploi | 🆕 page d'attente | P2 |
| 3 | Générer des CV adaptés à une offre | 🆕 Skill externe, non intégrée | P3 |
| 4 | Générer des lettres et des publications personnalisées | ✅ posts · 🆕 lettres | P4 |
| 5 | Suivre les candidatures, les étapes et la progression | 🆕 | P5 |
| 6 | Assistant IA : évaluer une offre, recommander la prochaine action | 🔭 | P7 |

**Fil conducteur** : chaque objet créé est **rattaché à un compte** et **relié aux autres** : profil professionnel, offre, CV, lettre, candidature. Ces liens sont ce qui distingue le produit d'une suite d'outils séparés :

- un CV est généré **pour** une offre ;
- une candidature **porte** un CV et une lettre ;
- un profil scrapé peut être **le recruteur** d'une offre.

---

## 5. Étude concurrentielle

### 5.1 Méthode et fiabilité des sources

- Recherche web faite le 29/10/2026.
- **Les pages de tarifs officielles n'ont pas été consultées directement.** Plusieurs sont derrière une connexion ou ne s'affichaient pas pour les auteurs des comparatifs. Les prix ci-dessous viennent d'articles tiers datés de 2026. Ils sont marqués **source secondaire** et doivent être revérifiés sur le site de l'éditeur avant toute décision.
- Plusieurs comparatifs sont écrits par des concurrents (Weekday, JobShinobi, LoopCV, PhantomBuster). Ils sont signalés comme tels.
- Les descriptions d'interface marquées « constat général » ne viennent pas d'un test fait pour ce document.

### 5.2 Tableau de synthèse

| Produit | Catégorie | Gratuit | Payant (source secondaire, 2026) | Points forts | Limites rapportées |
|---|---|---|---|---|---|
| [Teal](https://www.tealhq.com) | suivi + CV + IA | oui, crédits IA limités | Teal+ ≈ 13 $/semaine, 29 $/mois, 79 $/trimestre | suite complète, extension de sauvegarde d'offres | IA bridée en gratuit |
| [Huntr](https://huntr.co) | suivi + CV + candidature | oui (100 offres suivies, 2 CV adaptés) | Pro ≈ 40 $/mois, 90 $/3 mois, 160 $/6 mois | tableau de suivi, remplissage de formulaires | pas de support en direct, remplissage inégal |
| [Jobscan](https://www.jobscan.co) | optimisation ATS | ≈ 5 analyses/mois | ≈ 49,95 $/mois, 89,95 $/trimestre | détection de l'ATS de l'employeur, analyse CV, lettre et LinkedIn | prix élevé, plaintes sur la facturation |
| [Simplify](https://simplify.jobs) | remplissage + IA | Copilot gratuit | Simplify+ ≈ 19,99 $/semaine, 39,99 $/mois, 89,99 $/trimestre | extension très bien notée | « Autopilot » contesté : réponses inventées rapportées |
| [Careerflow](https://www.careerflow.ai) | suivi + LinkedIn + CV | oui (1 CV adapté, 10 offres) | Premium ≈ 23,99 $/mois ; Premium Plus ≈ 44,99 $/mois | optimisation du profil LinkedIn, entretiens simulés | bugs et renouvellements imprévus rapportés |
| [Jobright](https://jobright.ai) | recommandation d'offres + IA | oui, limites quotidiennes | Turbo ≈ 39,99 $/mois | score d'adéquation profil/offre | mode agent en liste d'attente, réponse inventée rapportée |
| [Rezi](https://www.rezi.ai) | CV ATS | 1 CV, 3 PDF | ≈ 29 $/mois, 149 $ à vie | score ATS sur 23 critères | centré CV |
| [Kickresume](https://www.kickresume.com) | CV + lettre | oui, sans IA | ≈ 24 €/mois ou 8 €/mois à l'année | modèles soignés, garantie de 14 jours | IA réservée au payant |
| [Enhancv](https://enhancv.com) | CV | essai | ≈ 19,99 à 24,99 $/mois (sources divergentes) | design | prix peu lisible |
| [Reactive Resume](https://github.com/AmruthPillai/Reactive-Resume) | CV open source | tout (MIT, auto-hébergeable) | — | aucune collecte, IA avec sa propre clé, export JSON | pas de suivi de candidatures |
| [PhantomBuster](https://phantombuster.com) | automatisation et extraction | essai | ≈ 69 à 439 $/mois | chaînes d'automatisations multi-plateformes | technique ; exposé aux conditions des plateformes |
| [Waalaxy](https://www.waalaxy.com) | prospection LinkedIn | réduit | ≈ 19 à 139 €/mois par compte LinkedIn | séquences simples LinkedIn + e-mail | usage commercial, exposé aux conditions de LinkedIn |

### 5.3 Fiches concurrents

#### Teal — [tealhq.com](https://www.tealhq.com)

- **Fonctions** :
  - générateur de CV ;
  - suivi des offres ;
  - suggestions IA ;
  - score d'adéquation ;
  - lettres de motivation (source secondaire).
- **Parcours** : une extension de navigateur enregistre une offre depuis un site d'emploi, puis le CV s'adapte depuis l'offre enregistrée (constat général).
- **Personnalisation et suivi** : plusieurs CV, tableau de suivi par statut.
- **Modèle** : gratuit limité. Teal+ à la semaine, au mois ou au trimestre, **sans formule annuelle** (source secondaire, juin 2026).
- **Forces** : tout-en-un, facturation courte adaptée à une recherche d'emploi temporaire.
- **Limites** : les sources divergent sur ce qui est gratuit.
- **Différenciation possible** : marché francophone et marocain, prospection de contacts intégrée.

#### Huntr — [huntr.co](https://huntr.co)

- **Fonctions** :
  - suivi des candidatures ;
  - CV de base et CV adaptés ;
  - « dossiers de candidature » ;
  - remplissage de formulaires ;
  - lettres ;
  - statistiques de recherche.
- **Modèle** :
  - gratuit : 100 offres suivies, 2 CV adaptés, 2 dossiers ;
  - Pro : environ 40 $/mois, avec des remises au trimestre et au semestre.

  Source : revue Weekday d'octobre 2026, écrite par un concurrent.
- **Forces** : tableau de suivi complet.
- **Limites** : pas de support en direct ; l'adaptation marche mieux sur un CV construit dans Huntr.
- **Différenciation possible** : lier le suivi à des contacts et à des contenus LinkedIn.

#### Jobscan — [jobscan.co](https://www.jobscan.co)

- **Fonctions** :
  - comparaison CV/offre ;
  - détection de l'ATS utilisé par l'employeur ;
  - analyse de la lettre et du profil LinkedIn ;
  - suivi ;
  - générateur de CV gratuit.
- **Modèle** : environ 5 analyses gratuites par mois. Premium à environ 49,95 $/mois. Capterra affiche 29,99 $, un chiffre divergent.
- **Forces** : référence de l'optimisation ATS.
- **Limites** : prix, plaintes sur la facturation et la résiliation.
- **Différenciation possible** : la Skill CV contrôle déjà la lecture ATS du PDF produit. Un score d'adéquation à l'offre la compléterait.

#### Simplify — [simplify.jobs](https://simplify.jobs)

- **Fonctions** :
  - extension « Copilot » gratuite de remplissage de formulaires (Greenhouse, Lever, Workday) ;
  - Simplify+ : CV et lettres adaptés, outil de mise en relation ;
  - « Autopilot » : envoi automatique, en bêta, plafonné.
- **Modèle** : Copilot gratuit. Simplify+ à environ 39,99 $/mois (source secondaire).
- **Limites** : réponses inventées ou erronées rapportées en envoi automatique.
- **Enseignement** : **l'envoi automatique est un risque de réputation**. Job Automation ne devrait pas envoyer de candidature sans validation humaine.

#### Careerflow — [careerflow.ai](https://www.careerflow.ai)

- **Fonctions** :
  - CV ;
  - suivi ;
  - optimisation du profil LinkedIn (titre, section « À propos ») ;
  - lettres ;
  - extension Chrome ;
  - entretiens simulés en formule haute.
- **Modèle** : gratuit très limité ; Premium à environ 23,99 $/mois, Premium Plus à environ 44,99 $/mois.
- **Différenciation possible** : la génération de posts LinkedIn existe déjà dans Job Automation, ce qui recoupe la promesse « marque personnelle ».

#### Jobright — [jobright.ai](https://jobright.ai)

- **Fonctions** :
  - recommandation d'offres avec score d'adéquation ;
  - CV adapté ;
  - lettres ;
  - remplissage ;
  - mode agent en liste d'attente.
- **Modèle** : gratuit avec limites quotidiennes, Turbo à environ 39,99 $/mois.
- **Enseignement** : le **score d'adéquation expliqué** est une attente du marché. C'est la base de la Phase 7.

#### Rezi, Kickresume, Enhancv — générateurs de CV

- Rezi met en avant un score ATS sur 23 critères et une formule à vie à environ 149 $.
- Kickresume réserve l'IA au payant.
- Les prix d'Enhancv divergent selon les sources.
- **Enseignement** : le CV seul est un marché encombré. La valeur doit venir du **lien entre l'offre, le CV, la lettre et le suivi**.

#### Reactive Resume — [GitHub](https://github.com/AmruthPillai/Reactive-Resume)

- Générateur de CV open source **MIT**, auto-hébergeable par Docker.
- IA avec sa propre clé (OpenAI, Gemini, Claude), export JSON, import JSON Resume, sans suivi ni publicité.
- **Enseignement** :
  - c'est une référence pour l'export et le format pivot : la compatibilité avec **JSON Resume** est à étudier ;
  - c'est la preuve qu'un modèle « apporte ta propre clé » est accepté par une partie des utilisateurs.

#### PhantomBuster, Waalaxy — prospection et extraction

- Ce sont des outils commerciaux de prospection et d'automatisation (PhantomBuster : à partir d'environ 69 $/mois ; Waalaxy : à partir d'environ 19 €/mois par compte LinkedIn).
- **Enseignement** : ils montrent la demande, mais aussi l'exposition juridique de l'extraction LinkedIn. Job Automation ne doit pas se positionner comme outil d'extraction massive.

### 5.4 Sources d'offres d'emploi utilisables légalement

| Source | Accès | Conditions relevées | Certitude |
|---|---|---|---|
| [France Travail — API Offres d'emploi v2](https://francetravail.io) | compte gratuit, OAuth2 (client credentials) | contrat de licence de réutilisation ; coordonnées de l'employeur seulement s'il y consent ; plafond de résultats par recherche à vérifier | source secondaire + [data.gouv.fr](https://www.data.gouv.fr/datasets/offres-demploi-diffusees-a-france-travail) |
| [Adzuna API](https://developer.adzuna.com) | clé gratuite | environ 25 appels/min et 250/jour en gratuit ; mention « Jobs by Adzuna » ; licence pour un usage commercial durable ; liste de pays à vérifier (Maroc non confirmé) | source secondaire |
| [Remotive API](https://github.com/remotive-com/remote-jobs-api) | public | lien et mention de Remotive obligatoires ; 24 h de délai ; 4 appels par jour au plus ; redistribution vers d'autres agrégateurs interdite | README officiel |
| Saisie manuelle et import par lien | — | l'utilisateur colle une offre ou son URL | — |

Pour le marché marocain (ReKrute, Emploi.ma, etc.), **aucune API publique n'a été trouvée** pendant cette recherche. La saisie manuelle et le collage d'une offre restent la voie sûre.

### 5.5 Positionnement SaaS de Job Automation

**Utilisateurs cibles** (hypothèses à valider avec des entretiens) :

1. Ingénieurs et profils tech francophones en recherche active, au Maroc et en France. C'est le profil du créateur et celui des 6 profils de test de la Skill CV.
2. Jeunes diplômés et personnes en reconversion, accompagnés par une école, un bootcamp ou un cabinet d'outplacement (offre B2B).
3. Profils qui veulent travailler leur visibilité LinkedIn pendant leur recherche.

**Proposition de valeur** : « De l'offre à la candidature suivie, avec un CV ATS contrôlé et des contenus qui ne mentent pas. »

**Différenciation** :

| Atout | Pourquoi c'est différenciant | Appui dans l'existant |
|---|---|---|
| CV ATS **contrôlé automatiquement** (lecture ATS du PDF, cohérence, une page) | les concurrents notent le CV ; peu vérifient le PDF produit | Skill `cv-ats` |
| **Zéro invention** affichée et outillée (`a_confirmer`, contrôle des faits) | des inventions sont reprochées à Simplify et Jobright | règle absolue de la Skill |
| Marché **francophone et marocain** (langue, photo selon le marché, sources d'offres locales) | la plupart des outils visent les USA | Skill CV : règles par marché |
| **Marque personnelle LinkedIn** intégrée (posts, visuels) | rare dans les outils de suivi | générateur de posts et visuel |
| **Coûts maîtrisés** (DeepSeek, open source, auto-hébergement possible) | permet un prix bas ou un mode « apporte ta clé » | stack actuelle |

**Pistes de monétisation à étudier** (aucun tarif fixé ici) :

- **Freemium par quotas IA** : générations par mois, nombre de CV adaptés. C'est le modèle dominant chez les concurrents.
- **Abonnement court** (semaine, mois ou trimestre) : la recherche d'emploi est temporaire, et Teal, Huntr et Simplify facturent ainsi.
- **Pack ponctuel** : par exemple « 1 CV + 3 adaptations ».
- **B2B écoles et outplacement** : licence par cohorte, tableau de bord du conseiller.
- **Mode « apporte ta clé »** pour les utilisateurs techniques.

Repère de marché (sources secondaires) : les formules payantes se situent entre environ **24 et 50 $ par mois**. Le prix final dépendra du coût IA réel par utilisateur, mesuré en Phase 6 (`L6.5`), et du pouvoir d'achat du marché visé.

---

## 6. Architecture cible et dépendances

### 6.1 Cible technique (proposition)

```text
Front React (inchangé dans sa structure)
  │  cookie de session httpOnly
  ▼
Backend Express (modulaire)
  ├─ auth/            comptes, sessions, rôles                         P0
  ├─ ia/              client OpenRouter commun : journal, coût, quota   P0 → P4
  ├─ profils/         recherche, import, normalisation, dédoublonnage   P1
  ├─ offres/          sources d'offres, import, dédoublonnage           P2
  ├─ documents/       CV, lettres, posts, versions, fichiers            P3 → P4
  ├─ candidatures/    statuts, événements, relances                     P5
  └─ compte/          préférences, profil pro, export RGPD, suppression P6
  │
  ├─▶ PostgreSQL (Prisma)                                              P0
  ├─▶ Stockage de fichiers (disque ou S3 compatible, ex. MinIO)        P3
  ├─▶ Service CV privé (Python, conteneur Linux)                       P3
  └─▶ n8n (gardé pour les workflows existants tant que leur remplacement n'est pas validé)
```

### 6.2 Modèle de données cible (première version, à affiner lot par lot)

| Table | Champs principaux | Contrainte clé | Phase |
|---|---|---|---|
| `User` | email, nom, rôle, dates | email unique | P0 |
| `Session` / `Account` | selon la bibliothèque d'authentification (`D-03`) | — | P0 |
| `Preference` | userId, ton, langue, marché, réglages de génération | une par utilisateur | P0 → P6 |
| `RechercheProfils` | userId, requête, lieu, source, nb résultats, statut, date | — | P1 |
| `Profil` | userId, urlNormalisee, nom, poste, entreprise, lieu, extrait, image, source, collecteLe, note, étiquettes | **unique (userId, urlNormalisee)** | P1 |
| `Offre` | userId, source, idSource, url, titre, entreprise, lieu, contrat, télétravail, description, salaire, publiéeLe, empreinte | **unique (userId, source, idSource)** + empreinte pour la saisie manuelle | P2 |
| `ProfilPro` | userId, données au format `cv.json`, version | un actif par utilisateur | P3 |
| `Document` | userId, type (cv, lettre, post, visuel), offreId?, parentId?, version, contenu JSON ou texte, fichier, modèle IA | versions chaînées | P3 → P4 |
| `Candidature` | userId, offreId, statut, cvId?, lettreId?, prochaineAction, échéance | une par (userId, offreId) | P5 |
| `EvenementCandidature` | candidatureId, type, date, note | — | P5 |
| `UsageIA` | userId, fonctionnalité, modèle, jetons entrée et sortie, coût estimé, date | — | P0 |

`GeneratedPostLog` est conservée et migrée vers `Document` + `UsageIA` au lot `L4.3`, sans perte d'historique.

### 6.3 Dépendances entre phases

```text
P0 Socle (tests, PostgreSQL, comptes, client IA commun)
 ├──▶ P1 Profils ───────────────┐
 ├──▶ P2 Offres ──┬─────────────┤
 │                ├──▶ P3 CV ───┤
 │                └──▶ P4 Lettres et posts (lettre : P2 + profil pro de P3)
 │                              │
 │                              ▼
 │                       P5 Candidatures (P2 obligatoire ; P3 et P4 pour joindre les documents)
 ├──▶ P6 Personnalisation et durcissement (le socle des comptes vient de P0 ; P6 complète et audite)
 │                              │
 │                              ▼
 │                       P7 Assistant IA (P2, P3, P5 et des données réelles)
 └──────────────────────▶ P8 Commercialisation (toutes les phases livrées)
```

| Phase | Dépend de | Peut avancer en parallèle de |
|---|---|---|
| P1 | P0 | P2 |
| P2 | P0 | P1 |
| P3 | P0 ; P2 pour l'adaptation à une offre (`L3.4`) | P4 (parties sans offre) |
| P4 | P0 ; P2 et `L3.2` pour la lettre | P3 |
| P5 | P2 ; P3 et P4 pour joindre les documents | — |
| P6 | P0 | P1 à P5 (au fil de l'eau) |
| P7 | P2, P3, P5 | — |
| P8 | P0 à P6 | — |

---

## 7. Décisions à valider

| ID | Décision | Options | Recommandation | Bloque |
|---|---|---|---|---|
| **D-01** | Source de profils après le 01/01/2027 | (a) API SERP tierce payante (Brave Search API ou équivalent), si ses conditions autorisent ce cas d'usage ; (b) sources apportées par l'utilisateur : ajout manuel par URL, import du fichier `Connections.csv` de son **propre export de données LinkedIn**, import CSV ; (c) arrêt de la recherche de profils | **(b) en priorité**, sûre et conforme, avec (a) en option après lecture de ses conditions. Interface `FournisseurProfils` pour en changer sans toucher au reste. | P1 |
| **D-02** | Base de données | SQLite (actuel) ; PostgreSQL | **PostgreSQL** pour le multi-utilisateur. SQLite reste possible en développement si les migrations le permettent. | P0 |
| **D-03** | Authentification | bibliothèque open source (Better Auth, Auth.js…) ; sessions maison (argon2 + cookie httpOnly) ; service hébergé | Bibliothèque open source compatible Express et Prisma, choisie au lot `L0.4` après vérification de sa licence et de sa maintenance | P0 |
| **D-04** | Hébergement | VPS + Docker Compose ; PaaS ; mixte | Étudié en P8 avec la Skill `deployment-devops-advisor`. En attendant : Docker Compose local. | P8 |
| **D-05** | Intégration de la Skill CV | (a) service privé Python dans un dépôt séparé, porté sous Linux (Chromium headless à la place de WebKit, recadrage sans Vision) ; (b) service sur une machine macOS ; (c) rendre `job-automation-` privé et y copier la Skill | **(a)**, qui garde la licence intacte et passe à l'échelle. Le portage est un lot à part (`L3.1`). | P3 |
| **D-06** | Avenir de n8n | garder n8n ; déplacer peu à peu les workflows dans le backend | Garder n8n pour le visuel et les ressources. Le scraper passe derrière l'interface `FournisseurProfils` du backend (`L1.2`) ; la voie n8n reste disponible tant que la parité n'est pas prouvée par les tests. | P1 |
| **D-07** | Nom du produit | « LinkedAI » (interface) ; « Job Automation » (dépôt) ; autre | À trancher avant P8 : nom de domaine, marque, vérification de disponibilité. | P8 |
| **D-08** | Visibilité du dépôt | public ; privé | Privé avant la commercialisation, ou séparer le cœur commercial. Ne pas changer sans instruction explicite. | P3, P8 |
| **D-09** | Marché et langues au lancement | Maroc + France, français d'abord ; anglais ensuite | Français d'abord. Interface prête pour l'anglais (la Skill CV gère déjà `fr` et `en`). | P6 |
| **D-10** | Paiement | Stripe ; marchand de référence (Paddle, Lemon Squeezy) ; paiement local | À étudier en P8 : disponibilité réelle depuis le Maroc (non vérifiée ici), fiscalité. | P8 |
| **D-11** | Données personnelles de tiers (profils) | conservation limitée + suppression ; pas de conservation | Durée de conservation, droit d'opposition, registre. Avis juridique avant P8 (RGPD pour l'UE, loi 09-08 et CNDP au Maroc). | P1, P8 |

---

## 8. Méthode de travail et stratégie de test

### 8.1 Cycle d'un lot

1. **Analyser avant de modifier.** Relire les fichiers listés dans le lot. Noter les comportements existants à préserver. Écrire d'abord les tests qui figent ce comportement (`TNR`).
2. **Écrire les tests du lot** (`TU`, `TI`), puis le code.
3. **Lancer la suite complète** :
   - `npm test` (front et backend) ;
   - `npm run lint` ;
   - `npm run build` ;
   - `verifier-synchro.mjs` si l'interface change ;
   - tests E2E du parcours concerné.
4. **Vérifier les données, pas seulement l'écran** : contenu en base, persistance après actualisation, cas d'erreur, cas vides.
5. **Valider le lot** : tous les critères d'acceptation cochés, documentation mise à jour, commit au bon libellé.
6. **Passage au lot suivant** seulement si la suite complète est verte.

### 8.2 Définition de « terminé »

Un lot est terminé quand :

- [ ] Ses critères d'acceptation sont tous vérifiés et le résultat est écrit dans la PR ou le commit.
- [ ] Les tests `TU`, `TI`, `TF` et `TNR` passent en local et en CI.
- [ ] Les tests `TS` passent dès que le lot touche aux comptes, aux données ou aux droits.
- [ ] Les erreurs ont un message clair à l'écran et une trace dans les journaux serveur.
- [ ] Il n'y a pas de régression sur les parcours existants (`TNR-GLOBAL`, voir 8.4).
- [ ] La documentation est à jour (README, `docs/`, `design.md` si l'interface change).

### 8.3 Outillage (posé au lot `L0.1`)

| Besoin | Outil (open source) | Où |
|---|---|---|
| Tests unitaires front | Vitest + React Testing Library | `frontend/src/**/*.test.jsx` |
| Tests unitaires et d'intégration backend | Vitest (ou node:test) + Supertest | `backend/test/` |
| Simulation des services externes | MSW (front), nock ou serveur factice (backend) | — |
| Base de test | PostgreSQL éphémère (Docker) ou base de test dédiée, remise à zéro à chaque suite | — |
| Tests fonctionnels de bout en bout | Playwright | `e2e/` |
| Tests des workflows n8n | scripts `curl` rejoués contre un n8n de test | `n8n-workflows/tests/` |
| CI | GitHub Actions : lint, tests, build, E2E | `.github/workflows/ci.yml` |

**IA dans les tests** : OpenRouter est **toujours simulé** dans `TU`, `TI` et en CI. Une petite suite de « fumée » réelle, lancée à la main, vérifie la vraie intégration avec un budget plafonné sur la clé.

### 8.4 Suites transverses

- **`TNR-GLOBAL`** (lancée à chaque lot, écrite en `L0.2`) :
  1. génération d'un post ;
  2. ressources ;
  3. visuel et export PNG ;
  4. scraper (fournisseur simulé) ;
  5. dashboard ;
  6. recherche globale ;
  7. paramètres ;
  8. page 404 ;
  9. affichage mobile (375 px).
- **`TS-ISOLATION`** (à partir de `L0.5`) : deux comptes A et B. Pour chaque ressource, B ne peut ni lire, ni modifier, ni supprimer une donnée de A, que ce soit par l'interface, par l'API avec l'identifiant de A, ou par une énumération d'identifiants.
- **Campagne de phase** : à la fin de chaque phase, on rejoue toutes les suites, puis un parcours manuel complet, écrit dans `docs/recette/phase-N.md` avec les résultats réels (date, environnement, captures, anomalies).

---

## Phase 0 — Socle technique

**Objectif** : poser ce sans quoi les phases suivantes ne peuvent être ni testées ni multi-utilisateurs. À la fin :

- les tests tournent en CI ;
- la base est PostgreSQL ;
- un utilisateur peut créer un compte, se connecter et retrouver ses données ;
- les appels IA passent par un client commun qui mesure leur coût.

**État initial** : aucun test (3.7) ; SQLite ; pas de comptes (3.6) ; appel OpenRouter écrit dans la route des posts (3.4) ; `GET /api/posts/logs` ouvert.

**Pourquoi avant le scraping** : la Phase 1 demande de tester la persistance « après déconnexion et reconnexion ». Cela suppose des comptes, et une refonte de la persistance sans tests de non-régression serait risquée.

### L0.1 — Outillage de tests et CI

| Rubrique | Contenu |
|---|---|
| Analyser avant | `frontend/package.json`, `backend/package.json`, `vite.config.js`, workflow `deploy-pages.yml`. |
| Fichiers | `frontend/vitest.config.js`, `backend/vitest.config.js`, `e2e/playwright.config.js`, `.github/workflows/ci.yml`, scripts `test` dans les `package.json`. |
| Modifications | Installer Vitest, RTL, Supertest, MSW et Playwright. Ajouter un premier test par couche. Ajouter le lint au backend. Faire lancer lint, tests et build par la CI à chaque push et chaque PR. |
| À préserver | Le build GitHub Pages et sa variable `VITE_API_URL` ; le build Vercel. |
| Dépendances | Aucune. |
| Critères d'acceptation | `npm test` passe dans `frontend` et `backend`. La CI échoue sur un test rouge (vérifié avec un test volontairement faux, puis retiré). |
| TU | `lib/stats.js` : `postsParJour`, `comparaisonSemaine`, `repartitionParType`, `dateRelative` (jours limites, liste vide). `lib/rateLimit.js` : 20 appels passent, le 21e reçoit 429 avec `Retry-After`. |
| TI | `POST /api/posts/generate` avec OpenRouter simulé : 200 et écriture en base ; 400 si la description est vide ; 400 au-delà de 2 000 caractères ; 502 si OpenRouter échoue. `POST /api/n8n/inconnu` : 404. |
| TF | Playwright : ouverture du dashboard sans erreur console. |
| TNR | Le build du front produit `dist/index.html` et `dist/404.html`. |
| Livrables | Configurations, premiers tests, CI verte, section « Tests » du README. |

### L0.2 — Suite de non-régression des parcours existants

| Rubrique | Contenu |
|---|---|
| Analyser avant | Chaque page de `frontend/src/pages/` et les appels de `services/api.js`. |
| Fichiers | `e2e/tnr/*.spec.js`, données factices dans `e2e/fixtures/`. |
| Modifications | Écrire `TNR-GLOBAL` (8.4) avec un backend dont les services externes sont simulés. Aucun changement du code applicatif. |
| À préserver | Tout le comportement actuel : la suite **fige** l'existant. |
| Dépendances | L0.1. |
| Critères d'acceptation | Les 9 parcours de `TNR-GLOBAL` passent sur `main` sans modification de l'application. |
| Tests | Cette suite **est** le livrable. On vérifie aussi qu'elle échoue quand une route est cassée volontairement. |
| Livrables | Suite E2E, rapport HTML Playwright en artefact de CI. |

### L0.3 — Passage à PostgreSQL et migrations

| Rubrique | Contenu |
|---|---|
| Analyser avant | `schema.prisma`, `prisma/migrations/`, `scripts/init-db.js`, `scripts/list-post-logs.js`, les journaux existants. |
| Fichiers | `backend/prisma/schema.prisma`, nouvelle migration, `docker-compose.yml` (PostgreSQL), `backend/.env.example`, `scripts/dev.sh`. |
| Modifications | Fournisseur `postgresql`, conteneur de développement, script de reprise des journaux SQLite existants. |
| À préserver | Les journaux `GeneratedPostLog` existants, et les commandes `db:init` et `db:logs`. |
| Dépendances | L0.1, `D-02`. |
| Critères d'acceptation | `npm run dev` démarre avec PostgreSQL. Le nombre de journaux est identique avant et après la reprise (comptage vérifié). |
| TU | Script de reprise : conversion d'une ligne SQLite en ligne PostgreSQL. |
| TI | Migration appliquée sur une base vide puis sur une base contenant des données ; `generate` écrit bien en PostgreSQL. |
| TNR | `TNR-GLOBAL`. |
| Livrables | Migration, `docker-compose.yml`, procédure de reprise dans `docs/`. |

### L0.4 — Comptes et sessions

| Rubrique | Contenu |
|---|---|
| Analyser avant | Conditions de `D-03` (licence, maintenance, compatibilité Express et Prisma). `Layout.jsx`, `Topbar.jsx`, `Sidebar.jsx`, `lib/profil.js`. |
| Fichiers | `backend/src/auth/`, tables `User` et `Session`, pages front `Connexion`, `Inscription`, `MotDePasseOublie`, garde de routes dans `App.jsx`. |
| Modifications | Inscription par e-mail et mot de passe (haché par argon2 ou bcrypt, selon la bibliothèque), cookie httpOnly `SameSite=Lax`, `Secure` en production. Déconnexion. Réinitialisation du mot de passe par e-mail (envoi simulé en développement). Le nom affiché vient du compte, plus de `PROFIL` en dur. |
| À préserver | Toutes les routes existantes, derrière la connexion. Le design (nouvelles pages ajoutées à `design.md` avec leurs `P-xx`). |
| Dépendances | L0.3. |
| Critères d'acceptation | Créer un compte, se déconnecter, se reconnecter : la session tient après une actualisation. Une route de l'API sans session répond 401. |
| TU | Validation de l'e-mail et de la robustesse du mot de passe ; garde de route front. |
| TI | Inscription (201), doublon d'e-mail (409), connexion fausse (401, même message pour un e-mail inconnu et un mauvais mot de passe), déconnexion (le cookie n'est plus valide). |
| TF | Playwright : inscription → dashboard → déconnexion → reconnexion. |
| TS | Le cookie n'est pas lisible en JavaScript ; limite de tentatives de connexion ; jeton de réinitialisation à usage unique et expirant ; CORS avec `credentials` limité à `CORS_ORIGINS`. |
| TNR | `TNR-GLOBAL`, rejouée connecté. |
| Livrables | Module d'authentification, pages, `docs/architecture.md` mis à jour. |

### L0.5 — Rattachement des données existantes au compte

| Rubrique | Contenu |
|---|---|
| Analyser avant | Tous les usages de `userId` (`routes/posts.js`) ; `GET /api/posts/logs`. |
| Fichiers | Intergiciel `exigerSession`, `routes/posts.js`, `services/api.js`. |
| Modifications | `userId` tiré de la session, **jamais du corps ni de l'URL**. `GET /api/posts/logs` ne renvoie que les journaux de l'utilisateur. La limite d'appels s'applique par utilisateur et par IP. |
| À préserver | Le contrat de réponse de `POST /api/posts/generate`, que le front lit déjà. |
| Dépendances | L0.4. |
| Critères d'acceptation | `userId` est rempli sur chaque nouveau journal. Un utilisateur ne voit que ses journaux. |
| TI | Génération connectée → `userId` correct. Un `userId` forgé dans le corps est ignoré. |
| TS | Première version de `TS-ISOLATION` sur les journaux. |
| TNR | `TNR-GLOBAL`. |
| Livrables | Intergiciel, tests d'isolation. |

### L0.6 — Client IA commun et mesure des coûts

| Rubrique | Contenu |
|---|---|
| Analyser avant | `routes/posts.js` (appel OpenRouter, gestion d'erreur 502) ; workflow du visuel. |
| Fichiers | `backend/src/ia/client.js`, table `UsageIA`. |
| Modifications | Une fonction `appelerIA({ fonctionnalite, messages, userId })` gère le modèle, le délai maximal, les erreurs lisibles et l'écriture dans `UsageIA` (jetons d'entrée et de sortie lus dans la réponse d'OpenRouter, coût estimé). La route des posts l'utilise. |
| À préserver | Le modèle `deepseek/deepseek-chat`, le texte du prompt des posts, les messages d'erreur montrés à l'utilisateur. |
| Dépendances | L0.5. |
| Critères d'acceptation | Chaque génération de post crée une ligne `UsageIA`. Le coût cumulé par utilisateur peut être consulté par une requête. |
| TU | Calcul du coût à partir des jetons et d'un tarif en configuration ; formatage des erreurs. |
| TI | OpenRouter simulé : réponse normale, délai dépassé, 429, 500. |
| TNR | `TNR-GLOBAL`. |
| Livrables | Client IA, tarifs en configuration (pas en dur), section « Coûts » dans `docs/`. |

### L0.7 — Reprise des données du navigateur

| Rubrique | Contenu |
|---|---|
| Analyser avant | Structure de `linkedai-storage` (`useAppStore.js`, `partialize`). |
| Fichiers | `POST /api/compte/import-local`, composant d'import au premier login. |
| Modifications | À la première connexion, proposer d'importer les posts, profils et paramètres présents dans `localStorage`. L'import est idempotent (aucun doublon s'il est relancé). |
| À préserver | Les données locales, qui ne sont effacées qu'après confirmation d'un import réussi. |
| Dépendances | L0.5. Les tables profils et documents arrivent en L1.1 et L4.3 : l'import est **étendu** dans ces lots. |
| Critères d'acceptation | Un navigateur avec des données → compte : les mêmes chiffres au dashboard avant et après. |
| TU | Conversion de chaque type d'objet local. |
| TI | Import deux fois → aucun doublon. |
| TF | Parcours complet sur un navigateur préparé avec des données. |
| Livrables | Import, note dans le README. |

**Campagne de fin de Phase 0** : `TNR-GLOBAL` + `TS-ISOLATION` (journaux) + recette manuelle `docs/recette/phase-0.md`.

---

## Phase 1 — Fiabilisation du scraping

**Objectif** : les profils trouvés sont **enregistrés côté serveur pour l'utilisateur**, sans doublon ni perte silencieuse, avec un schéma stable, une fiche détaillée lisible et des actions utiles. La source de profils est **conforme** et survit à la fin de Google Custom Search.

**État initial** : causes C1 à C8 (3.3) ; table à 4 colonnes ; source qui ferme le 01/01/2027.

### L1.1 — Persistance serveur des profils

| Rubrique | Contenu |
|---|---|
| Analyser avant | `useAppStore.js` (`addProfiles`, `partialize`), `Scraper.jsx`, `exportCsv.js`, `RechercheGlobale.jsx` et `Dashboard.jsx` (lecteurs de `scrapedProfiles`). |
| Fichiers | Tables `Profil` et `RechercheProfils` ; `backend/src/profils/routes.js` (`GET /api/profils`, `POST /api/profils/lot`, `PATCH /api/profils/:id`, `DELETE /api/profils/:id`) ; `services/api.js` ; store (cache seulement). |
| Modifications | La source de vérité devient le serveur. Le store ne garde qu'un cache. La liste est **paginée côté serveur** : plus de troncature à 200. |
| À préserver | Export CSV, recherche globale, compteurs du dashboard, filtre texte. |
| Dépendances | P0. |
| Critères d'acceptation | Trouver 300 profils, actualiser : 300 profils. Se déconnecter, se reconnecter sur un autre navigateur : 300 profils. |
| TU | Mapper serveur → front ; pagination. |
| TI | `POST /api/profils/lot` → lignes créées avec `userId` ; `GET` paginé ; `DELETE` d'un profil d'un autre utilisateur → 404. |
| TF | Playwright : recherche (fournisseur simulé) → actualiser → déconnexion → reconnexion → mêmes profils. |
| TNR | Export CSV identique (mêmes colonnes) ; dashboard ; `TNR-GLOBAL`. |
| TS | `TS-ISOLATION` sur `Profil` et `RechercheProfils`. |
| Livrables | Module profils, migration, import local étendu (L0.7). |

### L1.2 — Interface `FournisseurProfils` et normalisation

| Rubrique | Contenu |
|---|---|
| Analyser avant | Workflow `linkedin-scraper-webhook.json` (découpage du titre), `findProfiles` dans `Scraper.jsx`, `routes/n8n.js`. **Relever un échantillon réel** de réponses Google pour vérifier l'hypothèse C8. |
| Fichiers | `backend/src/profils/fournisseurs/` (`n8nGoogle.js`, puis ceux choisis en `D-01`) ; `backend/src/profils/normaliser.js`. |
| Modifications | Une interface `rechercher({ requete, lieu, pages }) → ProfilBrut[]`. Une normalisation unique produit `{ urlNormalisee, nom, poste, entreprise?, lieu?, extrait, image, source }` : URL sans paramètres ni barre finale, suffixe « \| LinkedIn » retiré, poste et entreprise séparés quand c'est possible. Validation par schéma (zod ou équivalent) : un profil sans URL valide est rejeté et compté. |
| À préserver | La voie n8n actuelle (premier fournisseur) et le webhook réglable dans Paramètres. |
| Dépendances | L1.1, `D-01`, `D-06`. |
| Critères d'acceptation | Les profils enregistrés ont tous le même schéma. Le nombre de rejetés est renvoyé et affiché. |
| TU | `normaliser` sur un jeu de titres réels anonymisés : avec ou sans entreprise, avec ou sans suffixe, caractères accentués, URL avec `?trk=` ou pays (`ma.linkedin.com`). |
| TI | Fournisseur n8n simulé → profils normalisés en base ; réponse mal formée → erreur claire, rien d'écrit. |
| TNR | Le webhook n8n réglé dans Paramètres fonctionne toujours. |
| Livrables | Interface, normalisation, jeu de tests d'échantillons. |

### L1.3 — Dédoublonnage et mise à jour

| Rubrique | Contenu |
|---|---|
| Analyser avant | Contrainte `unique (userId, urlNormalisee)` ; règles de fusion. |
| Fichiers | `profils/service.js`. |
| Modifications | Une insertion qui retombe sur la même URL ne crée pas de doublon : elle met à jour poste, extrait et date de collecte, et garde la note et les étiquettes de l'utilisateur. Le résultat d'une recherche indique « X nouveaux, Y mis à jour, Z rejetés ». |
| À préserver | Les notes et étiquettes, jamais écrasées. |
| Dépendances | L1.2. |
| Critères d'acceptation | Relancer la même recherche deux fois → 0 nouveau profil au second passage. |
| TU | Règles de fusion. |
| TI | Deux lots qui se chevauchent → nombre de lignes exact ; deux utilisateurs avec la même URL → deux lignes distinctes. |
| TS | Le dédoublonnage ne fuit pas entre comptes : la réponse à B ne dit pas que A a déjà ce profil. |
| Livrables | Service, messages de résultat. |

### L1.4 — Sources conformes après Google Custom Search

| Rubrique | Contenu |
|---|---|
| Analyser avant | Conditions d'utilisation de chaque source retenue en `D-01`. Format du fichier `Connections.csv` de l'export de données LinkedIn (à vérifier sur un export réel de l'utilisateur). |
| Fichiers | `profils/fournisseurs/importCsv.js`, `ajoutManuel.js`, éventuellement `serpApi.js` ; écran d'import. |
| Modifications | (1) Ajout manuel d'un profil par URL et champs saisis. (2) Import CSV (export LinkedIn de l'utilisateur, ou CSV générique avec correspondance des colonnes). (3) Option : fournisseur SERP tiers, seulement si ses conditions le permettent. Message clair à l'écran quand Google Custom Search n'est plus disponible. |
| À préserver | Les profils déjà enregistrés et la recherche n8n tant qu'elle répond. |
| Dépendances | L1.2, L1.3, `D-01`, `D-11`. |
| Critères d'acceptation | Le 01/01/2027, la page Profils reste utilisable : ajout manuel et import fonctionnent, la recherche Google affiche un message explicite au lieu d'une erreur technique. |
| TU | Analyse CSV : séparateur `,` ou `;`, encodage UTF-8 avec ou sans BOM, colonnes manquantes, lignes vides. |
| TI | Import de 500 lignes → nombres exacts ; un fournisseur Google qui renvoie 403 ou 410 → message « source indisponible ». |
| TF | Importer un CSV, retrouver les profils, les filtrer. |
| Livrables | Fournisseurs, écran d'import, `docs/n8n.md` et `docs/sources.md` mis à jour. |

### L1.5 — Fiche profil et liste détaillée

| Rubrique | Contenu |
|---|---|
| Analyser avant | `TableProfils.jsx` (C-24), `design.md` (composants et tokens disponibles), maquette Nexora. |
| Fichiers | `components/profils/CarteProfil.jsx`, `FicheProfil.jsx` (panneau latéral ou page `/profils/:id`), `design.md` (nouveaux `C-xx`). |
| Modifications | Liste avec poste, entreprise, lieu, source et date de collecte. Tri (date, nom) et filtres (recherche d'origine, étiquette, source). Fiche détaillée : toutes les informations disponibles, extrait complet, lien, historique de collecte, **note libre**, **étiquettes**, actions (ouvrir, copier le lien, supprimer, relier à une offre en P2). La hiérarchie visuelle suit les tokens existants. |
| À préserver | La règle CloneMe : aucune couleur ni durée en dur, contrôle `verifier-synchro` vert. Le responsive à 375 px. |
| Dépendances | L1.1 à L1.3. |
| Critères d'acceptation | Toutes les données enregistrées d'un profil sont visibles dans sa fiche. Note et étiquette restent après actualisation. Lisible à 375 px. |
| TU | `CarteProfil` avec profil complet, profil sans image, sans poste, avec nom très long. |
| TI | `PATCH` note et étiquettes → relu identique. |
| TF | Ouvrir une fiche, ajouter une note, actualiser, retrouver la note. |
| TNR | Le filtre texte existant ; l'export CSV, qui inclut désormais note et étiquettes (colonnes ajoutées à la fin). |
| Livrables | Composants, `design.md`, `palette.md` si un token est ajouté, captures dans la recette. |

### L1.6 — États d'erreur, de chargement et de profil incomplet

| Rubrique | Contenu |
|---|---|
| Analyser avant | Les messages actuels de `Scraper.jsx` (sans accents, techniques). |
| Fichiers | `Scraper.jsx` (ou page Profils renommée), composants d'état. |
| Modifications | Squelettes de chargement ; progression par page ; annulation d'une recherche longue ; messages en français correct et compréhensibles (quota épuisé, source indisponible, réseau, délai). Le profil incomplet est affiché avec « non renseigné ». **« Vider » demande une confirmation**, avec une suppression par sélection à la place d'une suppression totale. |
| À préserver | Les notifications `react-hot-toast` et le `TopLoader`. |
| Dépendances | L1.5. |
| Critères d'acceptation | Chaque erreur simulée (429, 403, 500, délai, réseau) affiche un message différent et compréhensible. Aucun texte technique brut à l'écran. |
| TU | Table de correspondance erreur → message. |
| TF | Playwright : chaque erreur simulée → message attendu ; « Vider » → annulation possible. |
| TNR | `TNR-GLOBAL`. |
| Livrables | États, messages, recette. |

### L1.7 — Conservation et droits des personnes (profils de tiers)

| Rubrique | Contenu |
|---|---|
| Analyser avant | `D-11`. Les données réellement gardées par profil. |
| Fichiers | Tâche planifiée de purge, réglage de durée, `docs/donnees-personnelles.md`. |
| Modifications | Durée de conservation réglable, avec une valeur par défaut à décider. Purge automatique. Suppression définitive d'un profil à la demande. Pas d'enrichissement à partir de sources non autorisées. |
| Dépendances | L1.1, `D-11`. |
| Critères d'acceptation | Un profil plus ancien que la durée est supprimé par la tâche, et la purge est journalisée. |
| TU | Sélection des profils à purger (bornes de dates). |
| TI | Lancer la tâche sur une base préparée → nombres exacts. |
| TS | La purge d'un utilisateur ne touche pas les profils d'un autre. |
| Livrables | Tâche, documentation. |

**Campagne de fin de Phase 1** :

- `TNR-GLOBAL` et `TS-ISOLATION` (profils) ;
- test « 01/01/2027 » : fournisseur Google forcé hors service ;
- test de persistance : actualisation, autre navigateur, déconnexion et reconnexion ;
- recette `docs/recette/phase-1.md`.

---

## Phase 2 — Gestion des offres d'emploi

**Objectif** : l'utilisateur rassemble ses offres (importées d'une source autorisée, collées ou saisies), les consulte, les recherche, les filtre, les enregistre, sans doublon. Il les relie à des profils (recruteur, contact).

**État initial** : page d'attente `JobsFinder.jsx` ; `savedJobs` et `toggleSavedJob` inutilisés (identifiant = lien).

### L2.1 — Modèle Offre et saisie manuelle

| Rubrique | Contenu |
|---|---|
| Analyser avant | `JobsFinder.jsx`, `savedJobs` dans le store, le compteur « Offres sauvées » du dashboard. |
| Fichiers | Table `Offre` ; `backend/src/offres/` ; page `/offres` ; formulaire. |
| Modifications | Créer, modifier, supprimer une offre : titre, entreprise, lieu, contrat, télétravail, URL, description, salaire facultatif, date. **Coller le texte d'une offre** : une extraction IA (client commun) préremplit les champs, et l'utilisateur valide. |
| À préserver | Route `/offres`, entrée de navigation, compteur du dashboard (branché sur le serveur). |
| Dépendances | P0. |
| Critères d'acceptation | Une offre créée reste après actualisation et reconnexion. L'extraction ne remplit jamais un champ absent du texte (vide plutôt qu'inventé). |
| TU | Validation des champs ; empreinte de dédoublonnage (titre, entreprise, lieu normalisés). |
| TI | CRUD complet ; extraction avec IA simulée : un champ absent reste vide. |
| TF | Coller une offre réelle anonymisée → relire → enregistrer → retrouver. |
| TS | `TS-ISOLATION` sur `Offre`. |
| Livrables | Module offres, page, `design.md`. |

### L2.2 — Liste, recherche, filtres, détail

| Rubrique | Contenu |
|---|---|
| Fichiers | Page liste, fiche `/offres/:id`, recherche serveur (`ILIKE`, ou recherche plein texte PostgreSQL). |
| Modifications | Recherche par mot-clé ; filtres (contrat, télétravail, lieu, source, enregistrée) ; tri par date ; fiche détaillée avec description complète et actions (enregistrer, ouvrir, préparer CV et lettre, créer une candidature en P5). |
| Dépendances | L2.1. |
| Critères d'acceptation | Les filtres se combinent correctement sur un jeu de 200 offres de test. Les résultats sont paginés. |
| TU | Construction des filtres. |
| TI | Requêtes filtrées → résultats exacts. |
| TF | Rechercher, filtrer, ouvrir une fiche, enregistrer. |
| TNR | Recherche globale de la barre du haut (étendue aux offres). |
| Livrables | Pages, composants, recette. |

### L2.3 — Sources d'offres autorisées

| Rubrique | Contenu |
|---|---|
| Analyser avant | Conditions de France Travail, Adzuna et Remotive (5.4), relues sur les sites officiels ; disponibilité pour le Maroc. |
| Fichiers | `offres/sources/franceTravail.js`, `adzuna.js`, `remotive.js` ; secrets dans `backend/.env`. |
| Modifications | Recherche dans une source, puis import sélectif des offres choisies. Respect des quotas (cache, fréquence) et des mentions obligatoires (attribution, lien vers l'annonce). |
| À préserver | La saisie manuelle, qui reste la voie universelle. |
| Dépendances | L2.1, L2.2. Validation des conditions de chaque source. |
| Critères d'acceptation | Une offre importée garde sa source, son identifiant et son lien d'origine. La mention de la source est affichée. Les quotas ne sont jamais dépassés (compteur). |
| TU | Correspondance de chaque format de source avec `Offre`. |
| TI | Sources simulées : réponse normale, quota dépassé, panne. Import en double → aucun doublon (`unique (userId, source, idSource)`). |
| TF | Chercher dans une source, importer 3 offres, les retrouver. |
| Livrables | Connecteurs, `docs/sources.md`. |

### L2.4 — Dédoublonnage multi-sources

| Rubrique | Contenu |
|---|---|
| Modifications | Même offre trouvée dans deux sources ou saisie à la main : l'empreinte la détecte et propose une fusion, jamais une fusion automatique silencieuse. |
| Dépendances | L2.3. |
| Critères d'acceptation | Sur un jeu préparé de 20 paires (10 vrais doublons, 10 faux), le rappel et la précision sont mesurés et écrits dans la recette. Seuil à fixer après mesure. |
| TU | Empreinte sur des variantes (casse, accents, « H/F », lieu abrégé). |
| TI | Fusion → les liens (profils, documents) sont conservés. |
| Livrables | Algorithme, jeu de test, mesure. |

### L2.5 — Relations offre ↔ profils

| Rubrique | Contenu |
|---|---|
| Modifications | Table de liaison `OffreProfil` (rôle : recruteur, contact, collègue). Relier depuis la fiche offre ou depuis la fiche profil. |
| Dépendances | L1.5, L2.2. |
| Critères d'acceptation | Le lien est visible des deux côtés. Supprimer un profil retire le lien sans supprimer l'offre. |
| TI | Suppressions en cascade correctes. |
| TS | Impossible de relier un profil de B à une offre de A. |
| Livrables | Liaison, interface. |

**Campagne de fin de Phase 2** : `TNR-GLOBAL`, `TS-ISOLATION` (offres et liaisons), test de quotas des sources, recette `docs/recette/phase-2.md`.

---

## Phase 3 — Génération de CV et intégration de la Skill ATS

**Objectif** : à partir du **profil professionnel** de l'utilisateur et, si elle est choisie, d'une **offre**, produire un CV ATS contrôlé (PDF une page), versionné et conservé. Rien n'est inventé.

**État initial** : rien dans l'application. La Skill `cv-ats` (3.8) est privée, propriétaire, sous macOS, et sans adaptation à une offre.

### L3.1 — Service CV portable (dépôt privé)

| Rubrique | Contenu |
|---|---|
| Analyser avant | `scripts/cv.py`, `rendu.py`, `verifications.py`, `domaines.py`, `cvtool.swift` (fonctions : PDF, texte, aperçus, recadrage) ; `tests/lancer_tests.py` ; licence (`D-05`, `D-08`). |
| Fichiers | **Dépôt privé séparé** (ex. `StackLLM/cv-service`) : couche HTTP (FastAPI ou équivalent), `Dockerfile` Linux. |
| Modifications | Remplacer chaque fonction de `cvtool` par un équivalent Linux : PDF A4 par Chromium headless (Playwright) ; texte par pdfplumber ou pdftotext ; aperçus PNG par rendu de page ; recadrage du visage par une bibliothèque libre (OpenCV) **ou** un recadrage manuel par l'utilisateur en premier temps. Garder `rendu.py`, `verifications.py`, `domaines.py`, `cv.css`, `ajustement.js`. API : `POST /construire { cv, themes } → { pdfs, rapport }`, `POST /detecter`. |
| À préserver | Le gabarit V4, les 3 thèmes, les règles de photo par marché, les contrôles, la police Geist (licence OFL). |
| Dépendances | `D-05`. |
| Critères d'acceptation | Les 6 profils de `tests/` passent la chaîne sous Linux. Les contrôles ATS sont au même niveau que sur macOS. Écart visuel jugé acceptable sur les aperçus (comparaison côte à côte dans la recette). |
| TU | Tests existants de la Skill ; chaque remplaçant de `cvtool` séparément. |
| TI | Appel HTTP avec chaque profil de test → 3 PDF + rapport sans erreur. |
| TNR | Mêmes sorties de contrôle (`rapport.md`) entre macOS et Linux pour les 6 profils, différences listées. |
| TS | Le service n'est joignable que par le backend (réseau interne). Taille d'entrée limitée. Pas d'exécution de contenu fourni. |
| Livrables | Dépôt privé, image Docker, rapport de comparaison macOS/Linux. |

### L3.2 — Profil professionnel de l'utilisateur

| Rubrique | Contenu |
|---|---|
| Analyser avant | `references/schema.md` (format `cv.json`), `assets/profil-modele.md`. |
| Fichiers | Table `ProfilPro` ; page `/profil` (formulaire par sections) ; import d'un ancien CV (PDF, texte). |
| Modifications | L'utilisateur remplit ou importe son profil. L'import passe par le client IA, avec les règles de la Skill (ne rien inventer, `a_confirmer`). La sortie est **validée par un schéma JSON** avant d'être enregistrée. Les points `a_confirmer` sont montrés comme des questions à l'utilisateur. |
| À préserver | La règle absolue « ne jamais inventer ». |
| Dépendances | P0, L3.1 (schéma partagé). |
| Critères d'acceptation | Un ancien CV importé donne un profil où chaque entreprise, date et diplôme figure dans la source. Les ambiguïtés sont listées. |
| TU | Validation du schéma ; contrôle des faits (chaque entreprise, date, certification et diplôme de la sortie se retrouve dans le texte source normalisé). |
| TI | IA simulée qui invente une entreprise → **rejet** avec un message. |
| TF | Importer un CV de test → corriger les points à confirmer → enregistrer. |
| TS | `TS-ISOLATION` sur `ProfilPro`. Fichiers importés analysés sans exécution, taille et type limités. |
| Livrables | Page profil, import, contrôle des faits. |

### L3.3 — Génération d'un CV générique

| Rubrique | Contenu |
|---|---|
| Fichiers | `backend/src/documents/cv.js` ; stockage des fichiers ; page `/cv`. |
| Modifications | Profil pro → `cv.json` (réglages langue, marché, domaine, niveau) → service CV → 3 PDF enregistrés comme `Document` (type `cv`, version 1). Le rapport de contrôle est résumé à l'utilisateur : erreurs bloquantes, avertissements, points à confirmer. Une erreur bloquante empêche la livraison. |
| Dépendances | L3.1, L3.2. |
| Critères d'acceptation | Le PDF téléchargé est celui qui a passé les contrôles. Le texte extrait du PDF contient nom, e-mail, postes et dates. |
| TI | Bout en bout avec service CV réel en conteneur de test, IA simulée. |
| TF | Générer, télécharger, rouvrir plus tard. |
| TS | Lien de téléchargement réservé au propriétaire (URL signée et expirante, ou route authentifiée). |
| Livrables | Module CV, page, stockage. |

### L3.4 — CV adapté à une offre

| Rubrique | Contenu |
|---|---|
| Analyser avant | Ce que la Skill ne fait pas (3.8, contrainte 3). Les attentes du marché (score d'adéquation chez Jobscan et Jobright). |
| Modifications | Depuis une offre : extraction des exigences (compétences, outils, niveau, langue) → **réordonner et reformuler** le profil pour l'offre (titre visé, profil, ordre des missions, compétences mises en avant), **sans ajouter de fait**. Rapport d'adéquation : exigences couvertes, couvertes partiellement, absentes. Une exigence absente reste absente et devient une suggestion. |
| À préserver | Contrôle des faits de L3.2, appliqué à chaque version. |
| Dépendances | L3.3, P2. |
| Critères d'acceptation | Sur un jeu de paires profil/offre de test, aucune compétence absente du profil n'apparaît dans le CV (0 tolérance). La couverture des mots-clés de l'offre est mesurée et affichée. |
| TU | Calcul de couverture ; détection d'ajout de fait. |
| TI | IA simulée qui ajoute « Kubernetes » absent du profil → rejet. |
| TF | Offre → « Préparer un CV » → rapport d'adéquation → PDF. |
| Livrables | Adaptation, rapport d'adéquation, jeu d'évaluation. |

### L3.5 — Versions et traçabilité

| Modifications | Chaque génération crée une version liée à son parent, à l'offre et au profil pro utilisé. Comparaison entre deux versions, restauration, nom de fichier `CV-Nom-Prenom-<Entreprise>-v<N>-<Thème>.pdf`. |
|---|---|
| Dépendances | L3.3, L3.4. |
| Critères d'acceptation | On retrouve pour chaque PDF : la version du profil, l'offre, la date et le modèle IA. |
| Tests | TU (numérotation, nommage) ; TI (restauration) ; TS (versions d'autrui invisibles). |
| Livrables | Historique, comparaison. |

**Campagne de fin de Phase 3** :

- les 6 profils de la Skill et un jeu profil/offre ;
- contrôle « zéro invention » ;
- `TNR-GLOBAL` et `TS-ISOLATION` (profils pro, documents, fichiers) ;
- recette `docs/recette/phase-3.md`.

---

## Phase 4 — Lettres de motivation et publications

**Objectif** : des lettres adaptées à une offre et des posts LinkedIn personnalisés, enregistrés côté serveur, rééditables et versionnés, produits par des services communs.

**État initial** : posts ✅ mais modifications non enregistrées (3.2) et double stockage local et serveur ; lettre 🆕 (page d'attente, `letters` inutilisé).

### L4.1 — Audit outillé des générations existantes

| Rubrique | Contenu |
|---|---|
| Analyser avant | Prompt de `routes/posts.js`, workflow du visuel, `PostGenerator.jsx`. |
| Modifications | Un **jeu d'évaluation** de 20 entrées représentatives (types et tons), avec une grille : respect du ton, longueur, absence de fait inventé, lisibilité, hashtags. Évaluation humaine ou par un modèle juge, documentée. Aucun changement de prompt dans ce lot. |
| Livrables | `docs/evaluation/posts.md` avec les **résultats réels** mesurés. Ils servent de référence pour la suite. |

### L4.2 — Paramètres de génération communs

| Modifications | Paramètres partagés par posts, lettres et CV : langue, ton, longueur, niveau de formalité, signature, mots à éviter. Valeurs par défaut dans `Preference`, modifiables à chaque génération. |
|---|---|
| À préserver | Le ton par défaut existant (`settings.defaultTone`) : il est repris dans `Preference`. |
| Dépendances | P0. |
| Tests | TU (fusion préférences + choix ponctuel) ; TI (préférences appliquées dans le prompt simulé) ; TNR (le ton par défaut fonctionne comme aujourd'hui). |

### L4.3 — Posts côté serveur, réédition et versions

| Rubrique | Contenu |
|---|---|
| Analyser avant | `addPost`, `PostGenerator.jsx:155` (zone modifiable), historique, `location.state.postId`, `GeneratedPostLog`. |
| Modifications | Les posts deviennent des `Document` de type `post`. **Enregistrer la modification** crée une nouvelle version. Les `GeneratedPostLog` existants sont repris en documents et usages IA sans perte. Le store ne garde qu'un cache. |
| À préserver | Ressources, visuel, export PNG, ouverture d'un post depuis le dashboard ou la recherche. |
| Dépendances | L0.6, L4.2. |
| Critères d'acceptation | Modifier un post, actualiser : la modification est là. Le nombre de posts avant et après la reprise est identique. |
| TU | Création de version. |
| TI | Reprise des journaux (comptage) ; `PATCH` → nouvelle version. |
| TF | Générer → modifier → enregistrer → reconnexion → retrouver la version modifiée. |
| TNR | Dashboard (répartition par type, activité), `TNR-GLOBAL`. |
| Livrables | Migration, module documents, import local étendu. |

### L4.4 — Lettre de motivation adaptée

| Rubrique | Contenu |
|---|---|
| Analyser avant | `MotivationLetter.jsx` (ce que la page annonce : import PDF/DOCX, collage d'offre, export PDF/DOCX). |
| Modifications | Entrées : offre (P2, ou texte collé), profil pro (L3.2), éventuellement une lettre existante importée, paramètres (L4.2). Sortie : lettre structurée, modifiable, versionnée. Contrôle des faits (comme L3.2). Export PDF (service de rendu commun) et DOCX (bibliothèque `docx`, MIT). |
| À préserver | Route `/lettre`, compteur « Lettres créées » du dashboard (branché sur le serveur). |
| Dépendances | L2.1, L3.2, L4.2. |
| Critères d'acceptation | La lettre cite l'entreprise et le poste de l'offre, et aucun fait absent du profil. Les exports s'ouvrent dans un lecteur PDF et dans Word ou LibreOffice. |
| TU | Contrôle des faits ; gabarit DOCX. |
| TI | IA simulée ; import d'une lettre DOCX et PDF ; fichiers invalides refusés. |
| TF | Offre → « Préparer une lettre » → modifier → exporter. |
| TS | Fichiers importés : type, taille, pas de macro exécutée ; `TS-ISOLATION` sur les lettres. |
| Livrables | Page lettre, exports, recette. |

### L4.5 — Visuels enregistrés

| Modifications | Enregistrer le HTML d'un visuel et son PNG comme `Document` de type `visuel`, lié au post. Rouvrir sans régénérer, donc sans coût IA. |
|---|---|
| À préserver | iframe isolée et export par `postMessage` (aucune réduction du bac à sable). |
| Tests | TI (enregistrement et relecture) ; TS (le HTML enregistré n'est jamais rendu hors de l'iframe isolée) ; TNR (export PNG). |

**Campagne de fin de Phase 4** :

- jeu d'évaluation rejoué, avec comparaison chiffrée à L4.1 ;
- `TNR-GLOBAL` et `TS-ISOLATION` (documents) ;
- recette `docs/recette/phase-4.md`.

---

## Phase 5 — Suivi des candidatures et progression

**Objectif** : chaque candidature est rattachée à une offre et porte son statut, son historique, ses documents et sa prochaine étape. Les indicateurs sont **calculés à partir des données réelles**.

**État initial** : rien. Le dashboard calcule déjà ses chiffres depuis les données (`lib/stats.js`), un principe à garder.

### L5.1 — Modèle et statuts

| Rubrique | Contenu |
|---|---|
| Modifications | Tables `Candidature` et `EvenementCandidature`. Statuts proposés, à valider : `à postuler`, `postulée`, `entretien`, `offre reçue`, `acceptée`, `refusée`, `abandonnée`. Transitions autorisées définies dans une seule fonction. Chaque changement crée un événement daté. |
| Dépendances | L2.1. |
| Critères d'acceptation | Une transition interdite est refusée par l'API, pas seulement masquée à l'écran. |
| TU | Matrice des transitions. |
| TI | Changement de statut → événement créé ; transition interdite → 422. |
| TS | `TS-ISOLATION` sur candidatures et événements. |

### L5.2 — Tableau de suivi

| Modifications | Vue en colonnes par statut, avec glisser-déposer accessible au clavier, et vue liste avec filtres. Fiche candidature : offre, CV et lettre joints (versions exactes), contacts liés, historique, notes. |
|---|---|
| Dépendances | L5.1 ; L3.5 et L4.4 pour les documents joints. |
| Critères d'acceptation | Un déplacement est enregistré et survit à l'actualisation ; il est possible au clavier. |
| Tests | TU (composants) ; TF (déplacer, rouvrir) ; TNR (navigation, design, 375 px). |

### L5.3 — Prochaines étapes et relances

| Modifications | Prochaine action avec échéance. Liste « à faire aujourd'hui » au dashboard. Relance suggérée après un délai réglable sans réponse. Notifications dans l'application ; l'e-mail est optionnel et plus tard. |
|---|---|
| Critères d'acceptation | Une candidature `postulée` sans événement depuis N jours apparaît dans les relances (N réglable). |
| Tests | TU (calcul des échéances, fuseaux horaires) ; TI (liste du jour). |

### L5.4 — Indicateurs réels

| Rubrique | Contenu |
|---|---|
| Modifications | Indicateurs définis par une formule écrite à côté du code et dans `docs/indicateurs.md` : candidatures envoyées par semaine ; taux de réponse = candidatures ayant au moins un événement de réponse ÷ candidatures postulées ; délai médian avant réponse ; conversion par étape ; répartition par source d'offre. **Aucun chiffre affiché sans données** : état vide explicite. |
| À préserver | Indicateurs actuels du dashboard (posts). |
| Critères d'acceptation | Sur un jeu de données de test connu, chaque indicateur affiché est égal au calcul fait à la main dans le test. |
| Tests | TU (chaque formule, division par zéro, petits effectifs) ; TF (dashboard avec données de test) ; TNR (indicateurs existants). |

**Campagne de fin de Phase 5** : parcours complet offre → CV → lettre → candidature → entretien → réponse ; indicateurs comparés au calcul manuel ; `TNR-GLOBAL`, `TS-ISOLATION` ; recette `docs/recette/phase-5.md`.

---

## Phase 6 — Personnalisation et durcissement multi-utilisateur

**Objectif** : chaque utilisateur règle son espace. L'isolation des données est **prouvée** par des tests sur toutes les ressources. Les usages sont mesurés et limités par compte. Le produit est prêt pour plusieurs utilisateurs simultanés.

**État initial** : les comptes existent depuis P0 et l'isolation est testée ressource par ressource dans chaque phase. Il manque l'audit d'ensemble, les rôles, les quotas, l'export et la suppression du compte, et les préférences complètes.

### L6.1 — Audit d'isolation complet

| Modifications | Revue de **chaque** route : session exigée, filtre `userId` sur chaque requête Prisma. Mise en place d'une protection par défaut (extension Prisma ou couche d'accès qui impose `userId`), pour qu'un oubli ne fuie pas. |
|---|---|
| Critères d'acceptation | `TS-ISOLATION` couvre 100 % des routes, avec une liste générée automatiquement et comparée aux tests. |
| Tests | TS : accès croisés, énumération d'identifiants, paramètres forgés, téléchargement de fichiers d'autrui. |

### L6.2 — Préférences et espace personnel

| Modifications | Page Paramètres étendue : identité affichée, langue de l'interface (`D-09`), marché, préférences de recherche (métiers, lieux, télétravail), réglages de génération (L4.2), notifications. |
|---|---|
| À préserver | Les réglages actuels (ton par défaut, webhook scraper facultatif). |
| Tests | TI (enregistrement et relecture) ; TNR (Paramètres actuels). |

### L6.3 — Rôles et administration

| Modifications | Rôles `utilisateur` et `admin` (puis `conseiller` pour l'offre B2B, plus tard). Écran d'administration minimal : comptes, usage IA, suspension. Journal d'audit des actions d'administration. |
|---|---|
| Tests | TS : un utilisateur n'atteint aucune route admin (403) ; chaque action admin est journalisée. |

### L6.4 — Export et suppression du compte

| Modifications | Export complet des données de l'utilisateur (JSON + fichiers, archive). Suppression définitive du compte et de ses fichiers après confirmation et délai. |
|---|---|
| Critères d'acceptation | Après suppression, aucune ligne et aucun fichier liés au compte ne restent (vérification par requête). |
| Tests | TI (export complet comparé au contenu en base) ; TS (suppression complète, y compris les fichiers). |

### L6.5 — Quotas et coûts par utilisateur

| Modifications | Quotas par fonctionnalité, à partir de `UsageIA`. Message clair quand un quota est atteint. Tableau de coût réel par utilisateur et par fonctionnalité pour l'administrateur. Limite d'appels partagée entre instances (PostgreSQL ou Redis). |
|---|---|
| Critères d'acceptation | Un quota atteint bloque la génération côté serveur. Le coût affiché correspond aux jetons enregistrés. |
| Tests | TU (calcul des quotas, remise à zéro périodique) ; TI (dépassement → 429 avec message) ; TS (impossible de consommer le quota d'un autre). |

### L6.6 — Montée en charge

| Modifications | Tests de charge (k6 ou Artillery) sur les routes principales, avec plusieurs utilisateurs simultanés. Index en base vérifiés. Générations longues (CV, lettres) mises en file d'attente si les mesures le justifient. |
|---|---|
| Critères d'acceptation | Seuils de latence à fixer **après** une première mesure, puis tenus. |
| Livrables | Scénarios de charge, résultats mesurés dans `docs/performance.md`. |

**Campagne de fin de Phase 6** : audit d'isolation complet, tests de charge, `TNR-GLOBAL`, recette `docs/recette/phase-6.md`.

---

## Phase 7 — Assistant IA (plus tard)

**Cette phase est séparée des priorités de livraison.** Elle ne démarre qu'avec des données réelles de P2, P3 et P5, et après la mesure des coûts de P6.

### Cas d'usage

| Cas | Entrées | Sortie |
|---|---|---|
| Évaluer une offre | offre, profil pro, préférences | score d'adéquation **expliqué** : exigences couvertes, partielles, manquantes |
| Prioriser | offres enregistrées, candidatures en cours | ordre suggéré, avec sa raison |
| Prochaine action | historique des candidatures, échéances | relance, préparation d'entretien, mise à jour du CV |
| Préparer un entretien | offre, CV envoyé | questions probables, points du profil à mettre en avant |

### Données et intégrations

Uniquement les données de l'utilisateur déjà en base. Pas de nouvelle collecte externe. L'assistant **propose** ; il n'agit jamais seul (aucun envoi de candidature ou de message sans validation, voir l'enseignement de Simplify en 5.3).

### Garde-fous

- Chaque recommandation cite les données utilisées.
- Contrôle « zéro invention » (L3.2) appliqué.
- Pas de décision automatique ayant un effet juridique ou financier.
- Désactivable par l'utilisateur.

### Coûts

Coût par conversation estimé à partir de `UsageIA` (jetons réels des phases précédentes). Plafonds par formule. **Aucune estimation chiffrée n'est donnée ici sans mesure.**

### Évaluation

- Jeu de cas annotés à la main (offre + profil → adéquation attendue).
- Mesure de l'accord entre le score et le jugement humain.
- Taux de recommandations jugées utiles.
- Seuil de mise en production fixé avant le développement.

### Lots indicatifs

- `L7.1` jeu d'évaluation ;
- `L7.2` score d'adéquation expliqué ;
- `L7.3` prochaines actions ;
- `L7.4` interface conversationnelle.

Chaque lot suit le même gabarit et les mêmes types de tests que les phases précédentes.

---

## Phase 8 — Préparation à la commercialisation

**Objectif** : un service fiable, sécurisé, supervisé, sauvegardé et juridiquement prêt, validé par une recette complète avant toute ouverture payante.

### L8.1 — Audit de sécurité

Audit complet avec la Skill `security-auditor` :

- secrets, y compris l'historique git et la clé Google ancienne ;
- authentification, sessions, contrôle d'accès ;
- uploads ;
- injection ;
- en-têtes (CSP, HSTS) ;
- dépendances (`npm audit`, Dependabot).

Chaque constat critique ou élevé est corrigé et retesté.

### L8.2 — Déploiement de production

Étude avec la Skill `deployment-devops-advisor` (`D-04`) :

- environnements séparés (développement, préproduction, production) ;
- HTTPS ;
- migrations automatiques et réversibles ;
- variables d'environnement documentées ;
- service CV et n8n sur réseau privé ;
- retour arrière documenté et testé.

### L8.3 — Supervision et journaux

- Journaux structurés.
- Suivi des erreurs (outil open source auto-hébergeable, par exemple GlitchTip ou Sentry auto-hébergé).
- Disponibilité (par exemple Uptime Kuma).
- Alertes sur les erreurs, les quotas IA et le coût journalier.

### L8.4 — Sauvegardes et restauration

- Sauvegarde quotidienne de PostgreSQL et des fichiers, chiffrée et hors du serveur.
- **Test de restauration réel**, avec la durée mesurée et notée.

### L8.5 — Juridique et données personnelles

- CGU et politique de confidentialité.
- Registre des traitements, durées de conservation (`D-11`), sous-traitants (OpenRouter et fournisseur du modèle, hébergeur).
- Conformité au RGPD pour les utilisateurs de l'UE, et à la loi 09-08 et la CNDP pour le Maroc.
- **Avis d'un juriste avant l'ouverture**, en particulier sur les profils de tiers.

### L8.6 — Offre commerciale et paiement

- Formules construites sur les coûts réels mesurés (L6.5) et l'étude concurrentielle (5.5).
- Choix du prestataire de paiement (`D-10`).
- Facturation, essai, résiliation simple : les plaintes de facturation chez Jobscan, Careerflow et Jobright montrent que c'est un point de confiance.
- Aucun tarif publié sans validation.

### L8.7 — Recette générale

- Rejouer toutes les suites : `TNR-GLOBAL`, `TS-ISOLATION`, charge, restauration.
- Parcours complets sur desktop et mobile.
- Bêta fermée avec de vrais utilisateurs, retours notés.
- Critères de sortie écrits à l'avance.
- Rapport `docs/recette/phase-8.md`.

**Condition de mise en production commerciale** : L8.1 à L8.7 validés, avec zéro constat de sécurité critique ou élevé ouvert.

---

## 18. Registre des risques

| ID | Risque | Probabilité | Impact | Réponse |
|---|---|---|---|---|
| R-01 | Arrêt de Google Custom Search au 01/01/2027 | **Certaine** (annoncée) | Le scraper actuel s'arrête | `D-01`, `L1.4` avant la date |
| R-02 | Action de LinkedIn contre l'extraction de profils | Moyenne | Juridique, réputation | Sources apportées par l'utilisateur ; aucun contournement ; `D-11` |
| R-03 | Publication involontaire du code propriétaire de la Skill CV | Moyenne si on la copie dans ce dépôt | Licence | Service dans un dépôt privé (`D-05`) |
| R-04 | Rendu du CV sous Linux différent de macOS | Moyenne | Qualité du CV | Comparaison des 6 profils (`L3.1`) |
| R-05 | Contenu inventé par l'IA (CV, lettre) | Moyenne | Confiance, réputation | Contrôle des faits bloquant (`L3.2`, `L3.4`, `L4.4`) |
| R-06 | Fuite de données entre utilisateurs | Faible si testée | Critique | `TS-ISOLATION` à chaque lot, `L6.1` |
| R-07 | Coût IA non maîtrisé | Moyenne | Financier | `UsageIA` (`L0.6`), quotas (`L6.5`), plafond de dépense de la clé |
| R-08 | Ancienne clé Google dans l'historique public | Avérée | Abus de quota | La restreindre ou la remplacer (déjà recommandé) |
| R-09 | Refonte de la persistance sans filet | Élevée sans P0 | Régressions | `L0.1`, `L0.2` d'abord |
| R-10 | Conditions des sources d'offres mal respectées | Moyenne | Coupure d'accès | Relecture des conditions en `L2.3`, attribution affichée |

---

## 19. Sources

Consultées le 29/10/2026. Les tarifs proviennent de sources secondaires et doivent être revérifiés sur les sites officiels.

**Arrêt de Google Custom Search JSON API**

- [Brave — Alternatives to the Google Search API before the 2027 shutdown](https://brave.com/learn/google-api-shutdown/)
- [Firecrawl — Google Search JSON API alternative before January 1, 2027](https://www.firecrawl.dev/blog/google-search-json-api-alternative)
- [DEV Community — Google's Custom Search API dies in 2027](https://dev.to/markhuang-ai/googles-custom-search-api-dies-in-2027-a-drop-in-isnt-a-migration-9b7)

**LinkedIn et le scraping**

- [LinkedIn Newsroom — LinkedIn wins legal battle to protect member data (2025)](https://news.linkedin.com/2025/LinkedInWinsLegalBattleToProtectMemberData)
- [Bloomberg Law — LinkedIn battles online scrapers](https://news.bloomberglaw.com/ip-law/linkedin-battles-online-scrapers-in-perpetual-struggle-over-data)
- [Unipile — Proxycurl alternative: what happened](https://www.unipile.com/proxycurl-alternative/)

**Concurrents**

- [Teal — tarifs 2026 (FrontDesk Review)](https://frontdeskreview.com/software/resume-builders/teal.md) · [Toolradar](https://toolradar.com/tools/teal-hq/pricing)
- [Huntr — revue 2026 (Weekday, concurrent)](https://www.weekday.works/post/huntr-review)
- [Jobscan — revue 2026 (Weekday)](https://www.weekday.works/post/jobscan-review) · [Capterra](https://www.capterra.com/p/10016414/Jobscan/)
- [Simplify — revue 2026 (Weekday)](https://www.weekday.works/post/simplify-jobs-review) · [Jobright blog](https://jobright.ai/blog/simplify-copilot-review-2026-features-pricing-and-top-alternatives/)
- [Careerflow — revue 2026 (Weekday)](https://www.weekday.works/post/careerflow-ai-review) · [Capterra](https://www.capterra.com/p/10015230/Careerflow-ai/)
- [Jobright — revue 2026 (Weekday)](https://www.weekday.works/post/jobright-ai-review)
- [Comparatif générateurs de CV 2026 (Dupple)](https://dupple.com/learn/best-ai-resume-builders) · [VisualCV](https://www.visualcv.com/blog/best-ai-resume-builders/) · [Kickresume vs Enhancv](https://www.kickresume.com/en/help-center/alternative-to-enhancv/)
- [Reactive Resume — GitHub](https://github.com/AmruthPillai/Reactive-Resume) · [documentation](https://docs.rxresu.me/use-cases/open-source-resume-builder)
- [PhantomBuster — tarifs expliqués (éditeur)](https://phantombuster.com/blog/company/phantombuster-pricing-explained-LxxG0SZ1S76reER7aZAnq) · [Salesforge — Waalaxy vs PhantomBuster](https://www.salesforge.ai/blog/waalaxy-vs-phantombuster) · [La Growth Machine — tarifs Waalaxy](https://lagrowthmachine.com/waalaxy-pricing/)

**Sources d'offres**

- [data.gouv.fr — Offres d'emploi diffusées à France Travail](https://www.data.gouv.fr/datasets/offres-demploi-diffusees-a-france-travail) · [Jobspipe — API France Travail](https://jobspipe.dev/blog/france-travail-api)
- [adzuna-sdk — README (limites du niveau gratuit)](https://cdn.jsdelivr.net/npm/adzuna-sdk@0.1.2/README.md)
- [Remotive — remote-jobs-api (README officiel)](https://github.com/remotive-com/remote-jobs-api)

**Projet**

- Code de `main` au commit `fbeaf5c`, en particulier `frontend/src/store/useAppStore.js`, `frontend/src/pages/Scraper.jsx`, `n8n-workflows/linkedin-scraper-webhook.json`, `backend/prisma/schema.prisma`, `backend/src/routes/posts.js`.
- Skill `cv-ats` : [StackLLM/skill-cv-ats](https://github.com/StackLLM/skill-cv-ats) (privé), `SKILL.md`, `references/schema.md`, `scripts/cv.py`, `LICENSE`, `CHANGELOG.md`.
