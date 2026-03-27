# Optimisation Frontend

## Architecture

### ✅ Points positifs
- Angular 20.2 (dernière version)
- Composants standalone (pattern moderne)
- Lazy loading des routes
- Angular Signals utilisés
- Aucune librairie UI lourde (léger)
- Guards de route fonctionnels
- Service d'interception HTTP

---

## 🔴 Problèmes critiques

### 1. Fuites mémoire massives (~40+ instances)

**Problème** : Les subscriptions RxJS ne sont quasi jamais nettoyées. Un seul `unsubscribe()` trouvé dans tout le code.

**Fichiers les plus impactés :**
- Tous les composants entity (`entities-users.ts`, `entities-campaigns.ts`, etc.) 
- `applications.ts` (20+ subscribe sans cleanup)
- `qeel-websocket.service.ts`
- `online-status.service.ts`

**Pattern actuel (mauvais) :**
```typescript
this.service.getData().subscribe({...}); // Jamais unsubscribe !
```

**Pattern corrigé :**
```typescript
private destroy$ = new Subject<void>();

ngOnInit() {
  this.service.getData()
    .pipe(takeUntil(this.destroy$))
    .subscribe({...});
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

### 2. 5 composants QEEL dupliqués

Cinq variantes du même composant existent :
1. `qeel.component.ts` 
2. `qeel-modern.component.ts` (~500 lignes)
3. `qeel-fast.component.ts`
4. `qeel-compact.component.ts`
5. `qeel-compact-modern.component.ts`

Tous partagent la même logique (fetch stats, WebSocket, affichage).

**Correction** : Un seul composant avec `@Input() variant: 'modern' | 'compact' | 'fast'`

### 3. Trois services redondants pour les utilisateurs en ligne

| Service | Responsabilité | Problème |
|---------|---------------|----------|
| `online-status.service.ts` | Heartbeat de l'utilisateur courant | Polling 30s |
| `online-stats.service.ts` | Stats QEEL agrégées | HTTP polling |
| `qeel-websocket.service.ts` | Stats QEEL temps réel | WebSocket + fallback HTTP |

**Correction** : Fusionner en 2 services max :
- `UserPresenceService` → heartbeat de l'utilisateur courant
- `OnlineStatsService` → WebSocket/HTTP pour les stats agrégées

---

## 🟠 Problèmes importants

### 4. Composants trop volumineux

Plusieurs composants dépassent 500-1000 lignes :
- `evaluations.ts` → polling complexe, gestion de statuts, présence, calculs
- `applications.ts` → CRUD complet, recherche, filtres, dialogues
- `dashboard.ts` → layout principal + menu + gestion de thème
- Les 9 composants `entities-*.ts` → pattern CRUD identique dupliqué

**Correction** : Extraire en sous-composants (container + presentational).

### 5. Pattern CRUD dupliqué 9 fois

Les composants entity (`entities-users.ts`, `entities-campaigns.ts`, etc.) ont tous :
- Le même UI de recherche/filtre
- La même logique de pagination
- Les mêmes opérations CRUD
- Le même rendu de table

**Correction** : Créer un composant générique `EntityCrudComponent<T>` configurable.

### 6. setInterval/setTimeout sans nettoyage

~40 instances de timers non nettoyés dans `ngOnDestroy()` :
- `online-status.service.ts` → heartbeat interval
- `qeel-modern.component.ts` → affichage de l'heure
- Composants de polling

**Correction** : Stocker les ID de timer et `clearInterval()` dans `ngOnDestroy()`.

---

## 🟡 Problèmes de qualité

### 7. URLs hardcodées dans les services

```typescript
// qeel-websocket.service.ts
fetch('http://localhost:8085/user/online-stats', {...});
const wsUrl = 'ws://localhost:8085/ws/qeel';

// online-status.service.ts  
navigator.sendBeacon('http://localhost:8085/user/...');
```

Ces URLs contournent le proxy Angular et l'intercepteur HTTP.

**Correction** : Utiliser `environment.apiUrl` + `HttpClient` partout.

### 8. localStorage accédé directement

Plusieurs services accèdent directement à `localStorage` :
```typescript
const user = localStorage.getItem('user');  // Direct !
```
Alors qu'un `StorageService` existe déjà mais n'est pas utilisé.

**Correction** : Utiliser `StorageService` systématiquement.

### 9. Pas de gestion d'état centralisée

- Pas de NgRx, Akita, ou store custom
- Signaux et Observables RxJS mélangés sans cohérence
- Le flux de données est difficile à tracer

**Correction** : Pour un projet de cette taille, les signaux Angular suffisent. Standardiser sur les signaux avec des services "store".

---

## Résumé des priorités

| # | Problème | Sévérité | Effort estimé |
|---|----------|----------|---------------|
| 1 | Fuites mémoire (takeUntil partout) | 🔴 Critique | 4h |
| 2 | Fusion des 5 composants QEEL | 🔴 Haute | 3h |
| 3 | Fusion des 3 services online | 🔴 Haute | 2h |
| 4 | Cleanup timers (clearInterval) | 🟠 Haute | 2h |
| 5 | Refactoring composants géants | 🟠 Moyenne | 8h |
| 6 | EntityCrudComponent générique | 🟠 Moyenne | 6h |
| 7 | Suppression URLs hardcodées | 🟡 Moyenne | 2h |
| 8 | Utilisation StorageService | 🟡 Basse | 1h |
