# UML — Triage corps / annexe / abandon (source : Claude, verbatim, À TRANCHER)

> Découpage de `figures_uml_claude.md` (l.253-276). Décision de Claude
> conservée à titre d’avis, **triage définitif après vérification contre le
> code** (voir `verification.md`). Retirées : la question sur les annexes
> et la limite de pages (l.274) et l’offre de placement (l.276).

Oui, tu peux en abandonner plusieurs, et tu devrais le faire. Un mémoire est jugé sur la qualité de l'analyse, pas sur le nombre de figures. Chaque figure dans le corps doit être commentée par au moins un paragraphe, donc 20 figures sans commentaire alourdissent le mémoire sans le renforcer.

| Figure | Décision (avis Claude) | Pourquoi |
|---|---|---|
| **MCD global** (vue d'ensemble) | Corps | Figure centrale de ta démarche Merise. |
| **MCD détaillés par sous-domaine** | 2 ou 3 dans le corps, le reste en annexe | Choisis les plus riches, par exemple le quiz et les entretiens et évaluation. |
| **MLD** | Corps en notation textuelle, courte | Les règles de passage MCD → MLD suffisent à montrer ta maîtrise. |
| **MPD** | Annexe (script SQL) et 1 ou 2 exemples dans le corps | Le script existe déjà. |
| **MCT** | 1 ou 2 dans le corps (le processus de recrutement), le reste en annexe | Un exemple bien commenté vaut mieux que tous les processus. |
| **Cas d'utilisation global** | Corps | C'est l'entrée de toute la partie UML. |
| **Cas d'utilisation du candidat** | Corps | Il montre le mieux les relations `include` et `extend`. |
| **Cas d'utilisation : recruteur (configuration), recruteur (suivi), entretiens et évaluation, administrateur** | Annexe, ou abandon | Ils se ressemblent beaucoup, avec surtout des « Gérer X ». |
| **Séquence « Passer le quiz »** | Corps | Elle montre le cœur technique de ton application. |
| **États-transitions de l'étape de pipeline** | Corps | Elle apporte une information que le MCD ne contient pas. |
| **Composants** | Corps | Presque attendu dans un master de génie logiciel. |
| **Déploiement** | Corps si ton chapitre d'architecture n'a pas déjà un schéma équivalent, sinon abandon | Il est court, mais il fait doublon avec les composants si l'architecture est déjà décrite. |
| **Diagramme de classes** | Abandon | Il recoupe le MCD et tu n'as pas à le faire. |
| **États de l'évaluation et du quiz** | Abandon, ou une phrase dans le texte | Ils sont linéaires et n'apprennent rien de plus que celui de l'étape. |

Dans le corps, tu peux viser environ 10 à 12 figures pour toute la modélisation : 3 ou 4 pour Merise et 6 à 8 pour UML. Les autres vont en annexe, ce qui montre que ton travail est complet sans alourdir la lecture.

Vérifie avec ton école si les annexes comptent dans la limite de pages. Si elles ne comptent pas, déplacer les figures secondaires en annexe est la solution la plus simple. Si elles comptent, abandonne plutôt les diagrammes de cas d'utilisation répétitifs et le déploiement.
