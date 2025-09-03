# 🏗️ Architecture Guide - Quiz App Frontend

## 📁 Structure du Projet

```
src/app/
├── core/                     # Services globaux et fonctionnalités de base
│   ├── guards/              # Guards de route (AuthGuard)
│   ├── interceptors/        # Intercepteurs HTTP (ApiInterceptor)
│   ├── services/            # Services métier (ApiService, ThemeService)
│   └── index.ts            # Exports publics du module core
├── shared/                   # Composants et modèles réutilisables
│   ├── components/          # Composants UI réutilisables (ButtonComponent)
│   ├── models/             # Interfaces TypeScript (User, Quiz, etc.)
│   └── index.ts            # Exports publics du module shared
├── features/                # Modules de fonctionnalités
│   └── quiz/               # Module Quiz avec lazy loading
│       ├── quiz-list/      # Composant liste des quiz
│       ├── quiz-detail/    # Composant détail d'un quiz
│       └── quiz.routes.ts  # Routes du module quiz
├── components/             # Composants globaux (Header, etc.)
├── pages/                  # Pages principales (Home)
└── app files              # Configuration et composant racine
```

## 🎯 Principes Appliqués

### ✅ Angular Best Practices

#### OnPush Change Detection
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```
Tous les composants utilisent OnPush pour des performances optimales.

#### Async Pipe Usage
```typescript
// ❌ Évité
subscribe(data => this.data = data)

// ✅ Recommandé
data$ = this.service.getData()
// Template: {{ data$ | async }}
```

#### Proper Unsubscription
```typescript
export class Component implements OnDestroy {
  private destroy$ = new Subject<void>();
  
  ngOnInit() {
    this.service.data$
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### ✅ TypeScript Standards

#### Strict Typing
```typescript
// ✅ Interfaces définies
interface User {
  id: number;
  email: string;
  role: UserRole;
}

// ✅ Enums utilisés
enum UserRole {
  ADMIN = 'ADMIN',
  RECRUITER = 'RECRUITER'
}

// ❌ any évité partout
```

#### Naming Conventions
- Files: `kebab-case` (quiz-list.component.ts)
- Variables: `camelCase` (isMenuOpen)
- Classes: `PascalCase` (QuizListComponent)
- Constants: `UPPER_SNAKE_CASE` (API_BASE_URL)

### ✅ SCSS Architecture

#### CSS Custom Properties
```scss
// ✅ Variables centralisées
.component {
  color: var(--text-primary);
  background: var(--surface);
  border: 1px solid var(--border);
}
```

#### BEM Methodology
```scss
.quiz-card {
  // Base
  
  &__title {
    // Element
  }
  
  &--featured {
    // Modifier
  }
}
```

## 🚀 Lazy Loading

### Feature Modules
```typescript
// quiz.routes.ts
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./quiz-list/quiz-list.component')
      .then(m => m.QuizListComponent)
  }
];
```

### Route Configuration
```typescript
// app.routes.ts
{
  path: 'quiz',
  loadChildren: () => import('./features/quiz/quiz.routes')
    .then(m => m.routes)
}
```

## 🔒 Security & HTTP

### Guards Implementation
```typescript
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  canActivate(): boolean {
    return this.authService.isAuthenticated();
  }
}
```

### HTTP Interceptors
```typescript
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const modifiedReq = req.clone({
    setHeaders: {
      'Content-Type': 'application/json'
    }
  });
  return next(modifiedReq);
};
```

## 🧪 Testing Strategy

### Component Tests
```typescript
describe('Component', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Component],
      providers: [{ provide: Service, useValue: mockService }]
    }).compileComponents();
  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### Service Tests
```typescript
describe('Service', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
  });
  
  it('should call API', () => {
    service.getData().subscribe();
    const req = httpMock.expectOne('/api/data');
    expect(req.request.method).toBe('GET');
  });
});
```

## 📋 Development Checklist

- [ ] Composant utilise OnPush change detection
- [ ] Interfaces TypeScript définies pour les données
- [ ] Tests unitaires écrits (.spec.ts)
- [ ] SCSS utilise les variables CSS centralisées
- [ ] Async pipe utilisé au lieu de subscribe manuel
- [ ] Services injectés avec providedIn: 'root'
- [ ] Observables unsubscribed dans OnDestroy
- [ ] Routes configurées avec lazy loading si nécessaire
- [ ] Guards appliqués aux routes sensibles
- [ ] Intercepteurs configurés pour les appels HTTP

## 🎯 Performance Tips

1. **OnPush Detection**: Réduit les cycles de détection des changements
2. **Lazy Loading**: Charge les modules à la demande
3. **Async Pipe**: Gestion automatique des subscriptions
4. **TrackBy Functions**: Optimise les *ngFor
5. **CSS Variables**: Évite la recompilation SCSS

Cette architecture garantit un code maintenable, performant et conforme aux standards Angular modernes.
