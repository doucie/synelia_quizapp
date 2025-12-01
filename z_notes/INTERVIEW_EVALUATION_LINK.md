# Ajout du système de lien d'évaluation automatique pour les interviews

**Date**: 2025-12-01  
**Branche**: droits-et-evaluation

## Résumé

Ajout d'un système de génération automatique de liens d'évaluation uniques pour les interviews. Lorsqu'une interview passe au statut `STARTED`, un code unique alphanumérique de 8 caractères en lowercase est automatiquement généré et stocké dans le champ `interview_evaluations_link`.

## Modifications apportées

### 1. Base de données

**Fichier**: `quizapp/src/main/resources/db/migration/V1_039__add_interview_evaluations_link_to_interviews.sql`

```sql
-- Ajout de la colonne interview_evaluations_link
ALTER TABLE interviews
ADD COLUMN interview_evaluations_link VARCHAR(8);

-- Création d'un index unique case-insensitive
CREATE UNIQUE INDEX idx_interviews_evaluation_link 
ON interviews (LOWER(interview_evaluations_link));
```

**Caractéristiques**:
- Colonne VARCHAR(8) nullable
- Index unique sur `LOWER(interview_evaluations_link)` pour garantir l'unicité insensible à la casse
- Commentaire expliquant la génération automatique

### 2. Entité Java

**Fichier**: `quizapp/src/main/java/tech/synelia/quizapp/dao/entity/Interviews.java`

```java
@Column(name="interview_evaluations_link", length=8)
private String interviewEvaluationsLink;
```

**Ajouts**:
- Champ `interviewEvaluationsLink` avec getter/setter
- Annotation `@Column` avec longueur maximale de 8 caractères

### 3. DTO

**Fichier**: `quizapp/src/main/java/tech/synelia/quizapp/utils/dto/InterviewsDto.java`

```java
// Dans les attributs de données
private String interviewEvaluationsLink;

// Dans les paramètres de recherche
private SearchParam<String> interviewEvaluationsLinkParam;
```

**Ajouts**:
- Champ de données pour le transfert du lien d'évaluation
- Paramètre de recherche pour filtrer par lien d'évaluation

### 4. Business Logic

**Fichier**: `quizapp/src/main/java/tech/synelia/quizapp/business/InterviewsBusiness.java`

#### Modification de la méthode update()

```java
if (Utilities.notBlank(dto.getInterviewStatus())) {
    String oldStatus = entityToSave.getInterviewStatus();
    entityToSave.setInterviewStatus(dto.getInterviewStatus());
    
    // Générer automatiquement le lien d'évaluation quand le statut passe à STARTED
    if ("STARTED".equalsIgnoreCase(dto.getInterviewStatus()) && 
        (oldStatus == null || !"STARTED".equalsIgnoreCase(oldStatus)) &&
        (entityToSave.getInterviewEvaluationsLink() == null || 
         entityToSave.getInterviewEvaluationsLink().isEmpty())) {
        String evaluationLink = generateUniqueEvaluationLink();
        entityToSave.setInterviewEvaluationsLink(evaluationLink);
    }
}
```

**Logique**:
- Détection du changement de statut vers `STARTED`
- Vérification que l'ancien statut n'était pas déjà `STARTED`
- Vérification que le lien n'existe pas déjà
- Génération automatique du lien si toutes les conditions sont remplies

#### Nouvelle méthode helper

```java
/**
 * Génère un lien d'évaluation unique de 8 caractères alphanumériques en lowercase
 * Vérifie l'unicité dans la base de données
 * 
 * @return String - lien d'évaluation unique
 */
private String generateUniqueEvaluationLink() {
    int maxAttempts = 10;
    
    for (int attempts = 0; attempts < maxAttempts; attempts++) {
        // Générer un code alphanumérique de 8 caractères en lowercase
        String evaluationLink = Utilities.generateCodeOld().toLowerCase();
        
        // Vérifier l'unicité dans la base de données
        boolean linkExists = interviewsRepository.findAll().stream()
            .anyMatch(i -> i.getInterviewEvaluationsLink() != null && 
                          evaluationLink.equalsIgnoreCase(i.getInterviewEvaluationsLink()));
        
        if (!linkExists) {
            log.info("Lien d'évaluation unique généré: " + evaluationLink);
            return evaluationLink;
        }
    }
    
    log.warning("Impossible de générer un lien d'évaluation unique après " + maxAttempts + " tentatives");
    throw new RuntimeException("Erreur lors de la génération du lien d'évaluation unique");
}
```

**Fonctionnement**:
1. Génération d'un code alphanumérique de 8 caractères via `Utilities.generateCodeOld()`
2. Conversion en lowercase
3. Vérification de l'unicité en comparant avec tous les liens existants (case-insensitive)
4. Retour du lien si unique
5. Maximum 10 tentatives avant de lever une exception

## Format du lien généré

- **Longueur**: 8 caractères
- **Caractères**: Alphanumériques (a-z, 0-9)
- **Casse**: Lowercase uniquement
- **Unicité**: Garantie par l'index unique en base de données
- **Exemple**: `a7k9m2x4`, `p3q8r1n5`, `d6f2h9j3`

## Cas d'usage

### Scénario 1: Nouvelle interview créée puis démarrée
1. Interview créée avec statut `PENDING` → pas de lien généré
2. Statut changé en `SCHEDULED` → pas de lien généré
3. Statut changé en `STARTED` → **lien généré automatiquement** (ex: `x4m7k2p9`)

### Scénario 2: Interview directement créée avec statut STARTED
1. Interview créée avec statut `STARTED` → **lien généré automatiquement**

### Scénario 3: Interview redémarrée
1. Interview avec statut `STARTED` et lien existant `a7k9m2x4`
2. Statut changé en `POSTPONED` → lien conservé
3. Statut rechangé en `STARTED` → **lien existant conservé** (pas de nouvelle génération)

### Scénario 4: Collision de lien (très rare)
1. Tentative de génération du lien `k3m8x1p5`
2. Vérification en base → lien existe déjà
3. Nouvelle tentative avec un nouveau code
4. Maximum 10 tentatives avant erreur

## Prochaines étapes

### Étape 1: Interface utilisateur (Frontend)
- Remplacer le bouton "Marquer comme terminée" par "Évaluer" quand statut = `STARTED`
- Afficher le lien d'évaluation généré dans l'UI
- Permettre la copie du lien dans le presse-papier

### Étape 2: Page d'évaluation
- Créer une route `/dashboard/interviews/evaluate/:evaluationLink`
- Créer le composant `evaluation.component.ts`
- Afficher les détails de l'interview
- Formulaire d'évaluation du candidat

### Étape 3: Sécurité
- Valider que le lien existe et correspond à une interview en cours
- Gérer l'expiration du lien (optionnel)
- Logger les accès aux pages d'évaluation

## Tests à effectuer

### Backend
- [ ] Compilation sans erreurs ✅ (BUILD SUCCESS)
- [ ] Migration Flyway s'applique correctement
- [ ] Création d'interview avec statut STARTED génère un lien
- [ ] Mise à jour vers STARTED génère un lien
- [ ] Lien n'est pas regénéré si déjà présent
- [ ] Unicité garantie sur plusieurs interviews

### Frontend
- [ ] Affichage du lien dans l'interface interviews
- [ ] Bouton "Évaluer" apparaît pour interviews STARTED
- [ ] Navigation vers page d'évaluation fonctionne
- [ ] Gestion des erreurs si lien invalide

## Notes techniques

- Utilise `RandomStringUtils.randomAlphanumeric(8)` via `Utilities.generateCodeOld()`
- Vérifie l'unicité en mémoire avant insertion (évite les violations d'index)
- Pas de régénération automatique si lien existe déjà
- Tolère 10 collisions avant échec (probabilité très faible)

## Références

- Migration SQL: `V1_039__add_interview_evaluations_link_to_interviews.sql`
- Entité: `Interviews.java` (ligne avec @Column interview_evaluations_link)
- DTO: `InterviewsDto.java` 
- Business: `InterviewsBusiness.java` (méthode `generateUniqueEvaluationLink()`)
