# Plan — Correction des infractions MCD

> Ref : `plans/audit/audit_infractions_mcd.md`
> Règles : `plans/rules/regles_mcd.md`

---

## Règle 4 — Associations

### Nom d'association dupliqué

**Où :** `src/diagrams/nouveau/mcd/communication.ts` — edge `e-utiliser`

- [ ] Renommer `utiliser` en `exploiter` dans l'edge `e-utiliser` (JOURNAL_EMAIL → MODELE_EMAIL)
- [ ] Vérifier qu'aucun autre fichier ne référence ce nom d'association

---

## Règle 5 — Cardinalités

### Cardinalité invalide `n,1`

**Où :** `src/diagrams/nouveau/mcd/entretiens_evaluation.ts` — edge `e-evaluer`

- [ ] Corriger les cardinalités : `cardFrom: '1,1'` (ITEM_EVALUATION) → `cardTo: '1,n'` (GRILLE_MODELE)

---

## Règle 8 — Cohérence globale

### Déplacements d'entités

#### NOTIFICATION → `utilisateurs_droits`

**Source :** `src/diagrams/nouveau/mcd/communication.ts`
**Destination :** `src/diagrams/nouveau/mcd/utilisateurs_droits.ts`

- [ ] Supprimer le nœud `notification` de `communication.ts`
- [ ] Ajouter le nœud `notification` dans `utilisateurs_droits.ts`
- [ ] **Supprimer l'attribut `utilisateur`** (clé étrangère interdite en MCD)
- [ ] Ajouter edge `UTILISATEUR` → `NOTIFICATION` : label `recevoir`, cardFrom `1,1`, cardTo `0,n`

#### TOKEN_VERIFICATION_EMAIL → `candidatures_suivi`

**Source :** `src/diagrams/nouveau/mcd/communication.ts`
**Destination :** `src/diagrams/nouveau/mcd/candidatures_suivi.ts`

- [ ] Supprimer le nœud `token_verification_email` de `communication.ts`
- [ ] Ajouter le nœud `token_verification_email` dans `candidatures_suivi.ts`
- [ ] **Supprimer l'attribut `email`** (déjà présent dans CANDIDATURE)
- [ ] Ajouter edge `CANDIDATURE` → `TOKEN_VERIFICATION_EMAIL` : label `generer`, cardFrom `1,1`, cardTo `0,n`

#### TEXTE_JURIDIQUE → `config_systeme`

**Source :** `src/diagrams/nouveau/mcd/communication.ts`
**Destination :** `src/diagrams/nouveau/mcd/config_systeme.ts`

- [ ] Supprimer le nœud `texte_juridique` de `communication.ts`
- [ ] Ajouter le nœud `texte_juridique` dans `config_systeme.ts`
- [ ] Ajouter edge `CONFIGURATION` → `TEXTE_JURIDIQUE` : label `proposer`, cardFrom `1,1`, cardTo `0,n`

#### EVENEMENT_AUDIT → `utilisateurs_droits`

**Source :** `src/diagrams/nouveau/mcd/config_systeme.ts`
**Destination :** `src/diagrams/nouveau/mcd/utilisateurs_droits.ts`

- [ ] Supprimer le nœud `evenement_audit` de `config_systeme.ts`
- [ ] Ajouter le nœud `evenement_audit` dans `utilisateurs_droits.ts`
- [ ] Ajouter edge `UTILISATEUR` → `EVENEMENT_AUDIT` : label `realiser`, cardFrom `1,1`, cardTo `0,n`

### Edge existant — CONFIGURATION → CONFIGURATION_SMTP

**Où :** `src/diagrams/nouveau/mcd/config_systeme.ts`

- [ ] Renommer l'entité `CONFIG_SMTP` en `CONFIGURATION_SMTP`
- [ ] Mettre à jour l'edge `e-utiliser-smtp` : label `utiliser`, cardFrom `1,1`, cardTo `0,1`

### Renommages d'entités (ordre français, pas d'abbréviations)

**Où :** `src/diagrams/nouveau/mcd/utilisateurs_droits.ts`

- [ ] Renommer `GROUPE_PERMISSION` → `PERMISSION_GROUPE`
- [ ] Renommer `UTILISATEUR_PERMISSION` → `PERMISSION_UTILISATEUR` (supprimé du MCD — voir hors-scope)
- [ ] Mettre à jour les edges correspondants (`e-detenir-perm`, `e-detenir-groupe-perm`)

### Redondance d'attributs

**Où :** `src/diagrams/nouveau/mcd/candidatures_suivi.ts` — `CANDIDATURE` et `DEMANDE_CANDIDAT`

- [x] Documenter dans le mémoire (§méthodologie ou §modélisation) que `DEMANDE_CANDIDAT` porte un snapshot des valeurs demandées (pattern autorisé, pas une redondance structurelle) — à rédiger lors de la rédaction du chapitre 4

---

## Vérification finale

- [ ] `npx vite build` passe sans erreur
- [ ] Toutes les entités des 6 MCD ont au moins 1 edge
- [ ] Aucune cardinalité ne contient `n,1` ou autre notation invalide
- [ ] Aucun nom d'association n'est dupliqué entre domaines
- [ ] Les MLD correspondants sont mis à jour (ajout/suppression de colonnes FK)
