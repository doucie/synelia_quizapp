# Campaign Form Coexistence Checklist

## Objectif

Fournir une check-list executable avant la suppression de `form.campaign_id`, puis un plan de rollback tant que la colonne legacy reste presente.

Regle de verite actuelle:

- `campaign_form` est la source de verite
- `form.campaign_id` est une projection de compatibilite
- projection attendue:
  - `0` lien actif => `form.campaign_id = null`
  - `1` lien actif => `form.campaign_id = campaign_id`
  - `n > 1` liens actifs => `form.campaign_id = null`

## Checklist avant suppression de `form.campaign_id`

### 1. Integrite SQL minimale

Verifier qu'il ne reste aucun lien actif sans ordre d'affectation:

```sql
SELECT COUNT(*) AS active_links_without_order
FROM campaign_form cf
WHERE cf.is_deleted = 0
  AND cf.assignment_order IS NULL;
```

Verifier qu'il ne reste aucun lien actif orphelin vers un formulaire ou une campagne supprimes:

```sql
SELECT COUNT(*) AS orphan_active_links
FROM campaign_form cf
LEFT JOIN form f
  ON f.id = cf.form_id
 AND f.is_deleted = 0
LEFT JOIN campaigns c
  ON c.id = cf.campaign_id
 AND c.is_deleted = 0
WHERE cf.is_deleted = 0
  AND (f.id IS NULL OR c.id IS NULL);
```

Verifier que la projection legacy est coherente avec les liens actifs:

```sql
SELECT
    f.id,
    f.campaign_id AS legacy_campaign_id,
    COUNT(DISTINCT cf.campaign_id) AS active_campaign_count,
    MIN(cf.campaign_id) AS single_active_campaign_id
FROM form f
LEFT JOIN campaign_form cf
  ON cf.form_id = f.id
 AND cf.is_deleted = 0
WHERE f.is_deleted = 0
GROUP BY f.id, f.campaign_id
HAVING NOT (
    (COUNT(DISTINCT cf.campaign_id) = 0 AND f.campaign_id IS NULL)
 OR (COUNT(DISTINCT cf.campaign_id) = 1 AND f.campaign_id = MIN(cf.campaign_id))
 OR (COUNT(DISTINCT cf.campaign_id) > 1 AND f.campaign_id IS NULL)
);
```

Verifier qu'aucun formulaire actif n'est visible uniquement via la colonne legacy:

```sql
SELECT f.id, f.form_name, f.campaign_id
FROM form f
WHERE f.is_deleted = 0
  AND f.campaign_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM campaign_form cf
      WHERE cf.form_id = f.id
        AND cf.is_deleted = 0
  );
```

### 2. Validation applicative minimale

Les suites suivantes doivent rester vertes au moment de retirer la colonne legacy des lectures metier:

- `quizapp/src/test/java/tech/synelia/quizapp/business/FormBusinessTest.java`
- `quizapp/src/test/java/tech/synelia/quizapp/business/CampaignFormBusinessTest.java`
- `quizapp/src/test/java/tech/synelia/quizapp/business/ApplicationsBusinessTest.java`
- `quizapp/src/test/java/tech/synelia/quizapp/business/CampaignsBusinessTest.java`
- `quizapp/src/test/java/tech/synelia/quizapp/business/SourceTokenBusinessTest.java`
- `quizapp/src/test/java/tech/synelia/quizapp/rest/api/DashboardControllerTest.java`
- `quizapp_front/src/app/pages/dashboard/forms/forms.spec.ts`
- `quizapp_front/src/app/pages/dashboard/campaign-form/campaign-form.spec.ts`

### 3. Parcours metier a rejouer

Verifier manuellement ou par smoke test:

- creation d'un formulaire sans campagne initiale
- rattachement d'un meme formulaire a plusieurs campagnes via `campaign_form`
- duplication explicite d'un `Form` pour une campagne cible
- publication d'une campagne avec formulaires portes uniquement par `campaign_form`
- suppression d'une campagne avec simple detachement de liens actifs
- refus de suppression d'une campagne avec `interviews`, historique applicatif ou `source_token`
- creation et mise a jour d'un `source_token` sur un formulaire partage
- affectation `SEQUENTIAL` respectant `campaign_form.assignment_order`

### 4. Conditions de sortie

La suppression de `form.campaign_id` ne doit etre engagee que si:

- les requetes SQL ci-dessus retournent `0` ligne anormale
- les tests backend/frontend cibles sont verts
- aucun ecran admin ou public ne depend encore d'une lecture directe `form.campaign_id`
- la migration de suppression de colonne est separee de la migration de backfill/reconciliation

## Plan de rollback tant que `form.campaign_id` existe encore

### 1. Revenir a une version applicative compatible coexistence

- redeployer la version backend/frontend precedente qui tolere encore la projection legacy
- ne pas supprimer les lignes `campaign_form`; elles restent la verite metier

### 2. Reprojeter la colonne legacy depuis `campaign_form`

- rerun de `V1_055__reconcile_campaign_form_backfill_and_legacy_projection.sql` ou execution manuelle equivalente
- objectif: reconstruire `form.campaign_id` a partir des liens actifs apres rollback applicatif

### 3. Revalider la coherence apres rollback

- rejouer les requetes SQL de la section "Integrite SQL minimale"
- verifier que les parcours admin/public critiques refonctionnent en lecture mixte

### 4. Reprendre l'investigation avant nouvelle tentative

- identifier la couche qui lisait encore `form.campaign_id`
- corriger ou migrer cette lecture
- relancer la checklist complete avant toute nouvelle suppression de colonne