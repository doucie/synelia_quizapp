IDEES DE FIGURES POTENTIELLES

# 1.3.2 Acteurs du système
les acteurs et leurs fonctions (résumé)

# 1.3.3 Frontières du projet
dans le périmètre vs hors scope

# 2.4.2 Choix du framework backend
remplacer le tableau

# 2.4.3 Choix du framework frontend
remplacer le tableau

# 2.4.4 Choix du système de gestion de base de données
remplacer le tableau

# 2.4.5 Synthèse comparative
remplacer le tableau

# 3.1.1 Parties prenantes et périmètre étudié
acteurs, attentes principales, risques métier à maîtriser, conséquence directe sur la conception

# 3.2.1 Authentification et gestion des utilisateurs
schéma sur le processus d'authentification ?

# 3.2.7 Notifications et dashboard
le système de notification

# 3.2.8 Matrice synthétique des besoins fonctionnels
remplacer le tableau

# 3.2.9 Matrice acteurs et responsabilités
remplacer le tableau

# 3.3 Besoins non fonctionnels
remplacer le tableau

# 3.4.2 Description textuelle des cas d’utilisation principaux
supprimer ou remplacer le tableau

# 3.6 Règles de gestion
remplacer le tableau

# 4.2.1 Démarche Merise retenue
remplacer le tableau

# 4.5 Conception de l’API REST
remplacer le tableau

# 6.3 Implémentation du frontend
remplacer le tableau

# 6.4.7 Notifications, permissions et pilotage
architecture de notification

# 6.6 Exécution locale et chaîne DevOps
remplacer le tableau

# 7.1 Stratégie de tests
remplacer la figure

# 8.2 Fonctionnalités implémentées
remplacer la figure


Bonne nouvelle, ton PDF est toujours là — je vais relire les sections précises que tu mentionnes pour te proposer des figures vraiment adaptées à leur contenu réel, pas des suggestions génériques.Je vais lire chacune de ces sections pour cerner leur contenu exact.Vu le volume, je l'ai organisé en tableau par chapitre — type de figure + pourquoi ce type précisément colle au contenu (j'ai relu chaque section dans ton PDF, ce ne sont pas des suggestions génériques).

## Chapitre 1 — Présentation

| Section | Figure proposée | Pourquoi |
|---|---|---|
| 1.3.2 Acteurs | **Bandeau d'icônes** — 4 silhouettes/pictos, une ligne de fonction chacune | Reste volontairement léger ici : c'est la première mention des acteurs, pas encore l'analyse. |
| 1.3.3 Frontières | **Diagramme de périmètre** — un cadre "Inclus" avec coches, des éléments "Exclu" à l'extérieur avec icône barrée (job boards, visio, paie, mobile natif, IA matching) | Montre visuellement une frontière plutôt que de décrire en prose ce qui est dedans/dehors. |

## Chapitre 2 — Choix technologiques

| Section | Figure proposée | Pourquoi |
|---|---|---|
| 2.4.2 Backend | **Reste en tableau** | Le texte par cellule est nuancé ("verbosité mais typage strict") — compresser en pictos ferait perdre le sens. |
| 2.4.3 Frontend | **Quadrant 2 axes** (ex. flexibilité ↔ structure imposée / légèreté ↔ robustesse) | 3 options seulement → un quadrant est plus parlant qu'un radar à 3 séries. |
| 2.4.4 BDD | **Arbre de décision** ("Domaine fortement relationnel ?" → élimine MongoDB → etc.) | Montre ta logique d'élimination, pas juste un comparatif côte à côte. |
| 2.4.5 Synthèse | **Tour technique (stack tower)** — blocs empilés Architecture/Backend/Frontend/BDD/Migrations, choix retenu en couleur pleine, alternatives écartées en ghost à côté | C'est la synthèse après coup : visuellement, "on assemble la tour" après avoir justifié chaque brique séparément. Belle progression narrative avec 2.4.2-2.4.4. |

## Chapitre 3 — Analyse des besoins

| Section | Figure proposée | Pourquoi |
|---|---|---|
| 3.1.1 Parties prenantes | **Fiches persona** — 4 cartes (Attentes / Risque métier / Conséquence conception) | Reprend les 4 acteurs du bandeau d'icônes (1.3.2) mais enrichis — progression légitime, pas une redite. |
| 3.2.1 Authentification | **Flux à deux voies** — "Auth interne" (rôle + droits contextualisés) vs "Accès public candidat" (token + vérif email), convergent vers "accès contrôlé" | ⚠️ Visuellement proche du comparateur de pipeline qu'on vient de faire. Soit tu assumes ce langage visuel "deux voies" comme une signature récurrente du mémoire (légitime si utilisé 2-3 fois max), soit je te propose autre chose — dis-moi. |
| 3.2.7 Notifications/dashboard | **Diagramme de correspondance (bipartite)** — colonne gauche "événements déclencheurs", colonne droite "canaux" (email, in-app), traits reliant qui déclenche quoi | Le contenu réel est une relation plusieurs-à-plusieurs événement→canal, c'est exactement la structure d'une carte de correspondance. |
| 3.2.8 Besoins fonctionnels | **Grille de cartes à pictogrammes**, groupées par module | Déjà évoqué la dernière fois — confirmé après relecture. |
| 3.2.9 Acteurs et responsabilités | **Cercles concentriques** (Candidat au centre → Super admin en périphérie) | Déjà évoqué — confirmé. |
| 3.3 Besoins non fonctionnels | **Médaillons en étoile (hub-and-spoke)** — 7 pastilles rondes (Performance, Sécurité, Fiabilité...) disposées en arc autour d'un hub central "Qualité du système" | Différent des cartes rectangulaires déjà utilisées ailleurs ; le hub central évoque bien "7 piliers qui soutiennent une seule exigence globale". |
| 3.4.2 Description UC | **Aucune figure — supprime, comme tu le suggérais déjà** | Ton instinct est bon : ce tableau redit en détail ce que Fig. 9-11 montrent déjà en UML. Si tu veux garder une trace visuelle, 2-3 mini-storyboards (Déclencheur→Système→Résultat, 3 icônes) pour les scénarios les plus importants suffiraient, pas les 7. |
| 3.6 Règles de gestion | **Tableau de cartes façon kanban**, groupées par domaine (Campagnes / Accès public / Permissions / Audit...) | 9 règles avec un "effet système" chacune ; regrouper par domaine en colonnes type kanban aère largement par rapport au tableau à 9 lignes. |

## Chapitre 4 — Conception

| Section | Figure proposée | Pourquoi |
|---|---|---|
| 4.2.1 Merise vs UML | **Face-à-face "VS"** — deux colonnes, 5 critères en lignes, mise en évidence du point fort de chaque côté | Seulement 2 options → un affrontement direct est plus lisible qu'un radar à 2 séries. |
| 4.5 API REST | **Pas de nouvelle figure** — fusionne dans Fig. 44 (carte des endpoints) comme on en avait parlé | Le tableau fait doublon avec une figure qui existe déjà juste à côté. |

## Chapitre 6 — Implémentation

| Section | Figure proposée | Pourquoi |
|---|---|---|
| 6.3 Frontend | **Arborescence de dépôt** — 3 branches (quizapp/, quizapp_front/, docker-compose.yml) | Le contenu est littéralement une structure de dossiers — un tree diagram est le format natif pour ça. |
| 6.4.7 Notifications/permissions | **Fig. 46 existe déjà** (pub/sub) et couvre bien la partie notifications | Si tu veux illustrer aussi la logique ABAC (rôle + droit contextualisé), un petit flowchart à 2-3 boîtes suffirait en complément — optionnel, pas obligatoire. |
| 6.6 DevOps | **Diagramme de déploiement** — topologie locale avec les ports annotés (Angular:4200 → proxy → Spring:8080 → MySQL:3306/Redis:6379/MinIO:9000) | C'est littéralement le "diagramme de déploiement" de ta liste d'idées initiale — jamais utilisé ailleurs dans le mémoire, et le tableau actuel est fait pour ça (ports + rôles). |

## Chapitre 7-8 — Tests et résultats

| Section | Figure proposée | Pourquoi |
|---|---|---|
| 7.1 Stratégie de tests | **Cible de risque (bullseye)** — anneaux concentriques par niveau de risque métier, avec les types de tests positionnés à l'anneau qu'ils couvrent réellement | Remplace la pyramide des tests (Fig. 47), qui est un cliché visuel ET légèrement trompeur ici : ta stratégie n'est pas "plus de volume en bas", elle est "on cible les zones à risque" — la cible dit littéralement ça. |
| 8.2 Fonctionnalités implémentées | **Dashboard de jauges** — une jauge/barre de progression par module, remplie selon "Élevé"/"Moyen à élevé" | Le "Niveau de couverture" est déjà une donnée de type jauge dans ton tableau ; autant la montrer comme telle. |

---

Deux points avant que tu te lances : le repère ⚠️ sur 3.2.1 (auth) mérite ta décision — et je te conseille de ne pas faire les 21 d'un coup, plutôt 3-4 par session pour garder un œil critique sur chacune plutôt que de les enchaîner en pilote automatique. Tu veux commencer par laquelle ?

Bonne idée de passer par moi — une IA codante va te produire un SVG propre si tu lui donnes des positions et des règles précises, mais elle n'a aucune idée de *pourquoi* telle donnée doit être mise en avant. Je vais te faire des fiches qu'tu peux copier-coller presque telles quelles.

Je commence par un **socle commun** (à donner une fois à l'IA, valable pour toutes les figures), puis les 3 premières figures en détail. On avancera 3 par 3 ensuite.

---

## Palette de référence (à donner une seule fois)

```
Fond : blanc (#FFFFFF)
Texte principal : #26303D
Texte secondaire/italique : #6B7280
Typo : serif académique (Palatino/Georgia/Times) pour cohérence avec le reste du mémoire

Couleurs par acteur (réutilisées dans toutes les figures impliquant les 4 rôles) :
- Super administrateur → navy #1A365D
- Administrateur       → bleu  #2B6CB0
- Recruteur            → violet #6B46C1
- Candidat             → orange #C05621

Couleurs sémantiques (réutilisées pour "inclus/exclu", "oui/non", "présent/absent") :
- Positif/inclus/réussi → vert  texte #2F7D5C, fond #E7F3EE, bordure #2F7D5C
- Neutre/partiel        → ambre texte #B7791F, fond #FBF1DE, bordure #B7791F
- Négatif/exclu/absent  → gris  texte #A0A8B4, fond #F2F3F5, bordure pointillée

Style de carte générique : coins arrondis 8px, bordure 1.5px, padding ~12px
```

Dis à l'IA : *"Réutilise exactement ces couleurs à chaque figure, ne les réinvente pas d'un fichier à l'autre."* C'est ce qui évite l'effet "patchwork" quand plusieurs figures sont générées séparément.

---

## Figure 1 — 1.3.2 Acteurs du système (bandeau d'icônes)

**Objectif à donner à l'IA :** *"Présenter les 4 acteurs du système de façon neutre et plate — aucun acteur ne doit paraître plus important qu'un autre. Pas de hiérarchie, pas de taille différente. C'est une simple présentation, pas une analyse."*

**Contenu exact (4 blocs, dans cet ordre) :**
1. Super administrateur — *"Pilotage global et paramètres sensibles"*
2. Administrateur — *"Référentiels et configuration technique"*
3. Recruteur — *"Pilotage opérationnel du recrutement"*
4. Candidat — *"Parcours public sécurisé"*

**Structure :**
- 4 colonnes de largeur **strictement identique**, alignées horizontalement, espacement égal.
- Dans chaque colonne, du haut vers le bas : un cercle de la couleur de l'acteur avec son initiale en blanc → le nom du rôle en gras en dessous → la phrase-fonction en italique gris, plus petite.
- Pas de flèches, pas de lignes de connexion entre les colonnes.
- Une fine ligne horizontale commune sous les 4 colonnes (optionnelle, juste pour les aligner visuellement).

**Note pour l'IA :** *"N'ajoute aucun élément suggérant qu'un acteur a plus de pouvoir ou de portée qu'un autre — pas de taille de cercle différente, pas d'ordre vertical. Les 4 colonnes doivent être interchangeables visuellement."* (Cette contrainte est volontaire : la hiérarchie réelle entre acteurs sera montrée plus tard, dans une autre figure — ici on introduit juste qui ils sont.)

---

## Figure 2 — 1.3.3 Frontières du projet (diagramme de périmètre)

**Objectif à donner à l'IA :** *"Montrer une frontière claire entre ce que le projet couvre et ce qu'il exclut délibérément. La frontière elle-même doit être visuellement évidente — un cadre, pas juste une liste."*

**Contenu exact :**

Inclus (à l'intérieur du cadre, avec icône ✓ verte) :
- Gestion des utilisateurs et référentiels
- Campagnes de recrutement
- Candidatures et suivi candidat
- Quiz technique et correction
- Entretiens, évaluations, décisions
- Notifications et dashboard

Exclu (à l'extérieur du cadre, avec icône ⊘ grise) :
- Intégration directe avec les job boards
- Visioconférence intégrée
- Gestion de la paie / des contrats
- Application mobile native
- Multilingue
- Matching automatique par IA

**Structure :**
- Un grand rectangle à coins arrondis, bordure épaisse navy, occupant environ 55% de la largeur à gauche, titré en haut "Périmètre couvert — SyneliaQuizApp v1".
- À l'intérieur : les 6 items "Inclus" en liste verticale, fond vert pâle, icône ✓ à gauche de chaque ligne.
- À droite du cadre, à l'extérieur : les 6 items "Exclu" en liste verticale, fond gris pâle, icône ⊘, reliés au cadre par une fine ligne pointillée grise partant du bord du cadre vers chaque item (optionnel, à activer seulement si ça reste lisible).
- Sous le cadre : légende en italique "Version 1 — cœur du processus de recrutement".

**Note pour l'IA :** *"Le cadre doit dominer visuellement la composition — c'est lui qui porte le message, pas la liste des exclusions. Les items exclus doivent paraître clairement secondaires (couleur plus terne, police plus petite)."*
⚠️ Pour toi : la liste "Inclus" que je te donne est reconstruite à partir du reste de ton chapitre 3 (3.2.1 à 3.2.7), pas d'une liste explicite dans le texte — vérifie qu'elle correspond bien à ce que tu considères comme le cœur fonctionnel avant de la transmettre.

---

## Figure 3 — 2.4.3 Choix du framework frontend (quadrant de positionnement)

**Objectif à donner à l'IA :** *"Positionner 3 frameworks sur 2 axes de compromis, pour montrer pourquoi Angular correspond mieux au projet que React ou Vue — pas juste 'Angular gagne', mais 'Angular est le mieux placé sur CES critères précis'."*

**Contenu exact :**
- Axe horizontal : gauche = "Flexible, non opinionné" / droite = "Structure imposée, opinionné"
- Axe vertical : bas = "Léger, écosystème généraliste" / haut = "Robuste entreprise, modules intégrés"

Positions (approximatives, à ajuster visuellement mais garder l'ordre relatif) :
- **Angular** → en haut à droite (le plus structuré ET le plus "entreprise") — légende : "TypeScript par défaut, DI native, routage/formulaires intégrés, CLI complet"
- **React** → au centre-gauche, hauteur moyenne — légende : "Souplesse, large écosystème, mais nécessite des choix complémentaires (routage, état global)"
- **Vue.js** → en bas, légèrement à gauche du centre — légende : "Courbe douce, bonne documentation, mais écosystème entreprise plus restreint"

**Structure :**
- Un carré divisé en 4 quadrants par 2 lignes fines grises (une horizontale, une verticale au milieu).
- Chaque framework = un point coloré (utilise une couleur par framework, libre, différente des couleurs acteurs) avec son nom à côté, et sa légende courte en dessous en petit texte gris.
- Les libellés des axes sont écrits aux extrémités, pas au centre.
- Pas de quadrant "gagnant" surligné — c'est la position d'Angular qui doit parler d'elle-même.

**Note pour l'IA :** *"Angular doit être nettement dans le coin supérieur droit, les deux autres clairement plus proches du centre ou de la gauche — l'écart de position encode l'écart d'argumentation du texte, ce n'est pas arbitraire."*

---

Dis-moi quand tu veux la suite (2.4.4 arbre de décision BDD, 2.4.5 tour technique, 3.1.1 fiches persona), ou si tu veux que j'ajuste le format de ces fiches avant de continuer.

On continue, et bonne idée sur les images — je vais te dire précisément où ça apporte vraiment quelque chose (reconnaissance immédiate, texture différente) plutôt que d'en mettre partout par principe.

---

## Figure 4 — 2.4.4 Choix du SGBD (arbre de décision, avec vrais logos)

**Objectif à donner à l'IA :** *"Montrer un raisonnement d'élimination en 3 étapes qui aboutit à MySQL 8 — chaque nœud doit poser une vraie question binaire, pas juste lister des options côte à côte."*

**Contenu exact (structure logique, sourcée du texte) :**

```
Q1 : "Domaine fortement relationnel avec contraintes d'intégrité fortes ?"
 ├─ NON → MongoDB [ÉCARTÉ] — "Schéma flexible, mais contraintes à
 │         réimplémenter applicativement : fragilité accrue."
 └─ OUI → continue vers Q2

Q2 : "Besoin de types avancés (JSONB, extensions) avec un bénéfice
      métier immédiat ?"
 ├─ OUI mais sans bénéfice avéré → PostgreSQL [ÉCARTÉ] — "Surdimensionné :
 │         complexité d'exploitation sans gain métier immédiat."
 └─ NON, socle relationnel classique suffit → continue vers Q3

Q3 : "MariaDB apporte-t-il un gain fonctionnel décisif vs MySQL 8 ?"
 ├─ NON → MariaDB [ÉCARTÉ] — "Compatible, mais aucun gain décisif."
 └─ → MySQL 8 [RETENU] — "Meilleur compromis : maturité, intégration
          JPA/Flyway, coût d'exploitation accessible."
```

**Structure :** arbre vertical, racine en haut, chaque question dans une bulle rectangulaire neutre (gris clair), les deux branches "Oui/Non" étiquetées sur les traits qui descendent. Les feuilles écartées s'arrêtent net sur le côté (gauche) à chaque niveau ; la branche "survivante" continue tout droit au centre jusqu'à MySQL 8 en bas.

**Images recommandées — oui, clairement ici :** utilise les **logos officiels** de MySQL (dauphin), PostgreSQL (éléphant), MongoDB (feuille) et MariaDB (sceau), en petit à côté du nom de chaque feuille. Tu les trouves en SVG libres de droit sur *devicon.dev* ou *simpleicons.org*. Ça change radicalement de texture par rapport au quadrant précédent (purement géométrique) et ça rend chaque option immédiatement identifiable sans lire le texte.

**Encodage :** feuille écartée = fond gris, logo désaturé/grisé, tag "ÉCARTÉ" discret. MySQL 8 = fond vert, logo en couleur normale, tag "RETENU ✓", carte légèrement plus grande que les autres pour marquer l'aboutissement.

**Note pour l'IA :** *"Le MySQL final ne doit pas juste être '1 option parmi 4 alignées' — visuellement, c'est la destination d'un chemin, les autres sont des sorties de route. Ne mets pas les 4 logos à plat au même niveau."*

---

## Figure 5 — 2.4.5 Synthèse comparative (tour technique, avec vrais logos)

**Objectif :** *"Montrer la stack assemblée comme un tout cohérent après les choix individuels — pas un nouveau comparatif, une synthèse visuelle."*

**Contenu exact (4 couches + 1 bandeau transversal) :**

| Couche | Retenu | Alternatives écartées (affichées en fantôme) |
|---|---|---|
| Frontend | Angular | React, Vue.js |
| Backend | Spring Boot | Node.js, Django, ASP.NET Core, Laravel |
| Migrations | Flyway | Liquibase, scripts manuels |
| Base de données | MySQL 8 | PostgreSQL, MongoDB, MariaDB |

Bandeau transversal (pas une couche, un style architectural qui traverse tout) : **"REST en couches"** (vs GraphQL, monolithe sans couches, microservices).

**Structure :** 4 blocs empilés verticalement dans l'ordre du tableau ci-dessus (Frontend en haut = ce que l'utilisateur voit, BDD en bas = fondation). Chaque bloc : logo officiel + nom en grand à gauche, et à droite, les alternatives écartées en petites puces grisées, barrées ou en opacité réduite — façon "options qu'on a envisagées et reposées sur l'étagère". Le bandeau "REST en couches" est une étiquette verticale fine sur le côté gauche de toute la tour (pas un bloc empilé, car ce n’est pas une techno mais un style), ou une légende sous la tour.

**Images recommandées :** logos officiels Angular (bouclier), Spring Boot (feuille/roue dentée), Flyway (icône officielle), MySQL (dauphin) — mêmes sources que la figure précédente. Garde la même taille de logo partout pour que la tour ait l'air d'un seul ensemble cohérent, pas de blocs assemblés au hasard.

**Note pour l'IA :** *"Les alternatives écartées doivent être nettement en retrait visuellement (gris, petit, pas de bordure) — elles ne sont pas des options concurrentes sur ce schéma, juste des traces du raisonnement déjà fait dans les figures précédentes."*

---

## Figure 6 — 3.1.1 Parties prenantes (fiches persona, avec avatars illustrés)

**Objectif :** *"Donner une épaisseur humaine aux 4 acteurs déjà présentés en 1.3.2 — ici on entre dans le détail de ce qu'ils attendent, risquent et imposent à la conception."*

**Contenu exact (grille 2×2, un acteur par carte) :**

**Candidat**
- Attentes : *"Postuler sans friction, comprendre les étapes, conserver un suivi autonome."*
- Risque métier : *"Abandon en cours de parcours, incompréhension des statuts, perte de confiance."*
- Conséquence conception : *"Surface publique simple, sécurisée, guidée, séparée des écrans internes."*

**Recruteur / évaluateur**
- Attentes : *"Piloter les campagnes, filtrer les dossiers, collaborer sur entretiens et évaluations."*
- Risque métier : *"Décisions hors contexte, dispersion de l'information, évaluation difficile à partager."*
- Conséquence conception : *"Vues consolidées par campagne, historique d'avancement, permissions contextualisées."*

**Administrateur**
- Attentes : *"Gérer les utilisateurs, les référentiels et le paramétrage d'exploitation."*
- Risque métier : *"Dérive des droits, données incohérentes, configuration fragile."*
- Conséquence conception : *"Référentiels administrables, contrôle d'accès fin, traçabilité des actions techniques."*

**Super administrateur**
- Attentes : *"Gouverner la plateforme, superviser la sécurité, maintenir la configuration globale."*
- Risque métier : *"Mauvaise gouvernance des rôles, défaut de supervision ou de paramétrage global."*
- Conséquence conception : *"Séparation nette entre administration métier et administration de plateforme."*

**Structure par carte :** avatar en haut (voir ci-dessous) → nom du rôle en gras → 3 blocs empilés, chacun avec une mini-barre colorée à gauche (réutilise le style "group-label" des figures précédentes : liseré de couleur + petit label en majuscules + texte) : "ATTENTES" (icône étoile/cible), "RISQUE MÉTIER" (icône triangle d'alerte), "CONSÉQUENCE SUR LA CONCEPTION" (icône plan/engrenage).

**Images recommandées — oui, fortement :** un **avatar illustré** par rôle plutôt qu'un simple cercle à initiale (volontairement différent de la Figure 1.3.2, plus sobre). Génère les 4 avatars avec la même IA et le **même style graphique** (ex. illustration plate, silhouette stylisée, pas de visage détaillé) pour qu'ils forment un ensemble cohérent — teinte chacun avec la couleur de son rôle. C'est l'endroit du mémoire où une vraie image humaine a du sens : on parle d'attentes et de vécu utilisateur, pas d'architecture.

**Note pour l'IA :** *"Les 4 cartes doivent avoir exactement la même structure et la même hauteur — seul le contenu change. N'improvise pas une mise en page différente pour un acteur en particulier."*

---

### Deux remarques en passant (tu m'as dit de ne pas me retenir)

1. **3.2.1 (authentification)** reste en suspens depuis la dernière fois — je te proposais un flux à deux voies, mais je notais qu'il ressemble au comparateur de pipeline déjà fait. Dis-moi si on le traite dans un prochain lot ou si tu préfères une autre idée pour cette section.
2. Il reste un chantier ouvert qu'on n'a jamais formalisé : la **machine à états simplifiée** (celle qui devait remplacer ta Fig. 8 actuelle, en complément du comparateur de pipelines déjà livré). Ce n'est pas dans ta liste des 21, mais c'est un fil qu'on a laissé en l'air — je peux te la détailler dans un prochain lot si tu veux la boucler.

On continue avec le prochain lot de 3 (3.2.1, 3.2.7, 3.2.8) ou tu préfères qu'on règle d'abord ces deux points ?

Allons-y — je fais la machine à états générique (le fil resté en suspens), puis 3.2.1 et 3.2.7 à la suite.

---

## Figure 7 — Machine à états générique du pipeline (remplace l'esprit de ta Fig. 8 actuelle)

**Objectif à donner à l'IA :** *"Montrer le cycle de vie générique d'UNE étape quelconque du pipeline, pas une séquence fixe d'étapes nommées. L'élément clé est une flèche qui boucle sur elle-même pour prouver que le nombre et l'ordre des étapes ne sont pas codés en dur."*

**Contenu exact :**

```
   ●  (départ)
   │
   ▼
┌─────────────┐
│ EN_ATTENTE  │  (l'étape est prête à démarrer)
└─────────────┘
   │ déclenchement
   ▼
┌─────────────┐
│  EN_COURS   │  (l'étape est active : quiz en passation,
└─────────────┘   entretien planifié, etc. selon le type réel)
   │
   ├── réussie ──────────────▶ ┌──────────────────────┐
   │   (boucle vers le haut)   │ étape suivante OU,    │
   │                           │ si dernière étape,    │
   │                           │ → DÉCIDÉ              │
   │                           └──────────────────────┘
   │
   ├── échouée ─────▶ [ REJETÉ ]        (terminal, rouge)
   ├── expirée  ─────▶ [ ABANDONNÉE ]   (terminal, gris)
   └── retirée  ─────▶ [ RETIRÉE ]      (terminal, gris)
```

**Structure :** colonne verticale centrale (EN_ATTENTE → EN_COURS), avec la flèche "réussie" qui **repart en courbe vers EN_ATTENTE** (pas vers un nouvel état nommé) — c'est cette boucle qui porte tout le message. Les 3 sorties d'échec partent sur la droite vers 3 boîtes terminales alignées verticalement, clairement séparées du flux principal.

**Images recommandées : non, reste en vectoriel pur.** C'est un diagramme d'état formel (convention UML/académique) — des logos ou illustrations casseraient sa crédibilité de schéma normatif. Garde la même rigueur graphique que tes autres diagrammes de séquence existants (Fig. 43).

**Note pour l'IA :** *"La flèche 'réussie' doit visuellement repartir vers le haut/vers l'état de départ, PAS continuer tout droit vers une nouvelle boîte. C'est cette boucle qui distingue ce schéma d'une simple liste d'étapes — c'est le point entier de la figure."*

**Légende à ajouter sous le schéma :** *"Ce cycle s'applique à chaque étape du pipeline, quel que soit son type (quiz, présélection, entretien, décision). Voir Fig. [comparateur de pipelines] pour deux enchaînements concrets construits à partir de ce même cycle."* — ça relie explicitement les deux figures sans te forcer à répéter l'info.

---

## Figure 8 — 3.2.1 Authentification (fourche puis convergence, pas deux voies parallèles)

Je change volontairement la géométrie par rapport au comparateur de pipelines pour éviter la ressemblance : ici c'est une **fourche qui se rejoint**, pas deux rails indépendants.

**Objectif à donner à l'IA :** *"Montrer que deux mécanismes d'authentification complètement différents aboutissent au même résultat : un accès contrôlé. Le point du schéma est la convergence finale, pas la comparaison des deux chemins."*

**Contenu exact :**

Point de départ unique (haut) : *"Un utilisateur arrive sur la plateforme"*

→ fourche en 2 branches :

**Branche gauche — Utilisateurs internes** (admin/recruteur)
1. 🔑 Connexion par identifiants
2. Vérification du rôle système (RBAC)
3. Vérification des droits contextualisés (campagne/entité)
4. → Accès à l'espace interne différencié

**Branche droite — Candidat (parcours public)**
1. 🎫 Lien/token contextualisé reçu
2. ✉️ Vérification de l'adresse email
3. Génération d'un code de suivi personnel
4. → Accès restreint à sa propre candidature

→ les deux branches **se rejoignent** en bas sur une boîte commune : *"Accès contrôlé, conforme aux droits réels de l'utilisateur"*

**Structure :** forme en Y (ou en entonnoir inversé) — un point en haut, deux colonnes qui divergent, une boîte large en bas où les deux traits convergent visuellement. Chaque étape dans chaque branche est une petite ligne avec une icône + texte, pas une grosse carte (pour rester léger, contrairement aux blocs du comparateur de pipelines).

**Images recommandées :** des **icônes vectorielles simples** (pas des logos, pas des photos) — cadenas pour la connexion, enveloppe pour l'email, ticket pour le token. Utilise un jeu d'icônes cohérent et libre (Heroicons ou Feather Icons, gratuits) plutôt que d'en générer avec une IA image — ce sont des symboles abstraits universels, une IA image aurait tendance à les rendre trop "illustratifs" et détonnerait avec le reste du mémoire.

**Note pour l'IA :** *"La convergence finale en bas doit être visuellement évidente — les deux traits doivent clairement se rejoindre en un seul point, pas juste s'arrêter côte à côte. C'est ça qui différencie ce schéma d'un simple comparatif de deux options parallèles."*

---

## Figure 9 — 3.2.7 Notifications (diagramme de correspondance événement → canal)

Petite précision avant : cette section couvre en réalité **deux sujets** (notifications ET dashboard). Le dashboard, tel que décrit dans ton texte, est une fonctionnalité de visibilité/filtrage, pas une relation de correspondance — ça ne se prête pas à une figure, une phrase suffit. Je ne fais la figure que pour la partie notifications, qui elle s'y prête vraiment bien.

**Objectif à donner à l'IA :** *"Montrer que plusieurs événements métier déclenchent un ou plusieurs canaux de notification — une relation plusieurs-à-plusieurs, avec une exception à marquer clairement."*

**Contenu exact :**

Colonne gauche (déclencheurs) :
1. Nouvelle candidature soumise
2. Vérification d'email requise
3. Convocation à un entretien
4. Réponse du candidat reçue
5. Décision rendue
6. Défaut de configuration critique

Colonne droite (canaux) :
- 🔔 Notification interne (in-app)
- ✉️ Email transactionnel

**Connexions :** les événements 1 à 5 relient vers **les deux canaux** (traits pleins). L'événement 6 ("défaut de configuration critique") relie **uniquement** vers "Notification interne" — en trait pointillé, avec une petite étiquette *"interne uniquement — alerte technique, pas destinée au candidat"*.

**Structure :** deux colonnes verticales de boîtes (gauche = 6 petites boîtes neutres grises, droite = 2 boîtes plus grandes, une par canal), reliées par des courbes de Bézier qui se croisent au milieu — c'est volontairement un peu "chargé" au centre, ça illustre bien l'idée de flux d'information multiple convergeant vers peu de canaux.

**Images recommandées :** icône cloche pour "notification interne", icône enveloppe pour "email" — même jeu d'icônes vectorielles que la figure précédente (cohérence).

**Note pour l'IA :** *"Ne traite pas les 6 connexions de façon identique — la 6ᵉ (config critique) doit clairement se distinguer visuellement (pointillé + étiquette), sinon le schéma perd l'information la plus intéressante qu'il peut montrer."*

---

Prochain lot : 3.2.8 (grille de cartes besoins fonctionnels), 3.2.9 (cercles concentriques), 3.3 (médaillons NFR) — je continue ?

Content avec la 7 — la boucle qui se referme sur elle-même est vraiment l'élément qui fait tout le travail. Trois figures appartenant toutes au chapitre 3, donc je précise bien ce qui les différencie entre elles.

---

## Figure 10 — 3.2.8 Besoins fonctionnels (grille de cartes à pictogrammes)

**Objectif à donner à l'IA :** *"8 blocs fonctionnels, groupés par nature plutôt qu'alignés à plat — montrer qu'il y a un socle, un parcours métier séquentiel, et une couche transversale, sans pour autant dessiner des bandeaux de groupe comme dans [la matrice de permissions déjà faite]."*

**Contenu exact (8 cartes, groupées en 3 familles) :**

*Socle (fond gris très pâle)*
- BF-01 Authentification et droits — *"Sécuriser les accès internes, différencier les responsabilités."*
- BF-02 Référentiels — *"Données métier stables, administrables, réutilisables."*

*Parcours métier séquentiel (fond bleu très pâle)*
- BF-03 Campagnes — *"Créer et piloter une campagne de bout en bout."*
- BF-04 Candidatures — *"Dossiers fiables, suivi autonome du candidat."*
- BF-05 Quiz — *"Objectiver l'évaluation initiale des candidats."*
- BF-06 Entretiens et décisions — *"Coordonner la suite du processus après le quiz."*

*Transversal (fond ambre très pâle)*
- BF-07 Notifications — *"Informer les acteurs au moment utile."*
- BF-08 Pilotage — *"Donner de la visibilité aux équipes RH."*

**Structure :** grille 4 colonnes × 2 lignes, taille de carte uniforme. **Seule la teinte de fond de carte** code le groupe (gris/bleu/ambre) — pas de bandeau, pas de titre de section au-dessus, pour que ça reste une grille d'un seul tenant visuellement, différente de la matrice de permissions. Dans chaque carte : icône en haut dans un petit cercle, ID en badge discret (coin supérieur droit), nom du module en gras, la phrase-attente en dessous en plus petit.

**Images recommandées :** icônes simples, même bibliothèque que les figures 8-9 (Heroicons/Feather) pour rester cohérent : cadenas (BF-01), pile de dossiers (BF-02), mégaphone (BF-03), boîte de réception (BF-04), presse-papier coché (BF-05), calendrier (BF-06), cloche (BF-07), tableau de bord (BF-08).

**Note pour l'IA :** *"Les 8 cartes doivent être de taille strictement identique — seule la couleur de fond doit suggérer le regroupement, aucune bordure ni séparateur supplémentaire entre les 3 familles."*

---

## Figure 11 — 3.2.9 Acteurs et responsabilités (cercles concentriques)

⚠️ Précision importante : cette section contient **deux tableaux distincts**. Le second (Fonctionnalité × Acteur, Oui/Non/Partiel) est celui qu'on a **déjà transformé** en matrice à pastilles. Cette figure-ci cible le **premier tableau** (Acteur / Opérations / Données manipulées / Niveau de contrôle) — ne les confonds pas en briefant l'IA.

**Objectif :** *"Montrer que le périmètre de contrôle de chaque acteur EN CONTIENT un autre — le Super admin ne fait pas juste 'plus de choses', son périmètre englobe administrativement celui de tous les autres."*

**Contenu exact (du centre vers l'extérieur) :**

1. **Candidat** (anneau central, le plus petit) — *"Contrôle limité à son parcours personnel."* Opérations : postuler, vérifier son email, passer un quiz, suivre sa candidature. Données : son propre dossier, ses réponses, ses statuts publics.
2. **Recruteur** — *"Contrôle opérationnel contextualisé par campagne et par entité."* Opérations : créer une campagne, planifier un entretien, évaluer, décider. Données : campagnes assignées, candidatures, évaluations, décisions.
3. **Administrateur** — *"Contrôle d'administration métier."* Opérations : gérer utilisateurs, référentiels, permissions. Données : utilisateurs, groupes métier, référentiels, paramètres.
4. **Super administrateur** (anneau externe, le plus grand) — *"Contrôle maximal et structurant."* Opérations : superviser la plateforme, les réglages globaux, la gouvernance de sécurité. Données : configuration globale, rôles système, supervision transverse.

**Structure :** 4 cercles concentriques (pas des anneaux pleins — des cercles remplis en transparence croissante du centre vers l'extérieur, sinon le centre est caché). Le nom du rôle et le "niveau de contrôle" sont écrits **directement sur chaque anneau**. Les "Opérations" et "Données" de chaque acteur sortent en **callout externe** : une ligne fine part du bord de l'anneau correspondant vers une petite étiquette texte disposée tout autour du cercle (comme les légendes d'un diagramme scientifique), pour ne pas surcharger l'intérieur du cercle.

**Images recommandées :** réutilise les **petits cercles colorés à initiale** déjà utilisés en Figure 1 (bandeau d'acteurs) — pose un petit marqueur de ce type à l'endroit où chaque anneau touche le callout, ça crée un rappel visuel entre les deux figures sans dupliquer tout le style.

**Note pour l'IA :** *"Le Super administrateur doit être le cercle le PLUS GRAND (englobant), pas le plus petit — c'est contre-intuitif si on pense 'centre = important', mais ici centre = périmètre restreint. Ne pas inverser l'ordre."*

---

## Figure 12 — 3.3 Besoins non fonctionnels (médaillons en étoile / hub-and-spoke)

**Objectif :** *"7 exigences qualité, toutes au même niveau d'importance, reliées à un seul hub central — contrairement à la figure précédente, ici PERSONNE n'englobe personne, ce sont des pairs."*

**Contenu exact (hub central + 7 médaillons, dans cet ordre horaire à partir du haut) :**

- Hub central : *"Qualité du système SyneliaQuizApp"*
- BNF-01 Performance — *"Navigation fluide sur les parcours courants."*
- BNF-02 Sécurité — *"Authentification fiable, permissions vérifiées côté backend."*
- BNF-03 Fiabilité — *"Transitions d'état contrôlées, historique cohérent."*
- BNF-04 Ergonomie — *"Écrans lisibles, vocabulaire homogène."*
- BNF-05 Maintenabilité — *"Architecture en couches, contrats d'API stables."*
- BNF-06 Traçabilité — *"Historique exploitable des décisions et évaluations."*
- BNF-07 Conformité — *"Données nécessaires uniquement, audit possible."*

**Structure :** hub circulaire au centre (plus grand, fond de couleur, texte blanc), 7 médaillons de taille identique disposés en cercle autour à distance égale, reliés au hub par un simple trait fin (pas de flèche — une relation d'appartenance, pas un flux). Sous chaque médaillon, le critère en une ligne, petit texte gris.

**Images recommandées :** une icône par axe dans chaque médaillon, même bibliothèque que les figures précédentes : éclair/compteur (Performance), bouclier (Sécurité), check-shield (Fiabilité), œil/silhouette (Ergonomie), clé à molette (Maintenabilité), loupe/horloge (Traçabilité), balance (Conformité).

**Note pour l'IA :** *"Les 7 médaillons doivent être à distance ÉGALE du centre et de taille ÉGALE entre eux — aucune hiérarchie visuelle entre les 7 exigences, contrairement à la figure des cercles concentriques juste avant où la taille/position EST hiérarchique. Ne confonds pas les deux logiques."*

---

Prochain lot : 3.6 (kanban des règles de gestion), 4.2.1 (face-à-face Merise/UML), 6.3 (arbre de dépôt) — on continue ?


Suite du lot — une règle de gestion, un affrontement méthodologique, une arborescence de dépôt. Trois géométries bien différentes.

---

## Figure 13 — 3.6 Règles de gestion (tableau de cartes façon kanban)

**Objectif à donner à l'IA :** *"9 règles de gestion regroupées en 4 familles thématiques — pas 8 colonnes séparées par domaine individuel, ce serait illisible. Chaque carte montre la règle ET sa conséquence système, reliées par une flèche, pas juste empilées."*

**Contenu exact (4 colonnes, 9 cartes au total) :**

**Colonne 1 — Cadre et accès** *(icône cadenas)*
- RG-01 Campagnes — *"Une campagne ne peut être ouverte que si son cadre métier est cohérent."* → *"Le backend bloque les activations incohérentes."*
- RG-02 Accès public — *"L'accès candidat dépend du lien, de l'état de campagne et des limites métier."* → *"Les points d'entrée publics vérifient le contexte avant création de dossier."*
- RG-03 Vérification email — *"Certaines actions publiques exigent un email validé."* → *"La vérification devient une précondition métier, pas un confort d'interface."*

**Colonne 2 — Intégrité des données** *(icône base de données)*
- RG-04 Versionning formulaire — *"Une version ayant servi ne doit plus être altérée destructivement."* → *"Le verrouillage protège la comparabilité des réponses."*
- RG-05 Pipeline — *"application_progress est la source de vérité de l'avancement."* → *"Les écrans dérivent de l'historique, pas d'un statut simplifié."*

**Colonne 3 — Décisions et permissions** *(icône balance)*
- RG-06 Entretiens/décisions — *"Un entretien ou une décision doit être rattaché à la bonne étape du pipeline."* → *"Historique lisible des événements menant au verdict."*
- RG-07 Permissions — *"Une action dépend du rôle global ET d'un droit contextualisé."* → *"Contrôles d'accès réalisés côté backend, avec contexte métier."*

**Colonne 4 — Traçabilité** *(icône loupe)*
- RG-08 Correction quiz — *"Toute correction manuelle reste identifiable, datée, attribuable."* → *"Traçabilité de l'évaluation préservée et révisable."*
- RG-09 Audit — *"Les décisions critiques doivent être justifiables a posteriori."* → *"Le modèle conserve l'information nécessaire à l'audit."*

**Structure :** 4 colonnes verticales, chacune avec un bandeau d'en-tête coloré portant son icône + titre. Sous chaque bandeau, les cartes empilées. **Dans chaque carte**, deux zones séparées par une flèche "→" horizontale fine : à gauche "RÈGLE" (texte normal), à droite "EFFET SYSTÈME" (texte en italique, légèrement plus petit) — pour bien montrer que ce n'est pas une liste, mais une relation cause→conséquence à chaque ligne.

**Images recommandées :** une icône par en-tête de colonne seulement (4 icônes au total) — pas d'icône par carte individuelle, sinon ça devient trop chargé avec 9 cartes. Même bibliothèque que les figures précédentes.

**Note pour l'IA :** *"La flèche RÈGLE→EFFET à l'intérieur de chaque carte est l'élément essentiel — sans elle, ça redevient un simple tableau redécoupé en colonnes. Ne la simplifie pas en une seule ligne de texte."*

---

## Figure 14 — 4.2.1 Démarche Merise retenue (face-à-face Merise vs UML)

**Objectif :** *"Montrer un arbitrage nuancé sur 6 critères — PAS un vainqueur unique. Merise l'emporte sur la plupart des critères, UML l'emporte nettement sur un seul (comportements dynamiques), et un critère est neutre. Le schéma doit rendre cette nuance visible, pas la gommer."*

**Contenu exact (6 lignes, avec le camp qui l'emporte pour chacune) :**

| Critère | Merise | UML | Qui l'emporte |
|---|---|---|---|
| Nature de la méthode | Méthode systémique orientée SI | Langage orienté objet, indépendant d'une méthode | ≈ neutre (descriptif) |
| Découpage proposé | Séparation données/traitements, 3 niveaux | Diagrammes sans démarche imposée | Merise |
| Adéquation domaines riches en données | Très forte (MCD/MLD/MPD rigoureux) | Possible mais sans rigueur des cardinalités | **Merise (net)** |
| Adéquation comportements dynamiques | Couverte mais formalisme peu répandu | Très riche (séquences, états, UC) | **UML (net)** |
| Maîtrise pédagogique | Largement enseignée en école ivoirienne | Maîtrisée mais usage dispersé | Merise (léger) |
| Compatibilité avec le projet | Excellente — structure autour de la base, pivot du système | Pertinente en complément pour les flux | **Merise (net)** |

**Structure :** deux colonnes face à face (Merise à gauche en navy, UML à droite en bleu clair), séparées par une colonne centrale fine portant juste le nom du critère. Pour chaque ligne, le côté qui l'emporte a sa cellule **surlignée** (fond teinté + bordure) et porte un petit chevron "▸"/"◂" pointant vers lui ; les lignes "nettes" (3, 4, 6) ont un surlignage plus marqué que les lignes "légères" (2, 5) ; la ligne neutre (1) n'a aucun surlignage des deux côtés.

**Bandeau de synthèse sous le tableau :** *"Verdict : Merise = colonne vertébrale de la conception (MCD/MLD/MPD) — UML = complément pour les flux et comportements dynamiques (séquences, cas d'utilisation)."*

**Images recommandées : non.** Ce sont deux méthodologies abstraites, pas des logiciels — un logo serait artificiel ici. Le code couleur (navy vs bleu clair) et l'intensité du surlignage suffisent à porter l'info, garde ça en vectoriel pur.

**Note pour l'IA :** *"N'applique pas la même intensité de surlignage partout — les lignes 3, 4 et 6 doivent visuellement 'peser plus lourd' que les lignes 2 et 5. Si les 6 lignes ont l'air également tranchées, le schéma ment sur la nuance réelle de l'arbitrage."*

---

## Figure 15 — 6.3 Implémentation du frontend (arborescence de dépôt)

**Objectif :** *"Montrer la structure du dépôt comme ce qu'elle est littéralement : un arbre de dossiers, pas un tableau déguisé."*

**Contenu exact (racine + 3 branches) :**

```
Dépôt SyneliaQuizApp
├── quizapp/              (Application Spring Boot)
│     "Centralise la logique métier, la sécurité, les
│      accès aux données, les endpoints REST et les
│      services transverses."
│
├── quizapp_front/         (Application Angular)
│     "Porte l'expérience utilisateur, les formulaires,
│      les écrans métier et les flux de navigation."
│
└── docker-compose.yml     (Services d'infrastructure locale)
      "Décrit les dépendances techniques utiles au
       développement et aux validations locales."
```

**Structure :** arbre vertical classique façon explorateur de fichiers — racine en haut à gauche, 3 branches en dessous reliées par des traits en L (coude), noms de fichiers/dossiers en police monospace (pour évoquer du code), description en police normale/italique à droite de chaque branche.

**Images recommandées : oui, en réutilisant celles déjà choisies pour la Figure 5 (tour technique)** — petit logo Angular à côté de `quizapp_front/`, petit logo Spring Boot à côté de `quizapp/`, et l'icône officielle Docker (baleine) à côté de `docker-compose.yml`. Ça crée un **rappel visuel direct** avec la tour technique (même logos, contexte différent) plutôt que d'introduire de nouvelles icônes génériques de dossier.

**Note pour l'IA :** *"Utilise les mêmes fichiers de logo que pour la Figure 5 (tour technique) si tu les as gardés — la cohérence entre ces deux figures doit être immédiatement reconnaissable, elles parlent du même stack à deux moments différents du mémoire."*

---

Prochain lot : 6.6 (diagramme de déploiement avec ports), 7.1 (cible de risque), 8.2 (dashboard de jauges) — ce sont les 3 derniers de ta liste initiale. On continue ?



Dernier lot de ta liste initiale — après ça, les 21 points sont couverts.

---

## Figure 16 — 6.6 Exécution locale et DevOps (diagramme de déploiement)

**Objectif à donner à l'IA :** *"Montrer la topologie réelle d'exécution locale — ce qui tourne en conteneur vs sur la machine hôte, avec les ports exacts. Ce n'est pas l'architecture logique (déjà montrée en Fig. 13-14), c'est où ça tourne concrètement."*

**Contenu exact :**

```
┌─────────────────────────────────────────────┐
│  Machine hôte (développement local)          │
│                                               │
│  ┌──────────────────┐      ┌──────────────┐  │
│  │ Angular dev-server│─────▶│ Spring Boot  │  │
│  │     :4200 (HMR)   │ proxy │    :8080     │  │
│  └──────────────────┘ /api/**└──────┬───────┘  │
│                                     │          │
│         ┌───────────────────────────┼───────┐ │
│         │                           │       │ │
│         ▼                           ▼       │ │
│  ┌─────────────┐          ┌──────────────┐ │ │
│  │ MySQL 8     │          │ Docker       │ │ │
│  │ :3306       │          │ Compose      │ │ │
│  │ (externe,   │          │ ┌──────────┐ │ │ │
│  │  Flyway)    │          │ │Redis 7   │ │ │ │
│  └─────────────┘          │ │:6379     │ │ │ │
│                           │ └──────────┘ │ │ │
│                           │ ┌──────────┐ │ │ │
│                           │ │MinIO     │ │ │ │
│                           │ │:9000/9001│ │ │ │
│                           │ └──────────┘ │ │ │
│                           └──────────────┘   │ │
└─────────────────────────────────────────────┘
```

**Structure :** un grand cadre "Machine hôte" englobant tout. À l'intérieur, Angular et Spring Boot sont des boîtes **directement sur l'hôte** (pas de sous-cadre). Redis et MinIO sont à l'intérieur d'un **second cadre imbriqué "Docker Compose"** avec un style de bordure différent (pointillé, pour signaler "conteneurisé"). MySQL est à part, **hors du cadre Docker Compose** mais toujours dans l'hôte, avec une étiquette "externe" — conformément au texte, qui précise que MySQL n'est pas dans la même composition Docker. Chaque boîte porte son port en évidence.

**Images recommandées : oui, en réutilisant les logos déjà choisis** (Angular, Spring Boot, MySQL — Fig. 5 et 15) **+ 2 nouveaux : logos officiels Redis et MinIO** (même source, devicon.dev/simpleicons.org). Mets aussi la petite baleine Docker sur le cadre pointillé "Docker Compose" pour l'identifier d'un coup d'œil.

**Note pour l'IA :** *"Le cadre 'Docker Compose' doit avoir un style de bordure visuellement distinct (pointillé) du cadre 'Machine hôte' (plein) — c'est cette différence de trait qui communique 'conteneurisé vs natif', pas une couleur de fond différente."*

---

## Figure 17 — 7.1 Stratégie de tests (cible de risque, remplace la Fig. 47 pyramide)

**Objectif :** *"Remplacer la pyramide des tests (cliché, et un peu trompeur ici) par une cible qui montre que l'effort de test se concentre sur les zones à fort risque métier, pas uniformément sur toute l'application."*

**Contenu exact (3 anneaux, du centre vers l'extérieur) :**

- **Centre — "Zones à effet de bord élevé"** : permissions contextualisées, versionnement des formulaires, critères d'évaluation, flux d'entretien. → forte densité des 3 types de tests ici.
- **Anneau intermédiaire — "Interactions inter-couches"** : contrats JSON, endpoints contrôleurs, scénarios Postman. → densité moyenne, dominée par les tests d'intégration.
- **Anneau extérieur — "Surface applicative générale"** : compilation, build, parcours UI généraux. → faible densité, tests unitaires et fonctionnels épars.

**3 types de points à disperser dans les anneaux (pas des cases pleines — des points semés avec une densité variable) :**
- 🔧 Tests unitaires/slice
- 🔗 Tests d'intégration (contrôleurs, contrats, Postman)
- 🖥️ Tests fonctionnels (UI, parcours public)

**Structure :** cible classique à 3 anneaux concentriques. **La différence avec la Figure 11 (cercles des acteurs) doit être nette** : ici, pas de texte dans de grandes zones propres — à la place, sème une **vingtaine de petits points colorés** (3 couleurs = 3 types de tests) à l'intérieur des anneaux, **très denses au centre, de plus en plus épars vers l'extérieur**. C'est la densité qui porte le message, pas des étiquettes.

**Images recommandées :** 3 icônes simples pour la légende uniquement (engrenage-coche, maillons de chaîne, fenêtre navigateur) — mêmes bibliothèque que les figures précédentes. Pas d'icône à l'intérieur de chaque point semé (sinon ça devient illisible avec 20 points).

**Note pour l'IA :** *"Ne mets PAS une densité uniforme dans les 3 anneaux — le centre doit visuellement paraître 'plus chargé' que l'extérieur. Si les 3 anneaux ont l'air également remplis, le schéma perd tout son intérêt par rapport à la pyramide qu'il remplace."*

---

## Figure 18 — 8.2 Fonctionnalités implémentées (dashboard de jauges)

⚠️ Petite note avant : ton tableau d'origine utilise des niveaux qualitatifs ("Élevé", "Moyen à élevé"), pas des pourcentages mesurés. Je te recommande de **garder le remplissage de jauge qualitatif** (2 longueurs de barre seulement, pas de "73%" inventé) — mets le label textuel à côté de la barre plutôt qu'un chiffre, pour ne pas donner une fausse précision à un jury qui pourrait te demander d'où sort le chiffre.

**Objectif :** *"Boucler avec la Figure 10 (grille des besoins fonctionnels, chapitre 3) — ici on montre ce que chaque module est devenu en fin de projet. Mêmes icônes, pour que le lecteur fasse le lien entre 'ce qui était prévu' et 'ce qui a été livré'."*

**Contenu exact (6 jauges) :**

- Campagnes et formulaires — **Élevé** — *"Création, configuration, partage d'accès, versions, stratégies d'affectation."*
- Candidatures — **Élevé** — *"Soumission publique, vérification d'email, suivi, retrait, traitement recruteur."*
- Quiz technique — **Élevé** — *"Tentatives, chronométrage, randomisation, notation automatique, correction manuelle."*
- Entretiens — **Élevé** — *"Planification, réponse candidat, reprogrammation, archivage."*
- Évaluations et décisions — **Élevé** — *"Critères détaillés, agrégats, décisions intermédiaires/finales, notifications."*
- Administration transverse — **Moyen à élevé** — *"Permissions, configuration, emails/SMTP, référentiels, supervision."*

**Structure :** 6 lignes horizontales empilées. Par ligne : icône du module à gauche (**réutilise exactement les icônes de la Figure 10** — mégaphone, boîte de réception, presse-papier coché, calendrier, balance, engrenage) → nom du module → jauge horizontale (barre arrondie, fond gris clair, remplissage coloré : vert long pour "Élevé", vert plus court pour "Moyen à élevé") → synthèse en italique en dessous, petite.

**Images recommandées :** aucune nouvelle — c'est le but, les icônes doivent être **visuellement identiques** à celles de la Figure 10 pour que le rappel soit immédiat.

**Note pour l'IA :** *"N'affiche aucun pourcentage numérique sur les jauges — seulement 2 longueurs de remplissage possibles (Élevé / Moyen à élevé) avec le label écrit à côté. Les icônes doivent être pixel-identiques à celles utilisées dans la figure des besoins fonctionnels du chapitre 3, pas juste 'de la même famille'."*

---

C'est le dernier de ta liste des 21 — les 18 figures couvrent maintenant tout, plus la machine à états générique qu'on a ajoutée en cours de route. Tu as une belle variété au final : icônes plates, frontière de périmètre, quadrant, arbre de décision, tour empilée, fiches persona, machine à états, fourche convergente, correspondance bipartite, grille de cartes, cercles concentriques, médaillons en étoile, kanban, face-à-face, arborescence, topologie de déploiement, cible de densité, dashboard de jauges — aucune ne se ressemble vraiment.

Si en implémentant avec ton IA codante tu bloques sur une figure en particulier ou qu'un détail te semble incohérent une fois en image, n'hésite pas à revenir.

