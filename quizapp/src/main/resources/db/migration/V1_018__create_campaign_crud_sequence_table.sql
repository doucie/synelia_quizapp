-- Migration pour créer la table de séquence pour campaign_crud
-- Cette table est utilisée par Hibernate avec GenerationType.AUTO

CREATE TABLE IF NOT EXISTS campaign_crud_seq (
    next_val BIGINT
) ENGINE=InnoDB;

-- Initialiser la séquence avec la valeur suivante après le dernier ID existant
INSERT INTO campaign_crud_seq (next_val)
SELECT IFNULL(MAX(id), 0) + 1 FROM campaign_crud;
