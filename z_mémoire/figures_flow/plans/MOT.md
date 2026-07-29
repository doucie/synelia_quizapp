# MOT — Modèle Organisationnel de Traitement

---

| # | Traitement | Acteur responsable | Service / Lieu | Déclencheur | Nature | Moyens |
|---|---|---|---|---|---|---|
| T1 | Soumettre la candidature | Candidat | Externe (via web) | Campagne ouverte et accessible + email vérifié + quota non atteint + formulaire actif | Manuel | Application web |
| T2 | Répondre au quiz de l'étape en cours | Candidat | Externe (via web) | Étape de quiz active + candidat démarre le quiz + quota de tentatives non atteint | Manuel (interactif) | Application web |
| T3 | Conduire et évaluer l'entretien | Recruteur (ayant le droit d'évaluer la campagne) | Service RH | Entretien planifié + évaluations soumises | Semi-automatique | Application web |
| T4 | Valider la décision du recruteur | Recruteur | Service RH | Candidat en phase de décision + décision du recruteur | Manuel | Application web |
| T5 | Gérer la demande d'annulation | Recruteur | Service RH | Décision antérieure non immuable + demande d'annulation formulée | Manuel | Application web |
| T6 | Journaliser audit_event | Système (automatique) | Backend (API / BDD) | Toute opération métier effectuée | Automatique | API Spring Boot + MySQL |

---

## Plan d'implémentation ReactFlow (par phases itératives)

### Problème actuel
Le diagramme MOT actuel utilise un simple tableau `mot-table` avec 6 lignes texte.
Un MOT en Merise est une **matrice acteurs × traitements** où chaque cellule contient le diagramme MCT correspondant, avec l'événement déclencheur placé sous l'acteur qui le provoque.

### Architecture cible

```
                │ Candidat                │ Recruteur              │ Système        │
────────────────┼─────────────────────────┼────────────────────────┼────────────────┤
T1 (Manuel)     │ [MCT 1a miniature]      │                        │                │
                │ evt déclencheur ici →    │                        │                │
────────────────┼─────────────────────────┼────────────────────────┼────────────────┤
T2 (Manuel int.)│ [MCT 1b miniature]      │                        │                │
                │ evt déclencheur ici →    │                        │                │
────────────────┼─────────────────────────┼────────────────────────┼────────────────┤
T3 (Semi-auto)  │                         │ [MCT 2 miniature]      │                │
                │                         │ evt déclencheur ici →   │                │
────────────────┼─────────────────────────┼────────────────────────┼────────────────┤
T4 (Manuel)     │                         │ [MCT 3a miniature]     │                │
                │                         │ evt déclencheur ici →   │                │
────────────────┼─────────────────────────┼────────────────────────┼────────────────┤
T5 (Manuel)     │                         │ [MCT 3b miniature]     │                │
                │                         │ evt déclencheur ici →   │                │
────────────────┼─────────────────────────┼────────────────────────┼────────────────┤
T6 (Auto)       │                         │                        │ [MCT 3c mini]  │
                │                         │                        │ evt déclencheur│
```

Chaque cellule contient un **mini-MCT** rendu en CSS :
- Événements (violet) → Sync (rose) → Opération (vert) → Résultats (vert/rouge)
- L'événement déclencheur est mis en évidence, les autres events sont en opacity réduite

---

### Phase 1 — Types et structure de données

**Objectif** : Définir le modèle TypeScript sans rien casser.

**Fichier** : `src/types/index.ts`

- Ajouter `'mot-matrix'` à `ProcessVariant`
- Créer l'interface `MotTreatmentData` :
  ```ts
  interface MotTreatmentData {
    id: string                    // T1, T2, ...
    label: string                 // Nom du traitement
    nature: string                // Manuel, Automatique, ...
    actor: string                 // Colonne d'acteur (Candidat, Recruteur, Système)
    triggeringEvent: string       // Label de l'event déclencheur
    mctEvents: string[]           // Tous les events du MCT
    mctSync: string               // Label du sync (ou vide)
    mctOperation: { label: string, items: string[], rules: string[] }
    mctResults: Array<{ label: string, rule: string, fail?: boolean }>
  }
  ```
- Ajouter `motMatrix?: { columns: string[], treatments: MotTreatmentData[] }` à `EntityNodeData`

**Validation** : `npx vite build` passe sans erreur.

---

### Phase 2 — Composant MotMctCell (mini-MCT en CSS)

**Objectif** : Créer le composant qui rend UN mini-MCT dans une cellule.

**Fichier** : `src/components/Nodes/ProcessNode.tsx`

- Créer `MotMctCell` : reçoit un `MotTreatmentData` et le nom de la colonne acteur
- Rendu vertical simplifié :
  - Events violets empilés (non-déclencheurs en opacity réduite, déclencheur en pleine opacité)
  - Sync rose (rectangle rose)
  - Opération verte (header + items + rules)
  - Résultats vert/rouge empilés
- Les éléments sont reliés par des bordures CSS ou SVG interne
- **Pas de edges ReactFlow** — tout est CSS/SVG interne au composant

**Validation** : Le composant se rend correctement avec des données de test.

---

### Phase 3 — Composant MotMatrix (grille acteurs × traitements)

**Objectif** : Créer la matrice complète.

**Fichier** : `src/components/Nodes/ProcessNode.tsx`

- Créer `MotMatrix` : reçoit `motMatrix` depuis `EntityNodeData`
- Grille CSS :
  - Colonne 1 : labels des traitements (T1-T6) + nature
  - Colonnes 2-N : un acteur chacun (Candidat, Recruteur, Système)
  - Chaque cellule contient un `MotMctCell` si l'acteur correspond au traitement
  - Cellules vides si l'acteur ne participe pas au traitement
- En-têtes de colonnes avec nom d'acteur
- Lignes de séparation horizontales
- Bordure et header global du MOT

**Validation** : La matrice s'affiche correctement avec les 6 traitements et 3 colonnes.

---

### Phase 4 — Données du diagramme MOT

**Objectif** : Peupler le diagramme avec les vraies données MCT.

**Fichier** : `src/diagrams/mot/mot_organisationnel.ts`

- Un seul noeud `mot-matrix` avec `motMatrix` contenant :
  - `columns`: `['Candidat', 'Recruteur', 'Système']`
  - `treatments`: 6 objets `MotTreatmentData` (T1-T6) avec les données extraites des MCT existants
- Chaque traitement référence ses events, sync, operation, results
- `edges: []`
- Position : `{ x: 50, y: 50 }`

**Validation** : Le diagramme MOT affiche la matrice complète avec tous les mini-MCTs.

---

### Phase 5 — Nettoyage et intégration

**Objectif** : Finaliser.

- Supprimer l'ancien variant `mot-table` de `ProcessNode.tsx` et `types/index.ts`
- Supprimer `motTreatments` de `EntityNodeData` (remplacé par `motMatrix`)
- Mettre à jour `MOT.md` avec le plan final
- Build final : `npx vite build`
- Vérifier que la sidebar MOT fonctionne

**Validation** : Build propre, MOT accessible via sidebar, rendu correct.

---

### Fichiers concernés

| Fichier | Modifications |
|---------|--------------|
| `src/types/index.ts` | Ajout `mot-matrix`, `MotTreatmentData`, `motMatrix` |
| `src/components/Nodes/ProcessNode.tsx` | Ajout `MotMctCell`, `MotMatrix`, suppression `MotTable` |
| `src/diagrams/mot/mot_organisationnel.ts` | Noeud `mot-matrix` avec données complètes |
| `src/components/Sidebar.tsx` | Aucun changement (déjà configuré) |
| `src/diagrams/index.ts` | Aucun changement (déjà enregistré) |
