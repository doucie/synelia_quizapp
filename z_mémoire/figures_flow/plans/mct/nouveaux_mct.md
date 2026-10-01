# Plan — Nouveaux MCT & conventions Merise

Réécriture des MCT avec des conventions Merise corrigées.
Les anciennes figures sont conservées telles quelles dans `src/diagrams/traitements/`.

---

## Contexte & versions

**Ce fichier est la source de vérité** pour les MCT : conventions Merise
corrigées + parcours en **9 traitements (T0–T8)**.

| Version | Fichiers | État |
|---------|----------|------|
| **MCT v1** | `src/diagrams/traitements/mct_*.ts` | Conservés tels quels à titre de référence |
| **MCT v2** | `src/diagrams/archive/mct_[0-8]_*.ts` | **9 fichiers (T0–T8)** — aligné sur ce plan (2026-10-01), `category: 'archive'` |

### Écart plan ↔ code — résolu le 2026-10-01

Le plan détaillait 9 traitements alors que les fichiers v2 n'en comptaient que 7
(l'entretien regroupé). **L'écart est clos** : les 9 traitements existent, la
planification (T3) et la conduite de l'entretien (T4) — absentes du code — ont été
créées, et les 4 restantes renumérotées. Détails, y compris les libellés corrigés
selon ce plan : `plans/implementations/20261001_mct_t0_t8_alignment.md`.

Les figures lues ne sont pas les 9 fichiers individuels, mais les **4 figures de
parcours** qui les assemblent : `mct-v2-parcours-1` (T0–T2), `-2` (T3–T5),
`-3` (T6–T7), `-4` (T8).

### MOT

- **MOT v1** (`src/diagrams/mot/mot_organisationnel.ts`) : ne sert à rien → **à supprimer**
- **MOT v2** (`src/diagrams/mot/mot_organisationnel_v2.ts`) : **à garder** (matrice basée sur les MCT v1)
- **MOT v3** : **à créer** — les MCT v2 seront intégrés dans ce **nouveau MOT v3**, pas dans le MOT v2. **Non fait** : le MOT v2 continue d'importer les MCT d'archive v1 (reporté)

---

## Problèmes identifiés sur les anciens MCT

| Aspect | Ancien (erroné) | Correct Merise |
|--------|-----------------|----------------|
| **Événements** | Conditions (`Campagne ouverte`, `Email vérifié`) | Déclencheurs métier réels |
| **Sync shape** | Trapèze `polygon(0 0, 100% 0, 92% 100%, 8% 100%)` | Pentagone `polygon(0% 0%, 100% 0%, 100% 50%, 50% 100%, 0% 50%)` |
| **Sync usage** | Toujours `ET` même avec 1 seul événement | Supprimée si 1 événement |
| **Items opération** | Actions IHM / techniques (`Enregistrer`, `Saisir`) | Règles de gestion métier uniquement |
| **Résultats** | Incluent des erreurs IHM (`Lien invalide`) | Résultats métier uniquement (erreurs IHM pré-filtrées) |

---

## Conventions Merise appliquées

### Événements
Un événement est un **déclencheur métier réel** : un fait qui se produit dans le système ou par un acteur externe. Les conditions techniques (ex: *quota non atteint*, *lien valide*) ne sont pas des événements — elles sont évaluées dans les règles d'émission de l'opération.

### Synchronisation (sync)
La synchronisation combine les événements avant de déclencher une opération.

- **ET** : tous les événements sont requis (cas standard)
- **OU** : au moins un des événements suffit
- **Fonction logique** : combinaison comme `(A ou B) et C` — le pentagone affiche toujours `ET`/`OU` mais la règle combinée est documentée dans le diagramme

En deçà de 2 événements, le pentagone est affiché **vide** (sans label) — l'événement unique déclenche directement l'opération.

### Notation `event-result-T*`
Liaison entre traitements : un résultat de T*n* est aussi un événement déclencheur pour T*n+1*. Utilisée uniquement quand les deux traitements sont dans la **même figure** (MOT, diagramme combiné). Si les MCT sont isolés, cette notation est ignorée.

**Rendu réel** : l'arête arrive sur la **synchronisation** de T*n+1*, pas sur un nœud d'événement. Le résultat n'est donc pas redessiné comme événement du traitement suivant, qui ne porte que ses propres événements (`event:`). Conséquence : une seule ligne `event:` par traitement, et **toutes les synchronisations sont vides**.

### Règles d'émission (`rules`)
Séparées par ` / `, chaque valeur correspond à une branche de sortie de l'opération. `Toujours` pour une branche unique inconditionnelle.

### Items d'opération
Actions **métier** uniquement (règles de gestion), pas d'actions IHM ou techniques.

---

### Raccourcissement des libellés

Quand un libellé de ce plan est trop long pour la carte, il est **raccourci seulement s'il garde
le même sens**, et les parenthèses techniques (`(profil créateur)`, `(quota non atteint)`,
`(RET)`…) sont retirées. Le plan reste la référence du **sens**, pas forcément de la chaîne
exacte.

---

## Parcours recrutement — vue métier

Le système gère le cycle de vie d'une candidature à travers 9 traitements, du besoin de recrutement jusqu'à la décision finale :

| Traitement | Acteur | Objectif |
|------------|--------|----------|
| **T0** — Créer la campagne | Recruteur | Initialiser une campagne de recrutement avec ses dates, modèle de pipeline et droits d'accès |
| **T1** — Candidature | Candidat | Déposer sa candidature (formulaire + CV) ; le système vérifie l'éligibilité et les quotas |
| **T2** — Quiz | Candidat | Passer le quiz en ligne ; le système calcule le score et applique les règles de sélection |
| **T3** — Planification | Recruteur | Planifier un créneau d'entretien |
| **T4** — Conduite | Recruteur | Vérifier la présence du candidat et démarrer l'entretien |
| **T5** — Évaluation | Recruteur | Consolider les évaluations et valider l'entretien |
| **T6** — Décision | Recruteur | Prendre la décision finale (retenu, en attente, refusé) |
| **T7** — Annulation | Recruteur | Annuler une décision antérieure si les conditions le permettent |
| **T8** — Audit | Système | Journaliser chaque opération métier pour traçabilité |

T0, T7 et T8 sont **transverses** : T0 ouvre le processus, T7 permet de revenir en arrière, T8 s'exécute sur toute opération métier.

---

## Corrections à appliquer

### 1. Sync shape dans `ProcessNode.tsx` (lignes 57-60)

Remplacer le clip-path trapèze par un pentagone :

```tsx
clipPath: 'polygon(0% 0%, 100% 0%, 100% 50%, 50% 100%, 0% 50%)',
```

### 2. MotSync (mini sync dans le MOT) — même correction

Lignes 243-245 :

```tsx
clipPath: 'polygon(0% 0%, 100% 0%, 100% 50%, 50% 100%, 0% 50%)',
```

---

## Nouveaux MCTs

### T0 — Créer la campagne

```markdown
event: Besoin d'un nouveau recrutement
sync: (pentagone vide)
operation: Initialiser et ouvrir la campagne
items:
  1. Vérifier la cohérence des dates de campagne
  2. Attribuer les droits d'accès par défaut
rules: Toujours
results: Campagne ouverte
```

### T1 — Candidature

```markdown
event-result-T0: Campagne ouverte
event: Formulaire envoyé
sync: ET
operation: Vérifier la recevabilité de la candidature
items:
  1. Vérifier l'éligibilité du candidat
  2. Valider la disponibilité des places
rules: Éligible ET Quota OK / Non éligible OU Quota atteint
results: Candidat accepté pour quiz / Candidature rejetée
```

### T2 — Quiz

```markdown
event result-T1: Candidat accepté pour quiz
event: Quiz soumis par le candidat
sync: ET
operation: Corriger le quiz
items:
  1. Calculer le score
  2. Appliquer les règles de sélection
rules: Score ≥ seuil / Score < seuil
results: Quiz validé / Quiz échoué
```

### T3 — Planification de l'entretien

```markdown
event-result-T2: Quiz validé
event: Candidat accepté pour l'évaluation
sync: ET
operation: Planifier l'entretien
items:
  1. Bloquer le créneau dans l'agenda
  2. Envoyer l'invitation au candidat et aux recruteurs concernés
rules: Toujours
results: Entretien planifié
```

### T4 — Conduire l'entretien

```markdown
event-result-T3: Entretien planifié
event: Date et heure de l'entretien atteintes
sync: ET
operation: Conduire l'entretien
items:
  1. Vérifier la présence du candidat
  2. Notifier les participants
rules: Candidat présent / Candidat absent / Report demandé
results: Entretien en cours / Entretien annulé / Entretien reporté
```

### T5 — Évaluation

```markdown
event-result-T4: Entretien en cours
event: Fiches d'évaluation renseignées
sync: ET
operation: Synthétiser le bilan de l'entretien
items:
  1. Consolider les évaluations
  2. Appliquer les critères de validation
rules: Favorable / Insuffisant
results: Entretien validé / Entretien refusé
```

### T6 — Décision

Seul traitement **sans ligne `event:`** : son unique déclencheur est le résultat
de T5. Aucune arête entrante n'est dessinée dans sa figure isolée.

```markdown
event-result-T5: Entretien validé
sync: (pentagone vide)
operation: Valider la décision
items:
  1. Appliquer la règle de décision
rules: Favorable / En attente / Défavorable
results: Candidat retenu (RET) / Candidat en attente (ATT) / Candidat refusé (REF)
```

### T7 — Annulation

```markdown
event-result-T6: Candidat retenu (RET)
event-result-T6: Candidat en attente (ATT)
event-result-T6: Candidat refusé (REF)
event: Demande d'annulation (DA)
sync: (RET ou ATT ou REF) et DA
operation: Traiter l'annulation
items:
  1. Vérifier l'éligibilité à l'annulation
rules: Autorisée / Refusée
results: Décision annulée / Décision maintenue
```

Les 3 `event-result-T6` arrivent sur la synchronisation de T7 ; les parenthèses
`(RET)`, `(ATT)`, `(REF)` ne sont pas écrites dans les résultats ni les événements.

### T8 — Audit

```markdown
event: Opération métier réalisée
sync: (pentagone vide)
operation: Journaliser l'audit
items:
  1. Enregistrer la trace d'audit
rules: Toujours
results: Trace enregistrée
```

L'audit est transverse : il n'a **aucun lien entrant ni sortant** dans le plan, et
reste donc seul sur `mct-v2-parcours-4`, hors de la chaîne T0–T7.

---

## Fichiers — état réel au 2026-10-01

### Existants (`src/diagrams/archive/`, `category: 'archive'`)

- `mct_0_creation_campagne.ts` · `mct_1_candidature.ts` · `mct_2_quiz.ts`
- `mct_3_planification.ts` · `mct_4_conduite_entretien.ts` · `mct_5_evaluation.ts`
- `mct_6_decision.ts` · `mct_7_annulation.ts` · `mct_8_audit.ts`

Les noms correspondent au plan. Le dossier n'est plus `traitements/v2/` : les 9
figures ne sont plus lues isolément mais restent la source unique du modèle
assemblé par `src/diagrams/traitements/v2/mct_combine.ts`.

### Correction appliquée

- `src/components/Nodes/ProcessNode.tsx` — clip-path sync (pentagone) ✓

---

## Ordre d'implémentation

1. Correction du clip-path sync dans `ProcessNode.tsx` (pentagone) ✓
2. Nouveaux MCTs (T0 à T8) — un fichier par MCT ✓
3. Mise à jour du registre `src/diagrams/index.ts` ✓
4. Nouveau MOT v3 basé sur les MCTs v2 — **reporté**
