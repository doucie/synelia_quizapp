# Corrections MCT — Problèmes et Solutions

---

## MCT 1a — T1 (Soumettre la candidature)

### Problème 1 : "Lien campagne ouvert" peu compréhensible
**Problème :** L'événement "Lien campagne ouvert" n'est pas naturel
**Solution :** Renommer en "Campagne ouverte et accessible"
**Fichiers :** `mct_1a_candidature.ts` (t1-e1), `mct_1_candidature_quiz.ts` (t1-e1)

### Problème 2 : "Candidature créée" comme règle d'émission
**Problème :** "Candidature créée" est un résultat, pas une règle d'émission (branche de décision)
**Solution :** Remplacer par "OK" (données valides) dans `emissionRules`. Garder "Candidature créée" uniquement comme résultat
**Fichiers :** `mct_1a_candidature.ts`, `mct_1_candidature_quiz.ts`

### Problème 3 : Résultat = même texte que la règle d'émission
**Problème :** Le résultat ne doit pas porter le même nom que la règle d'émission
**Solution :**
- Règle "OK" → Résultat "Candidature enregistrée"
- Règle "Quota atteint" → Résultat "Quota dépassé" (fail)
- Règle "Token invalide" → Résultat "Lien invalide" (fail)
**Fichiers :** `mct_1a_candidature.ts`, `mct_1_candidature_quiz.ts`

---

## MCT 1b — T2 (Passer le quiz)

### Problème 4 : "Round QUIZ ouvert" peu compréhensible
**Problème :** Le terme "Round QUIZ ouvert" n'est pas naturel
**Solution :** Renommer en "Étape de quiz active"
**Fichiers :** `mct_1b_quiz.ts` (t2-e1), `mct_1_candidature_quiz.ts` (t2-e1)

### Problème 5 : "Candidat ouvre le quiz" peu compréhensible
**Solution :** Renommer en "Quiz démarré par le candidat"
**Fichiers :** `mct_1b_quiz.ts` (t2-e2), `mct_1_candidature_quiz.ts` (t2-e2)

### Problème 6 : "Quota tentatives non atteint"
**Solution :** Renommer en "Quota de tentatives non atteint"
**Fichiers :** `mct_1b_quiz.ts` (t2-e3), `mct_1_candidature_quiz.ts` (t2-e3)

### Problème 7 : "Passer le quiz du round courant" peu compréhensible
**Solution :** Renommer en "Répondre au quiz de l'étape en cours"
**Fichiers :** `mct_1b_quiz.ts` (t2-op label), `mct_1_candidature_quiz.ts` (t2-op label)

### Problème 8 : Règle "Score entre seuils" → "À corriger manuellement"
**Problème :** La logique est inversée. La correction manuelle ne se fait que si le formulaire l'exige explicitement
**Solution :**
- Règle "Score entre seuils" → "Correction manuelle requise"
- Résultat "À corriger manuellement" → "En attente de correction"
- Règle "Score ≥ seuil" → Résultat "Quiz réussi"
- Règle "Score < seuil" → Résultat "Quiz échoué" (fail)
**Fichiers :** `mct_1b_quiz.ts`, `mct_1_candidature_quiz.ts`

---

## MCT 2 — T3 (Entretien & Évaluation)

### Problème 9 : Incohérence event/opération (Superseded par le problème 11)
**Problème :** L'événement dit "Recruteur planifie entretien" mais l'opération contient aussi "Planifier l'entretien" — c'est redondant
**Solution :**
- Événement : "Entretien planifié par le recruteur" (état, pas action)
- Opération : Supprimer "Planifier l'entretien" des items, garder uniquement les étapes post-planification
**Fichiers :** `mct_2_entretien_evaluation.ts`

### Problème 10 : "Round INTERVIEW ouvert" peu compréhensible (Superseded par le problème 11)
**Solution :** Renommer en "Étape d'entretien active"
**Fichiers :** `mct_2_entretien_evaluation.ts` (t3-e1)

### Problème 11 : MCT à revoir complètement
**Solution :** Restructurer avec 2 événements d'état (pas d'action) :
- Événements : "Entretien planifié", "Évaluations soumises"
- Sync : ET
- Opération : "Conduire et évaluer l'entretien"
  1. Vérifier la présence du candidat
  2. Recueillir les évaluations des évaluateurs
  3. Calculer le score moyen par critère
  4. Valider ou refuser l'entretien
- Règles d'émission : "Évaluations favorables", "Candidat absent", "Score insuffisant"
- Résultats : "Entretien validé" (succès), "Entretien annulé" (échec), "Entretien refusé" (échec)
**Fichiers :** `mct_2_entretien_evaluation.ts`

---

## MCT 3a — T4 (Décision)

### Problème 12 : "Round DECISION ouvert" peu compréhensible (Superseded par le problème 16)
**Solution :** Renommer en "Étape de décision active"
**Fichiers :** `mct_3a_decision.ts` (t4-e1), `mct_3_decision_audit.ts` (t4-e1)

### Problème 13 : "Recruteur saisit décision" ne ressemble pas à un événement (Superseded par le problème 16)
**Solution :** Renommer en "Décision du recruteur enregistrée"
**Fichiers :** `mct_3a_decision.ts` (t4-e2), `mct_3_decision_audit.ts` (t4-e2)

### Problème 14 : "Habilitation OK" incompréhensible (Superseded par le problème 16)
**Solution :** Renommer en "Validations préalables OK"
**Fichiers :** `mct_3a_decision.ts` (t4-e3), `mct_3_decision_audit.ts` (t4-e3)

### Problème 15 : "Prononcer une décision" ne ressemble pas à un traitement (Superseded par le problème 16)
**Solution :** Renommer en "Évaluer et décider du sort de la candidature"
**Fichiers :** `mct_3a_decision.ts` (t4-op label), `mct_3_decision_audit.ts` (t4-op label)

### Problème 16 : MCT à revoir complètement
**Solution :** Restructurer avec 2 événements d'état :
- Événements : "Candidat en phase de décision", "Décision du recruteur"
- Sync : ET
- Opération : "Valider la décision du recruteur"
  1. Vérifier les droits du recruteur (habilitation)
  2. Recueillir la justification de la décision
  3. Enregistrer dans l'audit
- Règles d'émission : "Décision favorable", "Décision en sursis", "Décision défavorable"
- Résultats : "Candidat retenu" (succès), "Candidat en attente" (succès), "Candidat refusé" (échec)
**Fichiers :** `mct_3a_decision.ts`, `mct_3_decision_audit.ts`

---

## MCT 3b — T5 (Rollback)

### Problème 17 : L'opération contient un des événements
**Problème :** L'opération "Annuler/rouvrir une décision" contient l'action qui devrait être un événement
**Solution :** Remplacer par l'événement d'état "Demande d'annulation formulée"
**(Le label de l'opération est repris par le problème 18)**
**Fichiers :** `mct_3b_rollback.ts`, `mct_3_decision_audit.ts`

### Problème 18 : "Annuler/rouvrir une décision" ne ressemble pas à un traitement
**Solution :** Renommer en "Gérer la demande d'annulation"
Items :
1. Vérifier les droits du recruteur (habilitation à annuler)
2. Vérifier si l'annulation est possible
3. Recueillir le justificatif (obligatoire)
4. Enregistrer dans l'audit
Règles d'émission : "Annulation autorisée", "Décision immuable"
Résultats : "Étape réouverte" (succès), "Décision inchangée" (échec)
**Fichiers :** `mct_3b_rollback.ts` (t5-op label), `mct_3_decision_audit.ts` (t5-op label)

### Problème 19 : "Refus (décision ancrée)" peu clair
**Solution :** Renommer le résultat en "Décision inchangée" (cohérent avec la règle "Décision immuable")
**Fichiers :** `mct_3b_rollback.ts` (t5-r2), `mct_3_decision_audit.ts` (t5-r2)

---

## MCT 3c — T6 (Audit)

### Problème 20 : Structure incomplète
**Problème :** Pas de règles d'émission ni de résultats
**Solution :** Ajouter :
- Synchronisation (vide, avant l'opération)
- Règle d'émission : "Opération journalisée"
- Résultat : "Trace enregistrée"
**Fichiers :** `mct_3c_audit.ts`, `mct_3_decision_audit.ts`

---

## Fichiers à modifier

| Fichier | Modifications |
|---------|--------------|
| `mct_1a_candidature.ts` | Événements, règles, résultats T1 |
| `mct_1b_quiz.ts` | Événements, règles, résultats T2 |
| `mct_1_candidature_quiz.ts` | T1 + T2 (composite) |
| `mct_2_entretien_evaluation.ts` | Restructuration complète T3 |
| `mct_3a_decision.ts` | Événements, titre, items T4 |
| `mct_3b_rollback.ts` | Séparation event/opération T5 |
| `mct_3c_audit.ts` | Ajout event, sync, règles, résultats T6 |
| `mct_3_decision_audit.ts` | T4 + T5 + T6 (composite) |
