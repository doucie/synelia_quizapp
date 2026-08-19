# Audit MCD — Infractions aux règles Merise

> Date : 2026-08-19
> Périmètre : les 6 diagrammes MCD du domaine `nouveau/mcd/`
> Référence : `plans/rules/regles_mcd.md`

---

## Règle 4 — Associations

### Nom d'association dupliqué

| Association | Domaine 1 | Domaine 2 |
|-------------|-----------|-----------|
| `utiliser` | CAMPAGNE → MODELE_PIPELINE | JOURNAL_EMAIL → MODELE_EMAIL |

Deux associations portant le même verbe mais des significations différentes. En Merise, le nom d'association doit être unique dans tout le MCD.

**Correction proposée :** renommer l'association dans Communication en `exploiter` ou `s'appuyer_sur`.

---

## Règle 5 — Cardinalités

### Cardinalité syntaxiquement invalide

| Edge | Source | Target | cardFrom | cardTo | Problème |
|------|--------|--------|----------|--------|----------|
| `e-evaluer` | ITEM_EVALUATION | GRILLE_MODELE | `n,1` | `1,1` | `n,1` n'est pas une cardinalité valide en Merise (min ≤ max toujours) |

**Correction proposée :** inverser les cardinalités : ITEM_EVALUATION `(1,1)` — GRILLE_MODELE `(0,n)`. Chaque item évalue exactement 1 grille ; une grille contient 0 ou plusieurs items.

---

## Règle 8 — Cohérence globale

### Entités isolées (pas d'association)

**Communication** — 3 entités sans edge :

| Entité | Correction proposée |
|--------|---------------------|
| `NOTIFICATION` | Relier à `UTILISATEUR` : un UTILISATEUR reçoit 0,n NOTIFICATION |
| `TOKEN_VERIFICATION_EMAIL` | Relier à `CANDIDATURE` : une CANDIDATURE génère 0,n TOKEN_VERIFICATION_EMAIL |
| `TEXTE_JURIDIQUE` | Relier à `CONFIGURATION` : une CONFIGURATION propose 0,n TEXTE_JURIDIQUE |

**Config système** — 3 entités sans edge :

| Entité | Correction proposée |
|--------|---------------------|
| `CONFIGURATION` | Relier à `CONFIG_SMTP` : une CONFIGURATION utilise 0,1 CONFIG_SMTP |
| `CONFIG_SMTP` | (cf. ci-dessus) |
| `EVENEMENT_AUDIT` | Relier à `UTILISATEUR` : un UTILISATEUR émet 0,n EVENEMENT_AUDIT |

### Redondance d'attributs

| Entité 1 | Entité 2 | Attributs dupliqués | Justification |
|----------|----------|---------------------|---------------|
| `CANDIDATURE` | `DEMANDE_CANDIDAT` | `email`, `prenom`, `nom` | Pattern snapshot : DEMANDE_CANDIDAT stocke les nouvelles valeurs demandées. Acceptable si justifié métier, mais à documenter dans le mémoire. |

---

## Statut global

| Règle | Statut | Infractions |
|-------|--------|-------------|
| 1. Entités | ✅ | — |
| 2. Attributs | ✅ | — |
| 3. Identifiants | ✅ | — |
| 4. Associations | ⚠️ | 1 nom dupliqué |
| 5. Cardinalités | ⚠️ | 1 cardinalité invalide |
| 6. CIF | ✅ | — |
| 7. Normalisation | ✅ | — |
| 8. Cohérence | ❌ | 6 entités isolées, 1 redondance |

---

## Actions requises

1. **Corriger `e-evaluer`** : inverser les cardinalités ITEM_EVALUATION `(1,1)` ↔ GRILLE_MODELE `(0,n)`
2. **Renommer `utiliser`** dans Communication → `exploiter`
3. **Ajouter 6 edges** pour les entités isolées (NOTIFICATION, TOKEN_VERIFICATION_EMAIL, TEXTE_JURIDIQUE, CONFIGURATION, CONFIG_SMTP, EVENEMENT_AUDIT)
4. **Documenter** la redondance email/prenom dans le mémoire (pattern snapshot justifié)
