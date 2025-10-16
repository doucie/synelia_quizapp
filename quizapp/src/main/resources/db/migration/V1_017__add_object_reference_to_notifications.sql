-- Migration V1_017: Ajout des colonnes object_table_name et object_table_id à la table notifications
-- Ces colonnes permettent de lier une notification à un objet spécifique (campagne, candidature, etc.)

-- Ajouter la colonne object_table_name (nom de la table de l'objet référencé)
ALTER TABLE notifications 
ADD COLUMN object_table_name VARCHAR(100) NULL 
COMMENT 'Nom de la table de l''objet lié à la notification (ex: campaigns, applications, etc.)';

-- Ajouter la colonne object_table_id (ID de l'objet référencé)
ALTER TABLE notifications 
ADD COLUMN object_table_id INT NULL 
COMMENT 'ID de l''objet dans la table référencée';

-- Ajouter un index composite pour améliorer les performances des requêtes
CREATE INDEX idx_notifications_object_reference 
ON notifications(object_table_name, object_table_id);

-- Ajouter un index pour les requêtes par utilisateur et objet
CREATE INDEX idx_notifications_user_object 
ON notifications(user_id, object_table_name, object_table_id);
