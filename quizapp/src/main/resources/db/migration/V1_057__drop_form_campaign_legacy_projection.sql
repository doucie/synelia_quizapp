-- La relation campagne-form ne vit plus que dans campaign_form.
-- La colonne legacy form.campaign_id n'est plus mappee ni reprojetee par le backend.
ALTER TABLE form
    DROP FOREIGN KEY fk_form_campaign,
    DROP COLUMN campaign_id;