# Analyse d'ecart avec le memoire de reference de TARNADA

Date : 2026-06-01
Source de reference : z_memoire/exemple_memoire/MEMOIRE_TARNADA.pdf
Usage autorise : reference structurelle et methodologique uniquement, sans reprise textuelle.

## Objet

Ce document recense ce que le memoire de TARNADA apporte comme structure, artefacts et logique de redaction par rapport au memoire Typst actuel sur SyneliaQuizApp. Le but n'est pas de copier son memoire, mais d'identifier des leviers d'amelioration concrets, surtout en privilegient Merise comme methode principale.

## Ce que le memoire de reference fait bien

### 1. Il assume une methode de conception principale

Le memoire de reference ne juxtapose pas des modeles. Il justifie d'abord un choix methodologique explicite :
- presentation de Merise et UML ;
- criteres de comparaison ;
- tableau comparatif ;
- analyse des forces et faiblesses ;
- conclusion argumentee retenant Merise comme methode principale ;
- UML presente seulement comme complement eventuel.

C'est une force importante, car le lecteur comprend pourquoi la methodologie de conception choisie est adaptee au projet.

### 2. La chaine Merise est presque complete et ordonnee

Dans le chapitre de conception, l'ordre est tres lisible :
- regles de gestion ;
- dictionnaire des donnees ;
- dependances fonctionnelles ;
- Structure d'Acces Theorique (SAT) ;
- MCD ;
- MLD / MLDR ;
- MPD ;
- MCT.

Cette progression donne une impression de rigueur d'ingenierie forte, car on voit clairement le passage du besoin vers la structure de donnees, puis vers les traitements.

### 3. Les artefacts Merise sont visibles comme de vrais livrables

Le memoire de reference liste explicitement dans ses illustrations :
- SAT ;
- MCD ;
- MPD ;
- plusieurs MCT ;
- dictionnaire des donnees.

Autrement dit, les modeles ne sont pas seulement mentionnes dans le texte : ils existent comme figures et tableaux a part entiere.

### 4. Il distingue mieux la modelisation des donnees et celle des traitements

Le memoire de reference met bien en avant :
- la partie donnees avec MCD, MLD, MPD ;
- la partie traitements avec MCT ;
- le lien entre les deux via les regles de gestion, dependances fonctionnelles et la SAT.

Cela renforce l'impression d'un vrai travail de conception de systeme d'information.

### 5. Il explicite mieux la demarche avant l'implementation

Avant d'arriver a la realisation, il installe une phase de choix techniques et methodologiques plus prononcee :
- etude comparative des technologies ;
- etude comparative des methodes de modelisation ;
- justification finale des choix retenus.

Cette partie rend la transition vers l'architecture et le developpement plus convaincante.

## Ce qui existe deja dans ton memoire

Le memoire Typst actuel n'est pas vide ni faible. Il contient deja plusieurs equivalents solides :
- un chapitre d'analyse des besoins tres enrichi ;
- une matrice des besoins fonctionnels ;
- une matrice acteurs / responsabilites ;
- une matrice roles / permissions ;
- des besoins non fonctionnels structures ;
- une priorisation MoSCoW ;
- des regles de gestion ;
- une demarche Merise explicite ;
- des sections MCD, MLD, MPD ;
- un dictionnaire de donnees du noyau metier ;
- une correspondance entre objets conceptuels et tables physiques ;
- les chapitres environnement technique, resultats, limites et perspectives.

En d'autres termes, ton memoire est deja plus riche que precedemment sur le fond. Le probleme n'est plus l'absence totale de conception, mais le fait que certains artefacts Merise visibles et certains enchainements methodologiques restent encore incomplets ou moins explicites que dans le memoire de reference.

## Ce qui manque encore ou reste plus faible que chez TARNADA

### 1. Une justification formelle du choix de Merise

Ton memoire parle deja de Merise, mais il manque encore une sous-partie nette du type :
- presentation de Merise ;
- presentation rapide de UML ;
- criteres de comparaison ;
- conclusion : Merise retenue comme methode principale pour SyneliaQuizApp.

Comme tu maitrises mieux Merise, cette evolution est pertinente et naturelle.

### 2. Les dependances fonctionnelles ne sont pas encore explicitees comme artefact autonome

Le memoire actuel contient regles de gestion, dictionnaire et modeles de donnees, mais pas encore de sous-partie vraiment identifiee comme :
- dependances fonctionnelles ;
- determinants ;
- cles et dependances importantes.

Ce manque affaiblit le passage entre dictionnaire de donnees et MCD / MLD.

### 3. La SAT n'existe pas encore

Le memoire actuel n'a pas encore d'equivalent clair de la Structure d'Acces Theorique. Pourtant, sur ton projet, cet artefact peut etre tres interessant, notamment autour des pivots suivants :
- campaigns ;
- applications ;
- form_version ;
- pipeline_stage ;
- candidate_interview ;
- decisions.

La SAT donnerait une vraie couleur systeme d'information au memoire.

### 4. La partie traitements Merise est encore trop faible

Le memoire actuel reste encore plus fort sur les donnees que sur les traitements. Il manque surtout des MCT explicites tels que :
- MCT 1 : Soumission d'une candidature ;
- MCT 2 : Verification et qualification initiale ;
- MCT 3 : Entretien et evaluation ;
- MCT 4 : Decision et notification.

C'est probablement l'un des ecarts les plus visibles avec le memoire de reference.

### 5. Les figures Merise ne sont pas encore materialisees

Le texte actuel prepare bien les sections, mais il faut encore produire les figures effectives :
- schema SAT ;
- MCD global ;
- MLD/MLDR ;
- MPD ;
- MCT principaux.

Sans ces figures, la conception reste credible sur le plan redactionnel, mais moins impressionnante visuellement et academiquement.

### 6. Les UML peuvent etre declasses au rang de complement

Le memoire actuel contient encore plusieurs sections UML :
- diagrammes de classes ;
- diagrammes de sequence ;
- diagrammes d'activites et d'etats.

Elles ne sont pas inutiles, mais si l'objectif est de privilegier Merise, il faudrait plutot :
- faire de Merise la colonne vertebrale du chapitre de conception ;
- garder UML seulement en complement ou en annexe pour certains flux techniques particuliers.

## Recommandation de repositionnement methodologique

Pour ton memoire, la meilleure posture est la suivante :
- Merise = methode principale de conception ;
- UML = outillage complementaire et non central ;
- les chapitres de conception doivent etre lus d'abord comme un travail de systeme d'information, pas comme une simple description applicative.

## Structure cible recommandee pour la conception

Voici une structure Merise-first plus adaptee a ton contexte :

1. Regles de gestion
2. Dictionnaire de donnees
3. Dependances fonctionnelles
4. Structure d'Acces Theorique (SAT)
5. MCD
6. MLD / MLDR
7. MPD
8. MCT des processus majeurs
9. Architecture applicative
10. API et implementation
11. UML eventuel en complement ou en annexe

## Priorites d'amelioration pour ton memoire

### Priorite 1 - A faire absolument
- ajouter une sous-partie de justification du choix de Merise par rapport a UML ;
- ajouter les dependances fonctionnelles ;
- ajouter la SAT ;
- ajouter au moins 3 ou 4 MCT sur les processus clefs.

### Priorite 2 - A faire ensuite
- produire les figures reelles MCD, MLD, MPD, SAT et MCT ;
- eventuellement reduire le poids des sections UML dans le corps principal.

### Priorite 3 - A faire pour consolider la soutenance
- ajouter en annexe les modeles complets ;
- preparer un lien explicite entre modeles Merise, architecture backend/frontend et base MySQL reelle.

## Conclusion

Le memoire de TARNADA est utile comme pseudo-reference non pas parce qu'il faudrait le reproduire, mais parce qu'il montre une chose essentielle : un memoire d'ingenieur gagne beaucoup en credibilite quand la methode de conception est assumee, comparee, justifiee, puis declinee en artefacts visibles.

Pour ton memoire, l'enjeu principal n'est donc plus de "faire joli" ou de simplement ajouter du texte. L'enjeu est de transformer la conception actuelle en veritable chaine Merise exploitable : regles, dictionnaire, dependances, SAT, MCD, MLD, MPD, MCT, puis seulement les complements techniques et applicatifs.
