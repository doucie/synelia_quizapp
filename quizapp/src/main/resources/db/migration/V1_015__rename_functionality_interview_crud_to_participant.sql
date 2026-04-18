-- Rename INTERVIEW_CRUD functionalities to INTERVIEW_PARTICIPANT in system_role_permission
UPDATE system_role_permission
SET functionality = REPLACE(functionality, 'INTERVIEW_CRUD', 'INTERVIEW_PARTICIPANT')
WHERE functionality LIKE '%INTERVIEW_CRUD%';
