# Plan — Nouveaux MCT & conventions Merise

Réécriture des MCT avec des conventions Merise corrigées.
Les anciennes figures sont conservées telles quelles dans `src/diagrams/traitements/`.

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

```
event: Besoin d'un nouveau recrutement
sync: (pentagone vide)
operation: Initialiser la campagne
items:
  1. Vérifier la cohérence des dates de campagne
  2. Valider l'adéquation avec les modèles de pipeline disponibles
  3. Attribuer les droits d'accès par défaut (profil créateur)
rules: Toujours
results: Campagne initialisée
```

### T1 — Candidature

```
event: Candidature déposée
sync: (pentagone vide)
operation: Vérifier la recevabilité de la candidature
items:
  1. Vérifier l'éligibilité du candidat
  2. Valider la disponibilité des places (quota non atteint)
rules: Éligible ET Quota OK / Non éligible OU Quota atteint
results: Candidat accepté pour l'étape suivante (T1.CAES) / Candidature rejetée
```

### T2 — Quiz

```
event: Candidat accepté pour l'étape suivante (T1.CAES)
event: Quiz soumis par le candidat
sync: ET
operation: Corriger le quiz
items:
  1. Calculer le score
  2. Appliquer les règles de sélection
rules: Score ≥ seuil / Score < seuil
results: Quiz validé / Quiz échoué
```

### T3 — Entretien

```
event: Entretien planifié
event: Évaluations soumises
sync: ET
operation: Évaluer l'entretien
items:
  1. Consolider les évaluations
  2. Appliquer les critères de validation
rules: Favorable / Insuffisant
results: Entretien validé / Entretien refusé
```

### T4 — Décision

```
event: Dossier prêt pour décision
sync: (pentagone vide)
operation: Valider la décision
items:
  1. Appliquer la règle de décision
rules: Favorable / En attente / Défavorable
results: Candidat retenu / Candidat en attente / Candidat refusé
```

### T5 — Annulation

```
event: Demande d'annulation
sync: (pentagone vide)
operation: Traiter l'annulation
items:
  1. Vérifier l'éligibilité à l'annulation
rules: Autorisée / Refusée
results: Décision annulée / Décision maintenue
```

### T6 — Audit

```
event: Opération métier réalisée
sync: (pentagone vide)
operation: Journaliser l'audit
items:
  1. Enregistrer la trace d'audit
rules: Toujours
results: Trace enregistrée
```

---

## Fichiers

### Créer

- `src/diagrams/traitements/v2/mct_0_creation_campagne.ts`
- `src/diagrams/traitements/v2/mct_1_candidature.ts`
- `src/diagrams/traitements/v2/mct_2_quiz.ts`
- `src/diagrams/traitements/v2/mct_3_entretien.ts`
- `src/diagrams/traitements/v2/mct_4_decision.ts`
- `src/diagrams/traitements/v2/mct_5_annulation.ts`
- `src/diagrams/traitements/v2/mct_6_audit.ts`

### Modifier

- `src/components/Nodes/ProcessNode.tsx` — corriger clip-path sync (pentagone)

---

## Ordre d'implémentation

1. Correction du clip-path sync dans `ProcessNode.tsx` (pentagone)
2. Création du dossier `traitements/v2/`
3. Nouveaux MCTs (T0 à T6) — un fichier par MCT
4. Mise à jour du registre `src/diagrams/index.ts`
5. Nouveau MOT basé sur les MCTs v2
