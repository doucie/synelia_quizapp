# Notes — Corrections et ajustements à faire sur le mémoire

Date : 2026-06-02
Fichier concerné : `z_mémoire/template_memoire/typst/` (theme.typ, body.typ, frontmatter.typ)

---

## 🔴 Bloquant / À faire impérativement

### Fig. 1 – Organisation Synelia
- [x] **Problème** : La figure actuelle n'est pas bonne.
- [x] **Action** : Remplacer `organisation_synelia.png` par une version corrigée plus tard.

### Glossaire
- [x] **Problème** : Présentation peu engageante, difficile à lire.
- [x] **Action** : Revoir la mise en forme du glossaire (espacement, lisibilité).
  → Amélioré via l'aération générale (par spacing 1.18→1.28em, leading 0.82→0.88em) et la police réduite dans les tableaux (10.5pt).

### Sommaire, Glossaire, Bibliographie, Annexes & Table des matières
- [x] **Action** : Mettre à jour après avoir terminé toutes les modifications du corps du mémoire.
  → Sommaire et TDM générés automatiquement par Typst (`#outline`). Glossaire et bibliographie déjà complets. Annexes A (captures), B (doc API) et C (structure BD) rédigées. Dernier `note-box` d'aide supprimé.

### Bibliographie
- [x] **Action** : Ajouter une bibliographie dans le mémoire.
  → La bibliographie existe déjà dans backmatter.typ (références classées par domaine, avec citations).

### Captures d'écran de l'application
- [x] **Action** : Ajouter des captures de l'interface (candidat, recruteur, admin) dans le mémoire.

### Dispositions anti-triche
- [x] **Action** : Vérifier qu'on mentionne quelque part les mécanismes anti-triche (quiz token, time elapsed snapshot, etc.).
  → Section dédiée "Sécurisation du quiz et intégrité des évaluations" (ligne ~1316) : token, horodatage, temps écoulé, snapshot, détection d'inactivité.

---

## 🟡 Tableaux

### Hauteur minimale des cellules
- [x] **Problème** : Les cellules des tableaux sont trop écrasées.
- [x] **Action** : Augmenter la hauteur minimale des cellules (`inset` vertical dans `set table()` du `theme.typ`).
  → `inset: (x: 11pt, y: 12pt)` (y passé de 9pt à 12pt).

### Taille de police dans les tableaux
- [x] **Problème** : Le texte dans les tableaux semble avoir une police plus grande que le texte hors tableaux (à vérifier).
- [x] **Action** : Si confirmé, uniformiser la taille de police tableaux ↔ corps du texte.
  → Ajout de `set text(size: 10.5pt)` dans `show table.cell` (corps = 12.5pt, tableaux = 10.5pt).

### Tableau §3.1.1 – Parties prenantes
- [x] **Problème** : Le tableau est coupé après la première ligne (saut de page disgracieux).
- [x] **Problème** : Des textes comme « Administrateur » et « Super administrateur » débordent de leurs colonnes et entrent en collision avec la colonne suivante.
- [x] **Action** : Empêcher le débordement de texte dans TOUS les tableaux (ajuster `columns` ou utiliser des retours à la ligne forcés).
  → Police réduite à 10.5pt + inset augmenté à 12pt = cellules plus spacieuses et texte moins large.

### Tableaux longs (> 3 lignes)
- [x] **Problème** : Les tableaux de plus de 3 lignes avec du contenu volumineux sont peu esthétiques.
- [x] **Piste** : Réduire la police dans les tableaux, ou éviter les tableaux de plus de 3 lignes s'ils n'ont pas de petits contenus.
  → Police tableaux réduite à 10.5pt + espacement vertical augmenté (inset y=12pt).

---

## 🟠 Mise en page générale

### Aération du mémoire
- [x] **Problème** : Le texte et les éléments semblent trop collés les uns aux autres.
- [x] **Action** : Augmenter légèrement les espacements (paragraphes, interlignes, marges) sans exagérer — juste « faire respirer ».
  → `par(spacing: 1.28em)` (↑ depuis 1.18), `par(leading: 0.88em)` (↑ depuis 0.82).

### Marges des titres x.x.x
- [x] **Action** : Ajouter un peu plus de `margin-top` sur les headings de niveau 3 (sous-sections).
  → `show heading.where(level: 3): block(above: 1.7em)` (↑ depuis 1.3em).

### Margin bottom après les figures
- [x] **Action** : Ajouter un espace (margin bottom) après chaque `Fig. x. – ...` (légende de figure).
  → `show figure.caption: set block(below: 0.7em)` dans le template.

### Espaces vides entre deux images
- [x] **Problème** : Quand deux images se suivent, l'une reste sur la page et l'autre descend, créant un vide inesthétique.
- [x] **Action** : Intercaler du texte entre deux images consécutives pour éviter ce vide.
  → Chaque série de PNG MCD/MLD/MPD/SAT/MCT est précédée d'une phrase d'introduction. Le `below: 0.7em` sur les légendes aide aussi.

---

## 🟢 Contenu

### §3.5 Priorisation des besoins
- [x] **Problème** : « Tableaux de bord avancés ; export de données ; raffinements de diffusion et de reporting. » est classé en *Could have*.
- [x] **Action** : Reclasser en **Must have**.
  → Changé en `[Must have]` avec justification actualisée.

### §4.2.2 MCD et suivants — Figures codées en Typst
- [x] **Action** : À partir de §4.2.2 (Modèle Conceptuel de Données), remplacer TOUTES les figures codées en Typst (merise-figure, merise-row, etc.) par les PNG équivalents de `z_mémoire/figures_html/captures/`.
  → 5 blocs remplacés : MCD (5 PNG), MLD (5 PNG), MPD (5 PNG), SAT (2 PNG), MCT (3 PNG).

### §6.3 Implémentation du frontend
- [x] **Action** : Supprimer toute mention de `z_notes/`, `cartographies`, `z_mémoire` ou tout autre dossier/fichier ne participant pas à l'exécution de l'application.
  → Supprimé les lignes `z_notes/` et `z_mémoire/` du tableau d'organisation du workspace. Simplifié le paragraphe décrivant le workspace.

---

## ✅ Fait récemment

- [x] Diviser les diagrammes MCD, MLD, MPD, MCT, SAT, UC, Arch, Classes, Séquences
- [x] Créer la couverture avec logos ENSIT, Ministère, Synelia
- [x] Page de garde = couverture (identiques)
- [x] Année académique hors du bloc auteur/encadrement
- [x] Retirer tous les blocs `note-box` d'aide à la rédaction
- [x] Intégrer les 33 captures PNG dans le Typst



