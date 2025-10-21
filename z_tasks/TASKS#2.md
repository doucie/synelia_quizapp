20/10/2025

## Tâches effectuées

- Déroulement des détails de campagnes dans la liste
- Navigation vers une page détaillée de campagne
- Ajout de la section "Questions" dans la page de détails
- Affichage des questions avec leurs réponses
- Mise en place de l'indicateur de bonne réponse (icône checkmark verte)
- Création de la migration pour supprimer le champ `marked_out_of` de la table `campaigns`
- Création de la migration pour ajouter le champ `total_questions` à la table `campaigns`
- Création de la migration pour ajouter le champ `total_questions` à la table `applications`
- Mise à jour du backend pour calculer automatiquement `total_questions` lors de l'ajout/suppression de questions
- Modification du calcul du score du quiz pour utiliser `QuestionsAnswers.isCorrect` au lieu de `Answers.isCorrect`
- Suppression du champ `markedOutOf` du formulaire de création/modification de campagne (frontend)
- Correction des erreurs de compilation dans tous les fichiers Java affectés
- Mise à jour du transformer MapStruct pour remplacer `markedOutOf` par `totalQuestions`
- Correction des requêtes SQL dans les repositories
- Validation de la compilation du projet backend

## DERNIERE REQUETE (vérifier en répondant au quiz avec la candidature 452)
il faudrait stocker le nombre de questions total dans une campagne avec un attribut total_questions dans campaigns. donc créé une nouvelle migration.

il faut aussi aussi ajouter ce même attribut dans applications (total_questions) qui va copier total_question auxquelles le candidat a répondu après avoir soumis la candidature. comme ça, même si après on ajoute des questions dans la campagne, on saura exactement combien de questions il y avait dans la campagne quand le candidat y répondait.

quand le candidat clique sur soumettre le quiz. on compte le nombre de bonne réponses soumises et on note dans quiz_score. et on compte le nombre de questions qu'il y a avait dans la campagne et on note dans total_questions.

dans campaigns, on va retirer l'attribut marked_out_of (migration)
de même, dans /dashboard/campaigns/{campaign_id} et /dashboard/campaigns/new on va retirer "note sur" et le champ "bareme de notation"




---

21/10/2025

## Tâches effectuées
- Enregistrement des scores fonctionnel
- Affichage des recruteurs liés à la campagne
- **Fix bug**: `getCampaignAccess` utilisait `campaigns_id` au lieu de `campaignId` (ligne 595 campaign.service.ts)
- **Fix bug**: `getCampaignAccessesByUser` utilisait `users_id` au lieu de `userId` (ligne 762 campaign.service.ts)

## Améliorations Application Card (/dashboard/candidates)

### ✅ 1. Filtre "Campagnes partagées uniquement" décoché par défaut
- Changé de `signal(true)` à `signal(false)` ligne 40 applications.ts

### ✅ 2. Overlays transparents (au lieu de couleurs brutes)
**Éléments modifiés**:
- `.score-badge` → `.score-badge.overlay`
- `.tag` → `.tag.overlay`
- Style: `background: rgba(couleur, 0.15)` + `backdrop-filter: blur(10px)` + `border: 1.5px solid`

### ✅ 3. Copie dans le presse-papier
**Ajouts**:
- Icône "copier" à côté de l'email (visible au survol)
- Icône "copier" à côté du téléphone (visible au survol)
- Méthode `copyToClipboard(text, label, event)` avec `navigator.clipboard`

### ✅ 4. Badge Quiz Status séparé
**Header de carte restructuré**:
```html
<div class="badges-header">
  <span class="quiz-status-badge">Quiz terminé/en cours</span>
  <span class="status-pill">Application status</span>
</div>
```

**Styles**:
- `.quiz-completed` - Vert transparent
- `.quiz-in_progress` - Orange transparent
- `.quiz-not_started` - Gris transparent

### ✅ 5. Bouton CV avec aperçu modal
**Fonctionnalités**:
- Bouton "CV disponible" dans la carte (si `candidateCvPath` existe)
- Modal avec iframe pour prévisualiser le PDF
- Bouton "Télécharger" dans le modal
- Bouton "Ouvrir dans un nouvel onglet" dans le modal
- Fermeture en cliquant sur l'overlay ou le bouton X
- Animations d'ouverture/fermeture

**Signals ajoutés**:
```typescript
cvPreviewUrl = signal<SafeResourceUrl | null>(null);
cvPreviewCandidateName = signal<string>('');
currentCvPath = signal<string>('');
```

**Méthodes**:
- `openCVPreview(app, event)` - Ouvre le modal avec sanitisation de l'URL
- `closeCVPreview()` - Ferme et reset
- `downloadCurrentCV()` - Télécharge le CV du modal
- `openCurrentCVInNewTab()` - Ouvre dans nouvel onglet

**Import ajouté**: `DomSanitizer` de `@angular/platform-browser`

### 📋 Structure finale de la carte

```
┌──────────────────────────────────────────┐
│ Header                                   │
│  ├─ Avatar + Nom                        │
│  ├─ Email + 📋 copier                   │
│  └─ 🏷️ Quiz Badge + 🏷️ Status Badge    │
├──────────────────────────────────────────┤
│ Body                                     │
│  ├─ 📅 Campagne                         │
│  ├─ 🔗 Source                           │
│  ├─ 📱 Téléphone + 📋 copier            │
│  ├─ 📄 CV disponible (bouton cliquable) │
│  ├─ 📊 Scores (overlay transparent)     │
│  └─ 🏷️ Tags (overlay transparent)       │
├──────────────────────────────────────────┤
│ Footer                                   │
│  ├─ #ID                                 │
│  └─ Voir les détails →                  │
└──────────────────────────────────────────┘
```

### 🎨 Design System - Overlays

**Palette transparente**:
| Couleur | RGBA | Usage |
|---------|------|-------|
| Vert | `rgba(16, 185, 129, 0.15)` | Excellent, Terminé, Vérifié |
| Bleu | `rgba(59, 130, 246, 0.15)` | Bon score |
| Orange | `rgba(245, 158, 11, 0.15)` | Moyen, En cours |
| Rouge | `rgba(239, 68, 68, 0.15)` | Faible |
| Gris | `rgba(107, 114, 128, 0.15)` | Neutre, Non commencé |

**Propriétés communes**:
```scss
background: rgba(couleur, 0.15);
backdrop-filter: blur(10px);
border: 1.5px solid rgba(couleur, 0.3);
```

### 📱 Responsive
- Mobile (< 480px): Icônes copier toujours visibles
- Badges header en colonne sur petit écran
- Modal CV en plein écran réduit

### 🔐 Sécurité
- URL CV sanitizée avec `DomSanitizer.bypassSecurityTrustResourceUrl()`
- Clipboard API nécessite HTTPS en production

