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
| **MCT v2** | `src/diagrams/archive/mct_[0-8]_*.ts` | **9 fichiers (T0–T8)** — aligné sur ce plan (2026-10-02), `category: 'archive'` |

### Écart plan ↔ code — résolu les 2026-10-01 et 2026-10-02

Le plan détaillait 9 traitements alors que les fichiers v2 n'en comptaient que 7
(l'entretien regroupé). **L'écart est clos** : les 9 traitements existent, la
planification (T3) et la conduite de l'entretien (T4) — absentes du code — ont été
créées, et les 4 restantes renumérotées. Détails, y compris les libellés corrigés
selon ce plan : `plans/implementations/20261001_mct_t0_t8_alignment.md`.

Poussé plus loin le 2026-10-02 sur cinq traitements (T0, T3, T4, T6, T7) : item pipeline
de T0 réécrit, branches de T3, report de T4 non automatique, T6 doté d'un événement et
d'une décision binaire, T7 en `(RET OU REF)`. Voir
`plans/implementations/20261002_mct_ajustements_t0_t3_t4_t6_t7.md`.

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
- **Fonction logique** : combinaison comme `(A ou B) et C` — la formule est écrite en entier sur le pentagone (voir T7)

En deçà de 2 événements, le pentagone est affiché **vide** (sans label) — l'événement unique déclenche directement l'opération. Un `event-result` **compte** comme un événement : il n'est pas redessiné comme nœud, mais il arrive bien sur la synchronisation. Le libellé décrit donc les flèches **réellement dessinées**, pas la logique abstraite.

### Notation `event-result-T*`
Liaison entre traitements : un résultat de T*n* est aussi un événement déclencheur pour T*n+1*. Utilisée uniquement quand les deux traitements sont dans la **même figure** (MOT, diagramme combiné). Si les MCT sont isolés, cette notation est ignorée.

**Rendu réel** : l'arête arrive sur la **synchronisation** de T*n+1*, pas sur un nœud d'événement. Le résultat n'est donc pas redessiné comme événement du traitement suivant, qui ne porte que ses propres événements (`event:`) — une seule ligne `event:` par traitement. En revanche la synchronisation **reçoit** cette flèche, donc son `sync:` est écrit : voir T1–T5 (`ET`) et T7 (formule complète). T3 et T6 font exception sur les figures de parcours, où la couture entre les deux traitements n'est pas représentée : une seule flèche y est visible, donc leur pentagone reste vide.

### Règles d'émission (`rules`)
Séparées par ` / `, chaque valeur correspond à une branche de sortie de l'opération. `Toujours` pour une branche unique inconditionnelle.

### Items d'opération
Actions **métier** uniquement (règles de gestion), pas d'actions IHM ou techniques.

---

### Raccourcissement des libellés

Quand un libellé de ce plan est trop long pour la carte, il est **raccourci seulement s'il garde
le même sens**, et les parenthèses techniques (`(profil créateur)`, `(quota non atteint)`) sont
retirées. Le plan reste la référence du **sens**, pas forcément de la chaîne exacte.

**Exception — les sigles de résultat.** Les sigles `(RET)` et `(REF)` sont *conservés* dans les
résultats de T6 : ce sont eux que la formule de synchronisation de T7 réutilise, donc les retirer
laisserait `(RET OU REF) ET DA` sans référent lisible sur la figure.

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
| **T6** — Décision | Recruteur | Prendre la décision finale (retenu ou refusé) |
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

Les trois pentagones doivent laisser la place au texte dans cette bande : `pt-3 pb-7` pour
`MctSyncop` et `MctSync` (12 px), `pt-1 pb-4` pour `MotSync` (8 px). La règle qui donne ces
valeurs est `paddingBottom ≥ paddingTop + 2 × encre − lineBox` — à 12 px : 12 + 2 × 16.8 − 18
≈ 27.6 px, donc 28. La correction est **en hauteur**, pas en largeur : les conteneurs restent en
`items-center` et le pentagone garde le `fit-content` de son libellé, ce qui est la convention
Merise.

Deux remèdes ont été tentés et revertés : `items-stretch` (élargir le pentagone à la largeur de
l'opération — la largeur n'a aucune prise sur un rognage calculé en % de hauteur) et
`pt-3 pb-[18px]` (+6 px, la coupe en bande persistait). Ne pas y revenir.

Le libellé de T7, `(RET OU REF) ET DA`, est le seul assez long pour déformer le gabarit : à
12 px il ferait un pentagone de 162 px de large sous une opération de 280 px. Il porte donc
`syncFontSize: 9`, champ optionnel de `EntityNodeData` lu uniquement par `MctSyncop` et composé
avec le curseur global. C'est un réglage **typographique**, indépendant du padding.

Puisque `MctSyncop` fusionne le pentagone et l'opération dans un même nœud, ses 10 px se
retranchent sur l'écart vers les résultats : les résultats des 9 traitements passent à
`y: 450`. L'événement (`y: 20`) et l'opération (`y: 200`) ne bougent pas.

`MctSync` est un nœud autonome suivi 68–110 px plus bas par l'opération : rien à reprendre dans
les MCT legacy — sauf `motOrganisationnelV2`, qui réutilise ces figures en positions absolues
avec des `rowHeights` réglables (400 px par défaut alors qu'un traitement legacy mesure ~510 px),
et dont les 7 traitements gagnent 10 px chacun. `MotSync` est du code mort : `motMatrix` n'est
fourni par aucune figure enregistrée.

---

## Nouveaux MCTs

### T0 — Créer la campagne

```markdown
event: Besoin d'un nouveau recrutement
sync: (pentagone vide)
operation: Initialiser et ouvrir la campagne
items:
  1. Vérifier la cohérence des dates de campagne
  2. Vérifier la disponibilité du modèle de pipeline retenu
  3. Attribuer les droits d'accès par défaut
rules: Toujours
results: Campagne ouverte
```

L'item sur le pipeline est une règle de gestion réelle, mais pas une règle d'**adéquation** : le
modèle de pipeline retenu doit simplement **exister et être actif**, à défaut de quoi le système
reprend le modèle par défaut (`CampaignsBusiness.create`, contrôle du `pipeline_template_id`).

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
event-result-T1: Candidat accepté pour quiz
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
event: Candidat accepté pour l'entretien
sync: ET
operation: Planifier l'entretien
items:
  1. Bloquer le créneau dans l'agenda
  2. Envoyer l'invitation au candidat et aux recruteurs concernés
rules: Créneau confirmé / Report demandé
results: Entretien planifié / Demande de report transmise
```

Le créneau peut être refusé, ou sa date remise en cause : dans les deux cas la planification
n'aboutit pas et la demande remonte. Une seule branche « report demandé » couvre les deux cas,
et son résultat dit la même chose que celui de T4 — le report est **transmis**, jamais accordé
automatiquement. Les résultats sont terminaux : ils ne rebouclent pas sur l'opération.

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
results: Entretien en cours / Entretien annulé / Demande de report transmise
```

Un report demandé n'est pas accepté sur le moment : la demande est transmise et la décision
d'en faire ou non un nouveau créneau revient au responsable. Le résultat dit donc la
transmission, pas le report acquis.

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

Le traitement a désormais **son propre événement déclencheur** : la décision ne se prend pas
toute seule à l'issue de T5, le recruteur la provoque. Aucun `event-result-T5` n'est redessiné
comme événement ; le résultat de T5 reste le lien entre les deux traitements, sur la
synchronisation.

```markdown
event-result-T5: Entretien validé
event: Prise de décision
sync: ET
operation: Valider la décision
items:
  1. Appliquer la règle de décision
rules: Favorable / Défavorable
results: Candidat retenu (RET) / Candidat refusé (REF)
```

Il n'y a **pas de mise en attente** : la décision est binaire. C'est ce qui permet à T7 de
formuler sa synchronisation en deux termes.

### T7 — Annulation

```markdown
event-result-T6: Candidat retenu (RET)
event-result-T6: Candidat refusé (REF)
event: Demande d'annulation (DA)
sync: (RET ou REF) et DA
operation: Traiter l'annulation
items:
  1. Vérifier l'éligibilité à l'annulation
rules: Autorisée / Refusée
results: Décision annulée / Décision maintenue
```

Les 2 `event-result-T6` arrivent sur la synchronisation de T7 ; la formule reprend les sigles
écrits dans les résultats de T6, qui doivent donc rester visibles sur la figure.

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

## Fichiers — état réel au 2026-10-02

### Existants (`src/diagrams/archive/`, `category: 'archive'`)

- `mct_0_creation_campagne.ts` · `mct_1_candidature.ts` · `mct_2_quiz.ts`
- `mct_3_planification.ts` · `mct_4_conduite_entretien.ts` · `mct_5_evaluation.ts`
- `mct_6_decision.ts` · `mct_7_annulation.ts` · `mct_8_audit.ts`

Les noms correspondent au plan. Le dossier n'est plus `traitements/v2/` : les 9
figures ne sont plus lues isolément mais restent la source unique du modèle
assemblé par `src/diagrams/traitements/v2/mct_combine.ts`.

### Corrections appliquées

- `src/components/Nodes/ProcessNode.tsx` — clip-path sync (pentagone) ✓
- `src/components/Nodes/ProcessNode.tsx` — bande utile réservée en **hauteur** sur les
  trois pentagones (`MctSyncop` / `MctSync` / `MotSync`) : `py-3` → `pt-3 pb-7` pour les
  deux à 12 px, `py-1` → `pt-1 pb-4` pour `MotSync` (8 px). Le clip-path ne réserve le
  rectangle pleine largeur qu'à ses 50 % supérieurs, un libellé long était donc rongé par
  la conique. La correction est en hauteur, pas en largeur : les conteneurs restent en
  `items-center` et le pentagone garde le `fit-content` de son libellé, ce qui est la
  convention Merise ✓
- `src/types/index.ts` — `syncFontSize?: number` sur `EntityNodeData` ✓
- `src/diagrams/archive/mct_7_annulation.ts` — `syncFontSize: 9` sur `mct7-op`, seul
  libellé assez long pour déformer le gabarit ; réglage typographique, indépendant du
  padding ✓
- `src/diagrams/archive/mct_[0-8]_*.ts` — rangée de résultats à `y: 450` dans les 9
  traitements (l'incohérence d'origine entre `420` et `400` disparaît) ; l'événement reste
  à `y: 20` et l'opération à `y: 200` ✓
- T0, T3, T4, T6, T7 — libellés et branches alignés sur ce plan ✓
  (détail : `plans/implementations/20261002_mct_ajustements_t0_t3_t4_t6_t7.md`)

---

## Ordre d'implémentation

1. Correction du clip-path sync dans `ProcessNode.tsx` (pentagone) ✓
2. Nouveaux MCTs (T0 à T8) — un fichier par MCT ✓
3. Mise à jour du registre `src/diagrams/index.ts` ✓
4. Ajustements T0/T3/T4/T6/T7 + hauteur du pentagone ✓
5. Nouveau MOT v3 basé sur les MCTs v2 — **reporté**
