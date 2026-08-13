-- =============================================================================
-- V1_081 : correction du type de content_hash (CHAR(64) -> VARCHAR(64))
-- -----------------------------------------------------------------------------
-- V1_078 a cree content_hash en CHAR(64), mais l'entite
-- EvaluationGridTemplateVersion la mappe en String @Column(length=64), ce qui
-- fait attendre VARCHAR(64) a la validation Hibernate (hbm2ddl.auto=validate) :
--   Schema-validation: wrong column type encountered in column [content_hash]
--   found [char], but expecting [varchar(64)]
-- Le type correct pour une empreinte SHA-256 hex est VARCHAR(64).
-- -----------------------------------------------------------------------------
-- Le MODIFY conserve l'index UNIQUE uk_egtv_content_hash ainsi que le
-- charset/collation actuels de la colonne.
-- =============================================================================
ALTER TABLE evaluation_grid_template_version
    MODIFY COLUMN content_hash VARCHAR(64) NULL;
