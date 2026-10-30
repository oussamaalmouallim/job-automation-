# Sources de profils — comparatif des fournisseurs de recherche

Préparé le **30/10/2026** pour la décision `D-01-bis` (lot `L1.4` de [PLAN.md](../PLAN.md)).

## Le besoin

- Une requête du type `ingénieur cloud maroc site:linkedin.com/in`.
- Pour chaque résultat : titre, lien, extrait. C'est ce que lit aujourd'hui la normalisation (`backend/src/profils/normaliser.js`).
- **Les profils sont gardés** : dans le navigateur aujourd'hui, en base à partir du lot `L1.1`. Les conditions du fournisseur doivent donc permettre de **stocker** les résultats.
- **Volume actuel** : au plus 100 pages par jour, la limite gratuite de Google. Soit environ 3 000 requêtes par mois au maximum, et beaucoup moins en usage réel.
- **Date butoir** : Google Custom Search s'arrête le 1er janvier 2027.

## Résultat en bref

| Fournisseur | Index | Prix (source) | Gratuit | Stocker les résultats | Risque juridique | Verdict |
|---|---|---|---|---|---|---|
| **Brave Search API** | indépendant (Brave) | 5 $ / 1 000 requêtes, offre « Search » (page officielle) | 5 $ de crédit par mois, soit environ 1 000 requêtes | **seulement avec une formule « avec droits de stockage »**, prix non publié (page officielle) | faible : index propre, conditions claires | **à retenir si** Brave confirme les droits de stockage à un prix acceptable, et si la couverture de LinkedIn est bonne |
| **Serper.dev** | résultats Google | environ 1 $ / 1 000 (pack de 50 000 à 50 $), source secondaire | 2 500 requêtes offertes, sans carte (source secondaire) | non précisé dans les conditions consultées | **moyen** : collecte les résultats de Google, ce que Google conteste en justice contre un concurrent (SerpApi) | **à retenir** pour la qualité (mêmes résultats qu'aujourd'hui) et le prix, en acceptant le risque |
| Mojeek | indépendant (Mojeek) | sur devis, en livres sterling | essai limité | non vérifié | faible | écarté : prix inconnu, couverture de LinkedIn probablement faible (hypothèse) |
| SerpApi | résultats Google | plus cher que Serper (source secondaire) | — | — | **élevé** : poursuivi par Google depuis décembre 2025 | écarté |
| Bing Search API | — | — | — | — | — | écarté : **fermée le 11 août 2025** (Microsoft) |
| Google Vertex AI / Agent Search | — | — | — | — | — | écarté : ne cherche pas dans le web public |

**Coût estimé au volume actuel** (3 000 requêtes par mois au maximum) :

- Brave, formule « Search » : environ 15 $, moins 5 $ de crédit, soit **environ 10 $ par mois**. La formule avec droits de stockage, nécessaire pour garder les profils, est sans prix publié.
- Serper : **environ 3 $ par mois**. Les 2 500 requêtes offertes couvrent probablement le premier mois.

## Détail par fournisseur

### Brave Search API — [brave.com/search/api](https://brave.com/search/api/)

**Vérifié sur la page officielle le 30/10/2026** :

- offre « Search » à 5 $ pour 1 000 requêtes ;
- 50 requêtes par seconde ;
- 5 $ de crédit offert chaque mois ;
- crédits prépayés, sans abonnement.

**Stockage** : la FAQ répond à « Puis-je stocker les résultats ? » par « Oui, avec une formule qui inclut des droits de stockage ». La page ne dit pas quelle formule les inclut. D'après des sources secondaires, il s'agit d'une formule « Data with Storage Rights », dont le prix n'est pas publié.

**Recherche** : l'opérateur `site:` est documenté par Brave et couvre les sous-domaines.

**Inconnues** :
- la part de profils LinkedIn présente dans l'index de Brave ;
- le prix des droits de stockage.

### Serper.dev — [serper.dev](https://serper.dev)

**Sources secondaires** (la page de prix officielle n'a pas pu être lue) :
- environ 1 $ pour 1 000 requêtes au premier pack, moins cher au-delà ;
- 2 500 requêtes offertes ;
- crédits prépayés.

**Conditions** ([serper.dev/terms](https://serper.dev/terms), mises à jour le 29/05/2024) : service réservé aux entreprises. Les extraits consultés ne disent rien sur le stockage des résultats.

**Risque** : Serper renvoie les résultats de Google, comme SerpApi. Google a poursuivi SerpApi en décembre 2025. Une partie de la plainte a été rejetée en juillet 2026, puis Google l'a modifiée, et l'affaire est en cours. Serper n'est pas visé à notre connaissance, mais un jugement contre SerpApi pourrait toucher tout ce type de service.

**Qualité attendue** : identique à aujourd'hui, puisque ce sont les résultats de Google. La normalisation actuelle s'applique telle quelle.

## Ce qu'il reste à mesurer avant de coder

Tester la qualité de chaque fournisseur retenu sur **5 requêtes réelles**, notées dans le tableau ci-dessous :

1. `ingenieur cloud maroc`
2. `devops casablanca`
3. `data scientist rabat`
4. `développeur react france`
5. `cybersécurité tanger`

| Requête | Google (n8n, aujourd'hui) | Brave | Serper |
|---|---|---|---|
| Profils valides sur 10 | à mesurer | à mesurer | à mesurer |
| Entreprise trouvée | à mesurer | à mesurer | à mesurer |

Il faut une clé d'essai pour chaque fournisseur à tester. Ces clés se créent sur le site de chaque fournisseur, avec ton compte.

## Sources

- [Brave Search API — page officielle (prix, FAQ sur le stockage)](https://brave.com/search/api/)
- [Brave — opérateurs de recherche](https://api-dashboard.search.brave.com/documentation/resources/search-operators)
- [Implicator — Brave supprime son offre gratuite (2026)](https://www.implicator.ai/brave-drops-free-search-api-tier-puts-all-developers-on-metered-billing.md)
- [Costbench — baisse de prix Brave, mai 2026](https://costbench.com/changelog/brave-search-api-price-decrease-2026-05/)
- [Serper — conditions d'utilisation](https://serper.dev/terms)
- [AI Tools Atlas — prix de Serper](https://aitoolsatlas.ai/tools/serper-dev/pricing)
- [Search Engine Land — Google poursuit SerpApi](https://searchengineland.com/google-sues-serpapi-466541)
- [Search Engine Land — Google perd une partie de ses demandes contre SerpApi](https://searchengineland.com/google-loses-key-dmca-claims-against-serpapi-in-scraping-lawsuit-483185)
- [MediaPost — Google relance l'affaire contre SerpApi](https://www.mediapost.com/publications/article/417185/google-renews-battle-with-serpapi-over-scraping.html)
- [Microsoft — fin des Bing Search APIs](https://learn.microsoft.com/en-us/lifecycle/announcements/bing-search-api-retirement)
- [Mojeek — Search API](https://www.mojeek.com/services/search/web-search-api/)
