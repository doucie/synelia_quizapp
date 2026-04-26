# Règles CSS / Thème — QuizApp Frontend

> Ce fichier définit les règles obligatoires pour tout nouveau composant ou modification de style dans le projet Angular.

---

## 1. Aucune couleur en brut (hardcoded)

**INTERDIT :**
```scss
color: #333;
background: #fff;
border: 1px solid #e2e8f0;
background: rgba(239, 68, 68, 0.1);
```

**CORRECT :**
```scss
color: var(--text-primary);
background: var(--background);
border: 1px solid var(--border);
background: rgba(var(--error-rgb), 0.1);
```

### Variables de couleurs disponibles

| Variable | Light | Dark | Usage |
|---|---|---|---|
| `--primary` | #6B46C1 | (inchangé) | Couleur principale |
| `--primary-dark` | #553C9A | (inchangé) | Hover sur primary |
| `--primary-light` | #8B5CF6 | (inchangé) | Variante claire |
| `--primary-rgb` | 107, 70, 193 | 139, 92, 246 | Pour `rgba()` |
| `--secondary` | #EC4899 | (inchangé) | Couleur secondaire |
| `--accent` | #10B981 | (inchangé) | Couleur accent |
| `--success` | #10B981 | (inchangé) | Statut succès |
| `--warning` | #F59E0B | (inchangé) | Statut attention |
| `--error` | #EF4444 | (inchangé) | Statut erreur |
| `--error-rgb` | 239, 68, 68 | 239, 68, 68 | Pour `rgba()` |
| `--info` | #3B82F6 | (inchangé) | Statut info |
| `--success-rgb` | 16, 185, 129 | 16, 185, 129 | Pour `rgba()` |

---

## 2. Backgrounds et surfaces

**INTERDIT :** `--bg-primary`, `--bg-secondary`, `--bg-tertiary`, `--bg-hover` (n'existent pas)

| Variable | Light | Dark | Usage |
|---|---|---|---|
| `--background` | #FFFFFF | #0F172A | Fond principal |
| `--surface` | #F8FAFC | #1E293B | Surface carte/panneau |
| `--surface-secondary` | #F1F5F9 | #283649 | Surface secondaire |
| `--surface-variant` | #F1F5F9 | #334155 | Surface variante |
| `--surface-hover` | rgba(0,0,0,0.04) | rgba(255,255,255,0.04) | État hover |
| `--surface-pressed` | rgba(0,0,0,0.08) | rgba(255,255,255,0.08) | État pressé |
| `--white` | #FFFFFF | #F8FAFC | Blanc (adapté au thème) |
| `--primary-surface` | rgba(primary, 0.08) | rgba(primary, 0.12) | Surface teintée primary |

---

## 3. Textes

**INTERDIT :** `color: #333`, `color: #666`, `color: black`

| Variable | Light | Dark | Usage |
|---|---|---|---|
| `--text-primary` | #1E293B | #F8FAFC | Texte principal |
| `--text-secondary` | #64748B | #CBD5E1 | Texte secondaire |
| `--text-tertiary` | #94A3B8 | #94A3B8 | Texte tertiaire |
| `--text-disabled` | #94A3B8 | #64748B | Texte désactivé |
| `--text-on-primary` | #FFFFFF | #FFFFFF | Texte sur fond primary |

---

## 4. Bordures

**INTERDIT :** `--border-color` (n'existe pas)

| Variable | Light | Dark | Usage |
|---|---|---|---|
| `--border` | #E2E8F0 | #334155 | Bordure standard |
| `--border-variant` | #CBD5E1 | #475569 | Bordure variante |
| `--border-hover` | #CBD5E1 | #64748B | Bordure hover |
| `--divider` | #F1F5F9 | #1E293B | Séparateur |

---

## 5. Polices de caractères

**INTERDIT :**
```scss
font-family: 'Inter', sans-serif;
font-size: 14px;
font-size: 0.875rem;
font-weight: 600;
```

**CORRECT :**
```scss
font-family: var(--font-family);
font-size: var(--font-size-base);
font-size: var(--font-size-sm);
font-weight: var(--font-weight-semibold);
```

### Tailles de police disponibles

| Variable | Valeur | Usage typique |
|---|---|---|
| `--font-size-xs` | 0.75rem (12px) | Badges, labels petits |
| `--font-size-sm` | 0.875rem (14px) | Texte secondaire, boutons |
| `--font-size-base` | 1rem (16px) | Texte courant |
| `--font-size-lg` | 1.125rem (18px) | Sous-titres |
| `--font-size-xl` | 1.25rem (20px) | Titres de section |
| `--font-size-2xl` | 1.5rem (24px) | Titres de page |
| `--font-size-3xl` | 1.875rem (30px) | Grands titres |
| `--font-size-4xl` | 2.25rem (36px) | Titres héros |

### Épaisseurs de police

| Variable | Valeur |
|---|---|
| `--font-weight-light` | 300 |
| `--font-weight-normal` | 400 |
| `--font-weight-medium` | 500 |
| `--font-weight-semibold` | 600 |
| `--font-weight-bold` | 700 |
| `--font-weight-extrabold` | 800 |

---

## 6. Espacements (padding, margin, gap)

**INTERDIT :**
```scss
padding: 16px;
margin: 8px 12px;
gap: 6px;
```

**CORRECT :**
```scss
padding: var(--spacing-lg);
margin: var(--spacing-sm) var(--spacing-md);
gap: var(--spacing-sm);
```

### Espacements disponibles

| Variable | Valeur | Équivalent px |
|---|---|---|
| `--spacing-xs` | 0.25rem | 4px |
| `--spacing-sm` | 0.5rem | 8px |
| `--spacing-md` | 1rem | 16px |
| `--spacing-lg` | 1.5rem | 24px |
| `--spacing-xl` | 2rem | 32px |
| `--spacing-2xl` | 3rem | 48px |
| `--spacing-3xl` | 4rem | 64px |

> **Note :** Pour des valeurs intermédiaires (6px, 10px, 14px...), utiliser la variable la plus proche.

---

## 7. Border-radius

**INTERDIT :** `border-radius: 8px;`

| Variable | Valeur |
|---|---|
| `--radius-sm` | 0.25rem (4px) |
| `--radius-md` | 0.375rem (6px) |
| `--radius` | 0.5rem (8px) |
| `--radius-lg` | 0.75rem (12px) |
| `--radius-xl` | 1rem (16px) |
| `--radius-2xl` | 1.5rem (24px) |
| `--radius-full` | 9999px (cercle) |

---

## 8. Ombres (box-shadow)

**INTERDIT :** `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);`

| Variable | Usage |
|---|---|
| `--shadow-sm` | Ombre légère |
| `--shadow` | Ombre standard |
| `--elevation-1` | Carte posée |
| `--elevation-2` | Carte surélevée / dropdown |
| `--elevation-3` | Modal |
| `--elevation-4` | Popup important |
| `--elevation-5` | Tooltip / notification |

---

## 9. Transitions

**INTERDIT :** `transition: all 0.15s;`

| Variable | Valeur |
|---|---|
| `--transition-fast` | all 0.15s ease-in-out |
| `--transition` | all 0.2s ease-in-out |
| `--transition-slow` | all 0.3s ease-in-out |

---

## 10. Z-index

**INTERDIT :** `z-index: 100;` ou toute valeur arbitraire.

| Variable | Valeur | Usage |
|---|---|---|
| `--z-dropdown` | 1000 | Menus déroulants |
| `--z-sticky` | 1020 | Headers sticky |
| `--z-fixed` | 1030 | Éléments fixes |
| `--z-modal-backdrop` | 1040 | Fond modal |
| `--z-modal` | 1050 | Modals |
| `--z-popover` | 1060 | Popovers |
| `--z-tooltip` | 1070 | Tooltips |

---

## 11. Nouvelles variables CSS

Si une variable n'existe pas dans le thème, **NE PAS l'inventer**.

**Règle :** Toute nouvelle variable CSS doit :
1. Être définie dans `:root` (light mode) ET `.dark-mode` dans le fichier `src/styles/core/colors.css` ou `surfaces.css`
2. Avoir une valeur cohérente pour les deux thèmes
3. Suivre la convention de nommage existante (`--catégorie-variante`)

**Variables qui N'EXISTENT PAS (erreurs fréquentes) :**
- ~~`--border-color`~~ → utiliser `--border`
- ~~`--bg-primary`~~ → utiliser `--background`
- ~~`--bg-secondary`~~ → utiliser `--surface` ou `--surface-secondary`
- ~~`--bg-tertiary`~~ → utiliser `--surface-variant`
- ~~`--bg-hover`~~ → utiliser `--surface-hover` ou `--hover`
- ~~`--color-primary`~~ → utiliser `--primary`
- ~~`--color-primary-rgb`~~ → utiliser `--primary-rgb`

---

## 12. Pipe `date` — ne pas re-formater une date déjà formatée

**Cause du bug :** Le backend (MapStruct avec `@Mapping(dateFormat = "dd/MM/yyyy")`) renvoie les dates **déjà sous forme de chaîne** `"29/03/2026"`. Angular's `DatePipe` attend un objet `Date`, un timestamp numérique ou une chaîne ISO 8601 — pas une chaîne `dd/MM/yyyy`. Appliquer `| date:'dd/MM/yyyy'` sur cette valeur provoque l'erreur :
```
NG02302: Unable to convert "29/03/2026" into a date
```
Cela **crash le rendu du `@for`** → seul le premier élément s'affiche, les suivants n'apparaissent qu'après rechargement.

**INTERDIT :**
```html
<!-- backend renvoie déjà "29/03/2026" → ERREUR RUNTIME -->
{{ item.createdAt | date:'dd/MM/yyyy' }}
{{ (item.dateCreation || item.createdAt) | date:'dd/MM/yyyy' }}
```

**CORRECT :**
```html
<!-- si le backend formate déjà la date, afficher directement -->
{{ item.createdAt }}
{{ item.dateCreation || item.createdAt }}

<!-- si le backend renvoie un timestamp ou une date ISO, alors pipe OK -->
{{ item.createdAt | date:'dd/MM/yyyy' }}
```

**Règle :** Avant d'utiliser `| date`, vérifier le format renvoyé par l'API (Swagger / Postman). Si c'est déjà une chaîne `dd/MM/yyyy`, **ne pas piper**.

---

## 13. Fichiers de référence

Les variables sont définies dans :
- `src/styles/core/variables.css` — typographie, spacing, radius, transitions, z-index
- `src/styles/core/colors.css` — couleurs, textes, bordures, ombres (light + dark)
- `src/styles/core/surfaces.css` — surfaces, élévations, overlays (light + dark)

---

## Résumé rapide

| Catégorie | INTERDIT | UTILISER |
|---|---|---|
| Couleurs | `#fff`, `#333`, `rgb(...)` | `var(--text-primary)`, `var(--background)` |
| Fond | `--bg-primary` | `var(--background)`, `var(--surface)` |
| Bordure | `--border-color` | `var(--border)` |
| Primary | `--color-primary` | `var(--primary)` |
| Police | `14px`, `600` | `var(--font-size-sm)`, `var(--font-weight-semibold)` |
| Espacement | `16px`, `8px` | `var(--spacing-lg)`, `var(--spacing-sm)` |
| Rayon | `8px` | `var(--radius)` |
| Ombre | `0 4px 12px rgba(...)` | `var(--elevation-2)` |
| Transition | `all 0.15s` | `var(--transition-fast)` |
| Z-index | `100`, `999` | `var(--z-dropdown)` |
| Pipe date | `\| date:'dd/MM/yyyy'` sur string déjà formatée | afficher la valeur directement `{{ maDate }}` |
