# 480 - Evolution : Cycle de vie automatique des statuts de campagne

## Contexte

Les campagnes ont 5 statuts (`DRAFT`, `PENDING`, `OPEN`, `PAUSED`, `CLOSED`) avec une matrice de transitions autorisées dans `CampaignStatus.canTransitionTo()`. Actuellement, **toutes les transitions sont manuelles** : aucun scheduler ne met à jour les statuts automatiquement.

**Probleme concret** : une campagne avec `campaign_end < date du jour` reste `OPEN` dans la base. Elle est invisible sur `/campagnes` (condition 6 rejetee silencieusement par `CampaignPublicAccessService`) mais reste visible dans l'admin → incohérence.

**Contrat 450 (anti-triche)** : les 3 tâches `@Scheduled` existantes (WebSocket stats 10s, user online 60s, abandon quiz 60s) ne touchent pas les campagnes. Leur pattern est la reference pour la nouvelle tâche.

## Objectif

Implementer un scheduler qui évalue automatiquement les transitions de statut basées sur les dates et le nombre de candidatures.

## Transitions automatiques

| Statut source | Statut cible | Condition |
|---------------|-------------|-----------|
| `DRAFT`       | `PENDING`   | `campaign_start` dans le futur |
| `PENDING`     | `OPEN`      | `campaign_start` ≤ aujourd'hui |
| `OPEN`        | `CLOSED`    | `campaign_end` < aujourd'hui OU `max_apply` atteint |
| `PAUSED`      | `CLOSED`    | `campaign_end` < aujourd'hui |

**Transitions manuelles conservees** :
- `DRAFT` → `OPEN` (publication directe si start date passee)
- `OPEN` ↔ `PAUSED` (pause/reprise manuelle)
- `*` → `CLOSED` (fermeture manuelle)

## Fichiers modifies/crees

### Backend

| Fichier | Action | Description |
|---------|--------|-------------|
| `business/CampaignLifecycleScheduler.java` | **Cree** | Tâche `@Scheduled(fixedRate=300000)` : `evaluateCampaignStatusTransitions()` |
| `dao/repository/CampaignsRepository.java` | Modifie | Ajout requête `findTransitionableCampaigns()` |

### Documentation

| Fichier | Action | Description |
|---------|--------|-------------|
| `cartographie-fonctionnelle-front/evolution/480-evolution-cycle-vie-campagne.md` | **Cree** | Cette note |

## Detail d'implementation

### CampaignLifecycleScheduler.java

- `@Scheduled(fixedRate = 300000)` — toutes les 5 minutes
- `@Transactional` — transaction unique pour tout le batch
- Pattern identique à `ApplicationsBusiness.abandonInactiveQuizApplications()` :
  - `SYSTEM_ACTOR_USER_ID = 0` pour `updatedBy`
  - try/catch par campagne avec log warning en cas d'erreur
  - Log de chaque transition appliquée
  - `saveAll()` en fin de batch

### Regles de resolution (`resolveTargetStatus`)

```java
DRAFT  → PENDING : startDate != null && startDate.isAfter(today)
PENDING → OPEN   : startDate != null && !startDate.isAfter(today)
OPEN   → CLOSED  : endDate != null && endDate.isBefore(today)
                  OU maxApply atteint (applicationsRepository.countByCampaignId)
PAUSED → CLOSED  : endDate != null && endDate.isBefore(today)
```

### CampaignsRepository.findTransitionableCampaigns()

```java
@Query("select e from Campaigns e where e.isDeleted = false 
        and e.campaignStatus in ('DRAFT', 'PENDING', 'OPEN', 'PAUSED')")
List<Campaigns> findTransitionableCampaigns();
```

Requête ciblée : exclut `CLOSED` (terminal) et les campagnes supprimées.

## Impact

### Avant
- Campagne avec `campaign_end` dépassé reste `OPEN` indefiniment
- Invisible sur `/campagnes` mais visible dans l'admin
- L'admin doit fermer manuellement chaque campagne expiree

### Apres
- Toutes les 5 min, les campagnes expirees passent automatiquement en `CLOSED`
- Les `DRAFT` avec start date future passent en `PENDING`
- Les `PENDING` avec start date atteinte passent en `OPEN`
- Aucune intervention humaine necessaire pour les transitions temporelles

## Verification

- `mvnw compile` : OK (pas de nouvelle dependance)
- `ng build` : OK (pas de modification frontend)
- `ApplicationsBusinessTest` : 20/20 OK
- `mvnw test` : BUILD SUCCESS
