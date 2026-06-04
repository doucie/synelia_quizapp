-- Ajoute la colonne is_public à la table source_token.
-- Un seul token public par campagne (créé automatiquement par le backend lors d'une candidature directe).
ALTER TABLE source_token
    ADD COLUMN is_public TINYINT(1) NOT NULL DEFAULT 0;
