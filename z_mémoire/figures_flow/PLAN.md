# Plan — figures_flow

Réécriture des diagrammes Merise/UML avec React Flow (@xyflow/react).

---

## Phase 0 — Initialisation du projet

- [ ] Initialiser le projet Vite + React + TypeScript
- [ ] Installer `@xyflow/react`, `tailwindcss`, `@tailwindcss/vite`, `clsx`, `lucide-react`
- [ ] Configurer Tailwind CSS (via Vite plugin), définir les couleurs custom et le mode dark (classe sur `<html>`)
- [ ] Créer la structure de dossiers (src/components, src/diagrams, src/types, src/hooks, src/utils)
- [ ] Configurer tsconfig (strict, paths)
- [ ] Créer l'index.html avec une SPA basique (sidebar + zone de rendu)
- [ ] Vérifier que `npm run dev` fonctionne

## Phase 1 — Types & données

### 1.1 Modèles (src/types/)

- [ ] Définir `EntityNode` : id, type (mcd-entity | mld-table | mpd-table), position, data { label, attributes: Attribute[], color?, badge? }
- [ ] Définir `Attribute` : name, type? (SQL pour MPD), isPK, isFK, isNew?, isDeleted?, description?
- [ ] Définir `RelationshipEdge` : id, source, target, label?, cardFrom?, cardTo?, isStrong?, isDashed?
- [ ] Définir `DiagramDefinition` : id, title, category (mcd|mld|mpd), domain, nodes: EntityNode[], edges: RelationshipEdge[]

### 1.2 Déclarations (src/diagrams/)

**MCD — 6 diagrammes**

- [ ] `mcd/identite_permissions.ts` — 3 entités (UTILISATEUR, GROUPE_METIER, PERMISSION_ENTITE)
- [ ] `mcd/identite_permissions_moderne.ts` — même MCD, variante colorée alternative
- [ ] `mcd/campagnes_pipeline.ts` — 9 entités (CAMPAGNE → PIPELINE_TEMPLATE → ETAPE_PIPELINE → REGLE_NOTIFICATION, FORMULAIRE → VERSION_FORMULAIRE → QUESTION → REPONSE_POSSIBLE, SOURCE_TOKEN)
- [ ] `mcd/candidature_quiz.ts` — 6 entités (CANDIDATURE → AVANCEMENT → TENTATIVE_QUIZ → REPONSE_CANDIDAT, DECISION, DEMANDE_CANDIDAT)
- [ ] `mcd/entretien_evaluation.ts` — 7 entités (ENTRETIEN → ENTRETIEN_CANDIDAT, PARTICIPANT_ENTRETIEN, EVALUATION → ITEM_EVALUATION → CRITERE_ETAPE → GRILLE_EVALUATION)
- [ ] `mcd/audit_notifications.ts` — 3 entités (NOTIFICATION, MAIL_LOG, EVENEMENT_AUDIT)

**MLD — 5 diagrammes**

- [ ] `mld/identite_permissions.ts` — 6 tables (UTILISATEUR, GROUPE_METIER, PERMISSION_ENTITE + 3 tables de jonction)
- [ ] `mld/campagnes_pipeline.ts` — 11 tables (incl. CAMPAGNE_FORM, FORM_QUESTIONS)
- [ ] `mld/candidature_quiz.ts` — 6 tables (avec FK IdCampagne, IdSource, IdEtape, etc.)
- [ ] `mld/entretien_evaluation.ts` — 7 tables (avec FK IdAvancement, IdGrille, etc.)
- [ ] `mld/audit_notifications.ts` — 3 tables (avec FK IdUtilisateur, IdRegle, IdAvancement)

**MPD — 5 diagrammes**

- [ ] `mpd/identite_permissions.ts` — 6 tables avec types SQL et contraintes
- [ ] `mpd/campagnes_pipeline.ts` — 11 tables avec types SQL
- [ ] `mpd/candidature_quiz.ts` — 6 tables avec types SQL
- [ ] `mpd/entretien_evaluation.ts` — 7 tables avec types SQL
- [ ] `mpd/audit_notifications.ts` — 3 tables avec types SQL

## Phase 2 — Composants de base

### 2.1 Nœuds personnalisés (src/components/Nodes/)

Chaque nœud est une carte arrondie avec:
- **Header** : bandeau coloré avec le nom de l'entité/table, badge de catégorie (MCD/MLD/MPD) en petit
- **Body** : liste des attributs/champs
- Style inspiré des cartes modernes (bordures subtiles, ombres légères, fond adaptatif selon le thème)

- [ ] `EntityNode.tsx` — nœud unique adaptable (MCD entity, MLD table, MPD table) via un prop `variant` plutôt que 3 composants séparés
- [ ] Variante `mcd` : PK souligné, pas de badges, couleurs sobres (gris/bleu foncé)
- [ ] Variante `mld` : badge PK violet, préfixe `#` pour FK, table de jonction avec style distinctif
- [ ] Variante `mpd` : badge PK/PF, FK `#`, type SQL en grisé, contrainte `NN` en badge

### 2.2 Arêtes personnalisées (src/components/Edges/)

- [ ] `RelationshipEdge.tsx` — chemin SVG lissé avec cardinalités (cardFrom, cardTo) aux extrémités dans des puces
- [ ] Style strong → trait continu coloré, dashed → trait pointillé grisé
- [ ] Label `verb` au centre (utilisé en MCD) dans un petit badge
- [ ] Couleur des arêtes selon la variante (MCD: gris foncé, MLD/MPD: couleur primaire)

### 2.3 Layout & Navigation (src/components/)

- [ ] `Sidebar.tsx` — liste des diagrammes groupés par catégorie (MCD, MLD, MPD) avec accordéons, clic → charge le diagramme
- [ ] `Toolbar.tsx` — boutons : zoom +/-/fit, toggle grill, toggle dark mode, réinitialiser positions, exporter SVG
- [ ] `ThemeToggle.tsx` — bouton soleil/lune pour basculer light/dark, persisté dans localStorage
- [ ] `DiagramCanvas.tsx` — wrapper React Flow avec les nœuds/arêtes du diagramme courant

## Phase 3 — Logique applicative

### 3.1 Persistance (src/hooks/)

- [ ] `useDiagramPersistence.ts` — sauvegarde/restaure les positions des nœuds dans localStorage (clé = id du diagramme)
- [ ] Option "Réinitialiser" qui efface les positions sauvegardées
- [ ] (Optionnel) IndexedDB via Dexie.js pour structure plus robuste, si localStorage ne suffit pas

### 3.2 Édition interactive

- [ ] Drag & drop natif React Flow (positions sauvegardées automatiquement)
- [ ] Grille d'aimantation (snapToGrid: 10px)
- [ ] Zoom (molette + boutons)
- [ ] "Exporter SVG" : sérialiser la vue en SVG standalone

### 3.3 Utilitaires (src/utils/)

- [ ] `autoLayout.ts` — placement initial intelligent (topologique ou grille) pour éviter les chevauchements
- [ ] `exportSvg.ts` — capture du viewport React Flow en SVG

## Phase 4 — Styles & thèmes

### 4.1 Palette de couleurs (Tailwind)

- Définir les couleurs de la marque (`brand-*`), quelques couleurs fonctionnelles (warn, delete pour usage limité)
- Mode clair : fond gris clair (slate-50), cartes blanches, texte slate-900
- Mode sombre : fond slate-950/zinc-950, cartes slate-900/zinc-900, bordures subtiles, texte slate-100
- Transitions douces sur les changements de mode (`transition-colors`)

### 4.2 Design des nœuds

- Carte arrondie (rounded-xl), bordure fine (border), ombre légère
- Header : fond coloré semi-transparent (bg-xxx/10), texte en couleur, font-mono/semibold pour le nom
- Body : attributs espacés, fond adaptatif, séparateur subtil
- Badges utiles seulement : PK violet, FK bleu, PF orange, NN vert (pas de badges "NOUVEAU" ou "PIVOT")
- Pas de classification superflue — chaque entité a sa propre couleur cohérente (par domaine ou par rôle), sans connotation sémantique externe à Merise

### 4.3 Design des arêtes

- Courbes lissées, stroke-width 2, couleur primaire ou grisée selon le type
- Cardinalités dans des petits ovales/capsules flottants
- Labels verb au centre dans un badge blanc avec bordure

### 4.4 Styles globaux

- App.css : layout split (sidebar fixe 260px + zone diagramme fluide)
- Sidebar avec accordéons, fond adaptatif, scroll
- Toolbar fixed en haut du diagramme, fond semi-transparent avec backdrop-blur
- Responsive : sidebar repliable sur écrans étroits

## Phase 5 — Tests & finitions

- [ ] Vérifier les 16 diagrammes : toutes les entités, attributs, liens, cardinalités sont fidèles
- [ ] Tester l'export SVG
- [ ] Tester la persistance (rechargement → positions conservées)
- [ ] Nettoyer la console (pas de warnings React)
- [ ] Créer un index.html racine qui liste les 16 figures avec mini-liens

---

## Notes techniques

- **Framework** : React 18+ + TypeScript
- **Build** : Vite
- **Styling** : Tailwind CSS v4 (via `@tailwindcss/vite`)
- **Diagram** : @xyflow/react (React Flow v12)
- **Icons** : lucide-react
- **Persistence** : localStorage (clé `figures_flow:positions:{diagramId}`)
- **Thème** : light/dark via classe `.dark` sur `<html>`, persisté dans localStorage
- **Pas de Docker** : tout est statique, `npm run dev` suffit
- **Aucun code copié** du système `figures_html` existant (sauf les noms d'entités, attributs, types et cardinalités)

## Diagrammes à reproduire (16)

| # | Catégorie | Domaine | Entités |
|---|-----------|---------|---------|
| 1 | MCD | Identité & Permissions | 3 |
| 2 | MCD | Identité & Permissions (moderne) | 3 |
| 3 | MCD | Campagnes & Pipeline | 9 |
| 4 | MCD | Candidature & Quiz | 6 |
| 5 | MCD | Entretien & Évaluation | 7 |
| 6 | MCD | Audit & Notifications | 3 |
| 7 | MLD | Identité & Permissions | 6 |
| 8 | MLD | Campagnes & Pipeline | 11 |
| 9 | MLD | Candidature & Quiz | 6 |
| 10 | MLD | Entretien & Évaluation | 7 |
| 11 | MLD | Audit & Notifications | 3 |
| 12 | MPD | Identité & Permissions | 6 |
| 13 | MPD | Campagnes & Pipeline | 11 |
| 14 | MPD | Candidature & Quiz | 6 |
| 15 | MPD | Entretien & Évaluation | 7 |
| 16 | MPD | Audit & Notifications | 3 |
