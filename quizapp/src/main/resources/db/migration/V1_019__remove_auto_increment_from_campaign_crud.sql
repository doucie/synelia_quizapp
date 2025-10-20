-- Migration pour retirer AUTO_INCREMENT de campaign_crud.id
-- Ceci est nécessaire car nous utilisons maintenant une table de séquence

ALTER TABLE campaign_crud 
MODIFY COLUMN id INT NOT NULL;
