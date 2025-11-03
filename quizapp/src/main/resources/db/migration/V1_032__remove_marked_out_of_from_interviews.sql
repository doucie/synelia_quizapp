-- Migration pour supprimer la colonne marked_out_of de la table interviews
-- Cette colonne n'est plus utilisée dans le processus d'entretien

ALTER TABLE interviews DROP COLUMN marked_out_of;
