# Synelia Quiz App - Frontend

## 📋 Vue d'ensemble

Application Angular moderne pour la plateforme de quiz Synelia. Cette application front-end offre une interface utilisateur élégante avec support des thèmes sombre/clair et une architecture modulaire.

## 🚀 Fonctionnalités

- ✅ **Thème Dark/Light** : Commutateur de thème avec persistance localStorage
- ✅ **Design Responsive** : Interface optimisée mobile-first
- ✅ **Architecture Modulaire** : Composants réutilisables et services injectables
- ✅ **Système de Couleurs** : Variables CSS centralisées
- ✅ **Navigation Moderne** : Header avec menu burger responsive
- ✅ **Page d'Accueil** : Landing page moderne avec animations
- ✅ **TypeScript** : Code entièrement typé
- ✅ **SCSS** : Styles avancés avec variables et mixins

## 🛠️ Technologies

- **Framework** : Angular 19
- **Language** : TypeScript
- **Styles** : SCSS + Variables CSS
- **Build Tool** : Angular CLI
- **Package Manager** : npm

## 🎨 Système de Couleurs

Le projet utilise un système de couleurs avancé avec variables CSS :

### Couleurs Principales
- `--primary` : #6B46C1 (Violet Synelia)
- `--secondary` : #EC4899 (Rose)
- `--accent` : #10B981 (Vert)

### Thèmes
- **Light Mode** : Fond blanc, texte sombre
- **Dark Mode** : Fond sombre, texte clair
- **Transition** : Animations fluides entre thèmes

## 🔧 Installation et Lancement

### Prérequis
- Node.js 18+
- npm 9+
- Angular CLI 17+

### Installation
```bash
cd quizapp_front
npm install
```

### Développement
```bash
ng serve --open
```

### Build Production
```bash
ng build --configuration production
```

## 📁 Structure du Projet

```
src/
├── app/
│   ├── components/          # Composants réutilisables
│   │   ├── header/         # Navigation principale
│   │   └── theme-toggle/   # Commutateur de thème
│   ├── pages/              # Pages de l'application
│   │   └── home/          # Page d'accueil
│   ├── services/           # Services Angular
│   │   └── theme.ts       # Service de gestion des thèmes
│   ├── app.ts             # Composant racine
│   ├── app.routes.ts      # Configuration des routes
│   └── app.config.ts      # Configuration de l'app
├── colors.css             # Système de couleurs centralisé
└── styles.scss           # Styles globaux
```

## 🎯 Règles de Développement

Suivre le fichier `RULES.md` pour les standards de codage et les bonnes pratiques.

## 🚦 Statut du Projet

- ✅ **Structure de base** : Terminée
- ✅ **Système de thèmes** : Fonctionnel
- ✅ **Navigation** : Responsive complète
- ✅ **Page d'accueil** : Design moderne
- 🔄 **Pages additionnelles** : À développer
- 🔄 **Intégration API** : À implémenter
