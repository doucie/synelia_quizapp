# Fichiers supprimables sans impact

## Dossiers entiers supprimables

### 1. `/z_notes/` ✅ SUPPRIMABLE
- **Contenu** : 20 fichiers markdown de notes de debugging/développement
- **Exemples** : `DEBUG_RECRUITER_SEARCH.md`, `QUIZ_SECURITY.md`, `FIX_EMAIL_VERIFICATION.md`
- **Impact** : Aucun – documentation de sessions de travail uniquement

### 2. `/z_tasks/` ✅ SUPPRIMABLE
- **Contenu** : 12 fichiers de suivi de tâches (`tasks#0.md` à `tasks#11.md`)
- **Impact** : Aucun – journaux administratifs uniquement

### 3. `/z_mémoire/` ✅ SUPPRIMABLE
- **Contenu** : Cahier des charges, plans de mémoire, templates
- **Impact** : Aucun sur l'application – fichiers de mémoire/rapport académique
- **⚠️ Attention** : Vérifier si ces documents sont encore nécessaires pour le rendu universitaire avant suppression

### 4. `/recruitement_synelia_plan/` ✅ SUPPRIMABLE
- **Contenu** : Prototype HTML/CSS statique de maquettes
- **Impact** : Aucun – aucune référence dans le code de l'application
- **Note** : Wireframes/mockups initiaux, jamais intégrés au projet

### 5. `/quizapp/TelosysTools/` ✅ SUPPRIMABLE
- **Contenu** : Configuration du générateur de code Telosys
- **Impact** : Aucun – non référencé dans pom.xml, utilisé uniquement lors du scaffolding initial

### 6. `/quizapp/postman-examples/` ✅ SUPPRIMABLE
- **Contenu** : 13 fichiers markdown de documentation API Postman
- **Impact** : Aucun – aide développeur uniquement
- **Note** : La documentation API est aussi dans le code via SpringDoc/OpenAPI

### 7. `/quizapp/target/` ✅ SUPPRIMABLE (régénéré automatiquement)
- **Contenu** : Sortie de compilation Maven (classes, WAR, etc.)
- **Impact** : Aucun – recréé à chaque `mvn clean install`
- **Note** : Déjà dans `.gitignore`

---

## Fichiers individuels supprimables

| Fichier | Raison | Impact |
|---------|--------|--------|
| `quizapp/HELP.md` | Template auto-généré Spring Boot | Aucun |
| `quizapp_front/src/test-api.html` | Page de test API manuelle | Aucun |
| `quizapp_front/src/app/components/qeel/qeel.component.ts` | Ancienne version, remplacée par `qeel-modern` | ⚠️ Vérifier les imports |
| `quizapp_front/src/app/components/qeel/qeel-fast.component.ts` | Variante non utilisée | ⚠️ Vérifier les imports |
| `quizapp_front/src/app/components/qeel/qeel-compact.component.ts` | Variante non utilisée | ⚠️ Vérifier les imports |

### Fichiers de test vides (placeholder)

| Fichier | Contenu |
|---------|---------|
| `quizapp_front/src/app/shared/theme-toggle.spec.ts` | Vide |
| `quizapp_front/src/app/features/quiz/quiz-list.component.spec.ts` | Vide |
| `quizapp_front/src/app/features/quiz/quiz-detail.component.spec.ts` | Vide |
| `quizapp_front/src/app/pages/dashboard/analytics/analytics.spec.ts` | Vide |
| `quizapp_front/src/app/pages/dashboard/candidates/candidates.spec.ts` | Vide |
| `quizapp/src/test/java/.../QuizappApplicationTests.java` | Test vide (contextLoads) |

---

## Fichiers à NE PAS supprimer

| Fichier/Dossier | Raison |
|-----------------|--------|
| `/quizapp/uploads/cv/` | Données utilisateur réelles (CVs uploadés) |
| `start-backend.bat` | Script utilitaire de lancement |
| `quizapp/POSTMAN_API_GUIDE.md` | Documentation API utile |

---

## Estimation d'espace libéré

| Dossier | Estimation |
|---------|-----------|
| `target/` | ~50-100 MB (build output) |
| `z_mémoire/` + `z_notes/` + `z_tasks/` | ~2-5 MB |
| `recruitement_synelia_plan/` | ~1 MB |
| `TelosysTools/` | ~5-10 MB |
| **Total** | **~60-120 MB** |
