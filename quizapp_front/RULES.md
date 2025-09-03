# Règles de Développement - Quiz App Front (Angular)

## 🅰️ Angular & TypeScript
- [ ] Utiliser Angular CLI pour générer composants, services, modules
- [ ] Structure : app/shared, app/features, app/core
- [ ] OnPush change detection pour les composants performants
- [ ] Services injectables pour la logique métier
- [ ] Interfaces TypeScript pour typer les données
- [ ] Lazy loading pour les modules de fonctionnalités

## 🎨 SCSS & Couleurs
- [ ] Utiliser uniquement les variables CSS du `:root`
- [ ] SCSS pour les composants avec &__element, &--modifier (BEM)
- [ ] Interdiction des couleurs hardcodées (#fff, blue, etc.)
- [ ] ViewEncapsulation.None seulement si nécessaire

## 🧩 Composants Angular
- [ ] Un composant = un dossier (component.ts, .html, .scss, .spec.ts)
- [ ] Nommage kebab-case pour les fichiers
- [ ] @Input() et @Output() explicites et typés
- [ ] Lifecycle hooks appropriés (OnInit, OnDestroy, etc.)
- [ ] Unsubscribe des observables dans OnDestroy

## 🏗️ Architecture Angular
- [ ] Séparer la logique métier dans des services
- [ ] HttpClient pour les appels API avec interceptors
- [ ] Guards pour la sécurité des routes
- [ ] Organiser par modules : shared, core, features
- [ ] Store pattern (NgRx) pour l'état global si nécessaire

## 🚫 Anti-Spaghetti Code
- [ ] Éviter le code dans constructor (utiliser OnInit)
- [ ] Pas de logique métier dans les templates
- [ ] Éviter les chaînes de if/else longues (switch ou maps)
- [ ] Pas de manipulation directe du DOM
- [ ] Éviter any en TypeScript, typer explicitement
- [ ] Pas de subscribe dans templates (utiliser async pipe)

## ✅ Standards TypeScript
- [ ] Nommage cohérent (kebab-case fichiers, camelCase variables)
- [ ] Code en anglais (variables, fonctions, commentaires)
- [ ] Indentation 2 espaces
- [ ] Utiliser const et let, éviter var
- [ ] Prettier et ESLint configurés

## 🏛️ Structure Ultra-Modulaire (CRITIQUE)
- [ ] **FACTORISATION OPTIMALE** : Chaque fonctionnalité doit être réutilisable et modulaire
- [ ] **SÉPARATION STRICTE** : Aucun mélange de code entre les fichiers
- [ ] **PAS DE CSS dans les fichiers .ts** : Logique uniquement
- [ ] **PAS DE TS dans les fichiers .html** : Structure uniquement
- [ ] **PAS DE HTML dans les fichiers .ts** : Pas de templates inline
- [ ] **Un fichier CSS = CSS uniquement** : Styles purs sans logique
- [ ] **Un fichier HTML = HTML uniquement** : Structure pure sans styles inline
- [ ] **Un fichier TS = TypeScript uniquement** : Logique pure sans templates/styles
- [ ] **Variables CSS du :root uniquement** : Interdiction des couleurs brutes (#fff, blue, red, etc.)
- [ ] **À chaque composant son CSS** : Un fichier .scss dédié par composant
- [ ] **Composants atomiques** : Décomposer en plus petites unités réutilisables
- [ ] **Services spécialisés** : Une responsabilité par service
- [ ] **Interfaces dédiées** : Types partagés dans des fichiers séparés
