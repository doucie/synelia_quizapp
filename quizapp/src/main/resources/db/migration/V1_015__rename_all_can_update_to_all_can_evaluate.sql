-- Migration pour renommer la colonne all_can_update en all_can_evaluate dans la table campaigns
-- Cette colonne permet de définir si tous les recruteurs peuvent évaluer les candidatures d'une campagne

ALTER TABLE campaigns 
CHANGE COLUMN all_can_update all_can_evaluate BOOLEAN DEFAULT FALSE;

-- Commentaire pour clarifier l'usage de la colonne
ALTER TABLE campaigns 
MODIFY COLUMN all_can_evaluate BOOLEAN DEFAULT FALSE 
COMMENT 'Si TRUE, tous les recruteurs peuvent évaluer les candidatures de cette campagne sans avoir besoin d''être ajoutés explicitement dans campaign_crud';
