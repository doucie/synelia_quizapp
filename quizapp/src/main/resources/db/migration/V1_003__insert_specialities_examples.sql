-- Migration: V1_003__insert_specialities_examples.sql
-- Date: 2025-09-16
-- Description: Insertion des données d'exemple pour les spécialités avec associations aux départements

-- ===========================================
-- NETTOYAGE DES DONNÉES EXISTANTES
-- ===========================================
DELETE FROM specialities;

-- ===========================================
-- INSERTION DES DONNÉES D'EXEMPLE
-- ===========================================
INSERT INTO specialities (speciality_name, speciality_desc, department_id, created_at, updated_at, is_deleted) VALUES
-- Développement (ID: 1) - 10 spécialités
('Java Development', 'Développement d''applications Java, Spring Boot, microservices', 1, NOW(), NOW(), 0),
('Frontend React', 'Développement d''interfaces utilisateur avec React, Redux, TypeScript', 1, NOW(), NOW(), 0),
('Python Data Science', 'Analyse de données, machine learning avec Python, pandas, scikit-learn', 1, NOW(), NOW(), 0),
('DevOps', 'Infrastructure cloud, Docker, Kubernetes, CI/CD', 1, NOW(), NOW(), 0),
('Android Development', 'Développement d''applications Android avec Kotlin et Jetpack Compose', 1, NOW(), NOW(), 0),
('Full Stack JavaScript', 'Développement complet avec Node.js, Express, React/Vue.js', 1, NOW(), NOW(), 0),
('Cloud Architecture', 'Architecture cloud, AWS/Azure/GCP, serverless, microservices', 1, NOW(), NOW(), 0),
('Database Administration', 'Administration et optimisation des bases de données', 1, NOW(), NOW(), 0),
('Quality Assurance', 'Tests logiciels, automatisation, assurance qualité', 1, NOW(), NOW(), 0),
('Data Engineering', 'Ingénierie des données, ETL, data warehousing, big data', 1, NOW(), NOW(), 0),

-- Gestion de Produit (ID: 2) - 2 spécialités
('UI/UX Design', 'Conception d''interfaces utilisateur et expérience utilisateur', 2, NOW(), NOW(), 0),
('Technical Writing', 'Rédaction technique, documentation, guides utilisateur', 2, NOW(), NOW(), 0),

-- Gestion de Projet (ID: 3) - 1 spécialité
('Project Management', 'Gestion de projets IT, méthodologies agiles, Scrum', 3, NOW(), NOW(), 0),

-- Sécurité (ID: 5) - 1 spécialité
('Cybersecurity', 'Sécurité informatique, pentesting, cryptographie, conformité', 5, NOW(), NOW(), 0),

-- Spécialité supprimée pour tests (Développement)
('Mobile iOS', 'Développement d''applications iOS avec Swift et SwiftUI', 1, NOW(), NOW(), 1);

-- ===========================================
-- VÉRIFICATION DES DONNÉES INSÉRÉES
-- ===========================================
-- Statistiques générales
SELECT
    COUNT(*) as 'Total spécialités',
    SUM(CASE WHEN is_deleted = 0 THEN 1 ELSE 0 END) as 'Spécialités actives',
    SUM(CASE WHEN is_deleted = 1 THEN 1 ELSE 0 END) as 'Spécialités supprimées'
FROM specialities;

-- Répartition par département
SELECT
    d.department_name as 'Département',
    COUNT(s.id) as 'Nombre de spécialités',
    GROUP_CONCAT(s.speciality_name SEPARATOR ', ') as 'Spécialités'
FROM departments d
LEFT JOIN specialities s ON d.id = s.department_id AND s.is_deleted = 0
WHERE d.is_deleted = 0
GROUP BY d.id, d.department_name
ORDER BY d.id;

-- Liste des spécialités supprimées
SELECT
    speciality_name as 'Spécialité supprimée',
    d.department_name as 'Département'
FROM specialities s
LEFT JOIN departments d ON s.department_id = d.id
WHERE s.is_deleted = 1;

-- ===========================================
-- RÉSUMÉ DES DONNÉES
-- ===========================================
/*
DONNÉES INSÉRÉES :
==================
✅ 14 spécialités actives réparties dans 4 départements :
   - Développement (ID:1) : 10 spécialités
   - Gestion de Produit (ID:2) : 2 spécialités
   - Gestion de Projet (ID:3) : 1 spécialité
   - Sécurité (ID:5) : 1 spécialité

✅ 1 spécialité supprimée (Mobile iOS) pour tester la restauration

✅ Associations cohérentes avec les départements existants
*/