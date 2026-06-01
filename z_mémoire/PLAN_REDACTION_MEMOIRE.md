# Plan de redaction du memoire - SyneliaQuizApp

## 1. Objectif immediat

Produire une version complete du memoire en mode "brouillon solide" avant la soutenance, meme si la bibliographie n'est pas encore finalisee.

Contraintes de travail retenues :

- respecter strictement l'ordre impose par [PLAN_MEMOIRE.md](./PLAN_MEMOIRE.md) et [CONSIGNES_MEMOIRE.md](./CONSIGNES_MEMOIRE.md)
- rediger comme si le projet etait totalement termine
- considerer comme livre l'evolution multi-occurrences decrite dans `cartographie-fonctionnelle-front/evolution/420-evolution-pipeline-multi-occurrences.md`
- ne pas integrer de citations pour l'instant
- preparer un contenu facilement portable vers Typst ensuite

## 2. Regle de travail

Le document final doit conserver cet ordre exact :

1. Couverture
2. Page de garde
3. Page de remerciements
4. Resume / Abstract
5. Sommaire
6. Avant-propos
7. Glossaire
8. Introduction (non numerotee)
9. Corps du memoire
10. Conclusion (non numerotee)
11. References bibliographiques
12. Annexes
13. Table des matieres

En revanche, l'ordre de redaction peut etre different pour aller plus vite et partir de la matiere deja disponible dans le projet.

## 3. Strategie de redaction

### 3.1 Principe general

On distingue deux choses :

- l'ordre d'apparition dans le memoire, qui reste fixe
- l'ordre de production, qui doit partir des chapitres les plus factuels et les plus documentes

### 3.2 Ordre recommande de redaction

1. Chapitre 5 - Environnement technique et outils
2. Chapitre 6 - Implementation de la solution
3. Chapitre 3 - Analyse des besoins
4. Chapitre 4 - Conception de la solution
5. Chapitre 7 - Tests et validation
6. Chapitre 8 - Presentation des resultats
7. Chapitre 9 - Limites et perspectives
8. Chapitre 1 - Presentation generale du projet
9. Chapitre 2 - Etude de l'existant et etat de l'art
10. Introduction
11. Conclusion
12. Resume / Abstract
13. Avant-propos, remerciements, glossaire, annexes, sommaire

### 3.3 Pourquoi cet ordre

- les chapitres 5 et 6 sont les plus simples a rediger car ils reposent sur le code et l'architecture existants
- les chapitres 3 et 4 peuvent ensuite etre rediges a partir des fonctionnalites reelles deja implementees
- les chapitres 7, 8 et 9 servent a transformer l'execution du projet en bilan d'ingenierie
- l'introduction et la conclusion doivent etre ecrites apres stabilisation du corps du memoire
- le resume et l'abstract doivent etre rediges en dernier pour refleter fidelement l'ensemble du document

## 4. Sources internes a exploiter en priorite

### 4.1 Sources de cadrage

- `z_mémoire/PLAN_MEMOIRE.md`
- `z_mémoire/CONSIGNES_MEMOIRE.md`
- `z_mémoire/CAHIER_DES_CHARGES_FINAL.md`
- `z_mémoire/template_memoire/index.html`

### 4.2 Sources fonctionnelles et metier

- `cartographie-fonctionnelle-front/evolution/420-evolution-pipeline-multi-occurrences.md`
- les fichiers de cartographie front publique et evolution
- `z_notes/`
- `to-do/`
- les notes de correction deja redigees sur les slices importantes

### 4.3 Sources techniques

- `quizapp/pom.xml`
- `quizapp_front/package.json`
- `quizapp_front/angular.json`
- `docker-compose.yml`
- la structure reelle des dossiers backend et frontend

### 4.4 Sources de validation

- `quizapp/POSTMAN_API_GUIDE.md`
- les classes de tests Java du backend
- les specs et validations frontend quand elles existent
- les notes de debug et de validation dans `z_notes/`

## 5. Decisions editoriales a appliquer des maintenant

- Ecrire au passe ou au present d'expose avec une ligne stable, sans melanger constamment les temps.
- Presenter le systeme comme un produit abouti, quitte a reserver les limites au chapitre 9.
- Eviter les longs extraits de code dans le corps du memoire ; placer les gros morceaux techniques en annexes.
- Transformer chaque chapitre en demonstrateur d'une demarche d'ingenieur : probleme, choix, implementation, validation, bilan.
- Ne laisser des placeholders que pour les informations externes indisponibles : noms exacts des encadrants, dates definitives, references bibliographiques finales, captures finales.

## 6. Plan de redaction detaille

### 6.1 Pages preliminaires

#### Couverture

Contenu a produire :

- titre final du memoire
- nom de l'ecole ENSIT
- nom de l'entreprise SYNELIA
- annee academique 2023 - 2024
- intitule du diplome
- nom de l'etudiant
- nom de l'encadreur pedagogique
- nom, prenom et fonction du maitre de stage

Statut attendu pour la V1 :

- structure complete
- placeholders uniquement sur les noms institutionnels non confirmes

#### Page de garde

Contenu a produire :

- reprise stricte de la couverture

#### Remerciements

Contenu a produire :

- une page maximum
- ton sobre et institutionnel
- remerciements a l'encadreur, au maitre de stage, a SYNELIA, a l'ENSIT, au jury, a la famille

#### Resume / Abstract

Contenu a produire en dernier :

- contexte
- problematique
- objectif
- methode
- technologies
- resultats obtenus
- mots-cles

#### Sommaire

Contenu a produire :

- uniquement les grandes parties et chapitres
- pas de sous-sections detaillees

#### Avant-propos

Contenu a produire :

- presentation de l'ENSIT
- presentation de la formation et du diplome
- presentation de SYNELIA
- cadre du stage

#### Glossaire

Contenu a produire :

- acronymes techniques du projet
- sigles lies a l'architecture web, a Spring Boot, Angular, REST, JWT, JPA, WebSocket, RGPD, UML, Typst

### 6.2 Introduction non numerotee

Contenu obligatoire :

- presentation du sujet
- problematique
- justification du theme
- definition des concepts cles
- methodologie generale adoptee
- annonce du plan
- phrase finale ouvrant sur les perspectives

Source principale :

- `z_mémoire/PLAN_MEMOIRE.md`
- `z_mémoire/CAHIER_DES_CHARGES_FINAL.md`
- realite du projet livre

### 6.3 Premiere partie - Cadre theorique et contexte du projet

#### Chapitre 1 - Presentation generale du projet

Objectif :

- expliquer le besoin de SYNELIA et cadrer le probleme de recrutement a resoudre

Sous-parties a rediger :

- contexte du projet
- objectifs generaux et specifiques
- perimetre fonctionnel
- contraintes du projet

Sources principales :

- `z_mémoire/CAHIER_DES_CHARGES_FINAL.md`
- `z_mémoire/template_memoire/index.html`
- notes produit et cartographies

#### Chapitre 2 - Etude de l'existant et etat de l'art

Objectif :

- positionner la solution par rapport aux ATS, aux outils d'evaluation technique et aux choix technologiques modernes

Sous-parties a rediger :

- etude de l'existant chez SYNELIA
- benchmark des solutions existantes
- etat de l'art technologique
- justification des choix techniques retenus
- critique de l'existant et solution proposee

Note de production :

- ce chapitre peut etre redige sans citations dans la V1, puis complete plus tard avec les articles et ouvrages

### 6.4 Deuxieme partie - Analyse et conception

#### Chapitre 3 - Analyse des besoins

Objectif :

- montrer que le systeme repond a des besoins reellement identifies et structures

Sous-parties a rediger :

- methodologie d'analyse
- besoins fonctionnels par module
- besoins non fonctionnels
- cas d'utilisation
- regles de gestion

Angles a traiter :

- parcours candidat
- campagnes de recrutement
- quiz technique
- entretiens
- evaluations collaboratives
- notifications
- suivi de candidature public
- gestion des roles et permissions

Sources principales :

- cartographies fonctionnelles
- `z_notes/`
- backlog et to-do

#### Chapitre 4 - Conception de la solution

Objectif :

- transformer les besoins en architecture, modele de donnees et organisation logique du systeme

Sous-parties a rediger :

- architecture globale du systeme
- conception de la base de donnees
- diagrammes de classes
- diagrammes de sequence
- diagrammes d'activites et d'etats
- maquettes et interfaces
- conception de l'API REST

Point important pour la V1 :

- meme si tous les diagrammes UML ne sont pas encore finalises, le texte explicatif doit deja exister
- pour le pipeline multi-occurrences, rediger comme si la cible etait entierement livree

Sources principales :

- structure backend et frontend
- entites JPA
- controllers REST
- note `420-evolution-pipeline-multi-occurrences.md`

### 6.5 Troisieme partie - Realisation et mise en oeuvre

#### Chapitre 5 - Environnement technique et outils

Objectif :

- presenter l'environnement reel de developpement et de livraison du projet

Sous-parties a rediger :

- environnement de developpement
- technologies backend
- technologies frontend
- base de donnees
- outils complementaires

Sources principales :

- `quizapp/pom.xml`
- `quizapp_front/package.json`
- `quizapp_front/angular.json`
- `docker-compose.yml`

#### Chapitre 6 - Implementation de la solution

Objectif :

- decrire comment la solution a ete construite concretement

Sous-parties a rediger :

- organisation du code source
- implementation du backend
- implementation du frontend
- implementation des modules fonctionnels
- integration et communication front/back

Sous-angle important :

- illustrer le decoupage Controllers -> Business -> DAO -> Entities
- montrer la structure Angular par pages, composants, services, guards, shared
- mettre en valeur les modules metier les plus forts du projet

#### Chapitre 7 - Tests et validation

Objectif :

- montrer que le projet n'est pas seulement developpe, mais verifie

Sous-parties a rediger :

- strategie de tests
- tests unitaires
- tests d'integration
- tests fonctionnels
- tests de performance
- tests de securite
- recettage et validation

Realite a assumer dans le texte :

- tous les niveaux ne seront pas couverts avec la meme profondeur
- il faut etre honnete, mais presenter clairement ce qui a ete reellement valide

### 6.6 Quatrieme partie - Resultats et perspectives

#### Chapitre 8 - Presentation des resultats

Objectif :

- montrer ce qui a ete obtenu concretement a la fin du projet

Sous-parties a rediger :

- demonstration de l'application
- fonctionnalites implementees
- bilan technique
- retour d'experience

Sources principales :

- modules reels de l'application
- captures futures
- notes de corrections et de completion de slices

#### Chapitre 9 - Limites et perspectives

Objectif :

- faire apparaitre une vision d'ingenierie realiste, sans survendre ni minimiser le travail realise

Sous-parties a rediger :

- limites fonctionnelles
- limites techniques
- perspectives d'amelioration
- recommandations

Exemples de perspectives possibles :

- integration calendrier
- automatisation plus poussee des workflows
- couverture de tests plus large
- CI/CD
- ameliorations UX
- analytics RH et reporting avances

### 6.7 Conclusion non numerotee

Contenu obligatoire :

- rappel de la problematique
- rappel de la demarche
- synthese des resultats
- contributions principales
- limites du travail
- perspectives

### 6.8 References bibliographiques

Strategie immediate :

- garder la section vide ou semi-structuree dans la V1
- preparer seulement les categories : ouvrages, documentation technique, normes, sites web, articles
- integrer les vraies references quand la bibliographie sera fournie

### 6.9 Annexes

Annexes a preparer ensuite :

- captures d'ecran
- diagrammes UML
- scripts SQL
- extraits de code significatifs
- documentation API
- guide d'installation
- manuel utilisateur
- planning du projet

## 7. Plan d'execution concret sur la prochaine session

### Phase 1 - Stabiliser la base documentaire

- valider le plan detaille
- figer les titres des parties et chapitres
- lister les fichiers sources reellement utiles par chapitre

### Phase 2 - Produire le squelette Typst

- creer un `main.typ`
- creer un fichier par grande section ou par chapitre
- reproduire strictement l'ordre impose par les consignes
- prevoir les styles de titres, sommaire, couverture, numerotation et annexes

### Phase 3 - Rediger le corps principal

- commencer par les chapitres 5 et 6
- enchainer avec les chapitres 3 et 4
- terminer par 7, 8 et 9

### Phase 4 - Rediger les parties de synthese

- introduction
- conclusion
- resume
- abstract

### Phase 5 - Finaliser l'appareil documentaire

- sommaire
- glossaire
- annexes
- table des matieres
- references bibliographiques

## 8. Definition de fini pour la version V1

La version V1 du memoire sera consideree comme prete pour verification si :

- toutes les parties obligatoires existent dans le bon ordre
- aucun chapitre n'est vide
- les sections non numerotees sont correctement identifiees
- les chapitres techniques reposent sur le projet reel et non sur du texte generique
- la bibliographie peut encore etre incomplete, mais sa section existe deja
- les derniers trous restants sont limites aux noms officiels, aux references et aux annexes finales

## 9. Livrables a produire ensuite

Apres ce plan Markdown, les prochains livrables logiques sont :

1. un squelette Typst complet du memoire
2. un premier jet redige des chapitres 5 et 6
3. un premier jet redige des chapitres 3 et 4
4. une version complete du memoire sans citations
5. une version enrichie avec bibliographie et annexes