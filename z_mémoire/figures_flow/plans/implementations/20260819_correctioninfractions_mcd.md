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

- [ ] Inverser les cardinalités : `cardFrom: '1,1'` (ITEM_EVALUATION) → `cardTo: '0,n'` (GRILLE_MODELE)
- [ ] Vérifier que l'edge est bien orienté ITEM_EVALUATION → GRILLE_MODELE

---

## Règle 8 — Cohérence globale

### Entités isolées — Communication (3 entités)

**Où :** `src/diagrams/nouveau/mcd/communication.ts`

- [ ] Ajouter edge `NOTIFICATION` → `UTILISATEUR` : label `recevoir`, cardFrom `0,n`, cardTo `1,1`
- [ ] Ajouter edge `TOKEN_VERIFICATION_EMAIL` → `CANDIDATURE` : label `generer`, cardFrom `0,n`, cardTo `1,1`
- [ ] Ajouter edge `TEXTE_JURIDIQUE` → `CONFIGURATION` : label `proposer`, cardFrom `0,n`, cardTo `1,1`

> Note : ces edges pointent vers des entités d'autres domaines (UTILISATEUR, CANDIDATURE, CONFIGURATION). Au MCD c'est acceptable — les liaisons cross-domaines seront résolues au MLD/MPD par les FK.

### Entités isolées — Config système (3 entités)

**Où :** `src/diagrams/nouveau/mcd/config_systeme.ts`

- [ ] Ajouter edge `CONFIGURATION` → `CONFIG_SMTP` : label `utiliser`, cardFrom `1,1`, cardTo `0,1`
- [ ] Ajouter edge `EVENEMENT_AUDIT` → `UTILISATEUR` : label `realiser`, cardFrom `0,n`, cardTo `1,1`

### Redondance d'attributs

**Où :** `src/diagrams/nouveau/mcd/candidatures_suivi.ts` — `CANDIDATURE` et `DEMANDE_CANDIDAT`

- [ ] Documenter dans le mémoire (§méthodologie ou §modélisation) que `DEMANDE_CANDIDAT` porte un snapshot des valeurs demandées (pattern autorisé, pas une redondance structurelle)
- [ ] Si le snapshot n'est pas nécessaire : supprimer `prenom`, `nom`, `email` de `DEMANDE_CANDIDAT` et ne garder que `nouvel_email`, `nouveau_telephone`

---

## Vérification finale

- [ ] `npx vite build` passe sans erreur
- [ ] Toutes les entités des 6 MCD ont au moins 1 edge
- [ ] Aucune cardinalité ne contient `n,1` ou autre notation invalide
- [ ] Aucun nom d'association n'est dupliqué entre domaines
