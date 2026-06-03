# Notes — Corrections et ajustements à faire sur le mémoire

Date : 2026-06-02
Fichier concerné : `z_mémoire/template_memoire/typst/` (theme.typ, body.typ, frontmatter.typ)

---

## 🔴 Bloquant / À faire impérativement

### Fig. 1 – Organisation Synelia
- **Problème** : La figure actuelle n'est pas bonne.
- **Action** : Remplacer `organisation_synelia.png` par une version corrigée plus tard.

### Glossaire
- **Problème** : Présentation peu engageante, difficile à lire.
- **Action** : Revoir la mise en forme du glossaire (espacement, lisibilité).

### Sommaire, Glossaire, Bibliographie & Table des matières
- **Action** : Mettre à jour après avoir terminé toutes les modifications du corps du mémoire.

### Bibliographie
- **Action** : Ajouter une bibliographie dans le mémoire.

### Captures d'écran de l'application
- **Action** : Ajouter des captures de l'interface (candidat, recruteur, admin) dans le mémoire.

### Dispositions anti-triche
- **Action** : Vérifier qu'on mentionne quelque part les mécanismes anti-triche (quiz token, time elapsed snapshot, etc.).

---

## 🟡 Tableaux

### Hauteur minimale des cellules
- **Problème** : Les cellules des tableaux sont trop écrasées.
- **Action** : Augmenter la hauteur minimale des cellules (`inset` vertical dans `set table()` du `theme.typ`).

### Taille de police dans les tableaux
- **Problème** : Le texte dans les tableaux semble avoir une police plus grande que le texte hors tableaux (à vérifier).
- **Action** : Si confirmé, uniformiser la taille de police tableaux ↔ corps du texte.

### Tableau §3.1.1 – Parties prenantes
- **Problème** : Le tableau est coupé après la première ligne (saut de page disgracieux).
- **Problème** : Des textes comme « Administrateur » et « Super administrateur » débordent de leurs colonnes et entrent en collision avec la colonne suivante.
- **Action** : Empêcher le débordement de texte dans TOUS les tableaux (ajuster `columns` ou utiliser des retours à la ligne forcés).

### Tableaux longs (> 3 lignes)
- **Problème** : Les tableaux de plus de 3 lignes avec du contenu volumineux sont peu esthétiques.
- **Piste** : Réduire la police dans les tableaux, ou éviter les tableaux de plus de 3 lignes s'ils n'ont pas de petits contenus.

---

## 🟠 Mise en page générale

### Aération du mémoire
- **Problème** : Le texte et les éléments semblent trop collés les uns aux autres.
- **Action** : Augmenter légèrement les espacements (paragraphes, interlignes, marges) sans exagérer — juste « faire respirer ».

### Marges des titres x.x.x
- **Action** : Ajouter un peu plus de `margin-top` sur les headings de niveau 3 (sous-sections).

### Margin bottom après les figures
- **Action** : Ajouter un espace (margin bottom) après chaque `Fig. x. – ...` (légende de figure).

### Espaces vides entre deux images
- **Problème** : Quand deux images se suivent, l'une reste sur la page et l'autre descend, créant un vide inesthétique.
- **Action** : Intercaler du texte entre deux images consécutives pour éviter ce vide.

---

## 🟢 Contenu

### §3.5 Priorisation des besoins
- **Problème** : « Tableaux de bord avancés ; export de données ; raffinements de diffusion et de reporting. » est classé en *Could have*.
- **Action** : Reclasser en **Must have**.

### §4.2.2 MCD et suivants — Figures codées en Typst
- **Action** : À partir de §4.2.2 (Modèle Conceptuel de Données), remplacer TOUTES les figures codées en Typst (merise-figure, merise-row, etc.) par les PNG équivalents de `z_mémoire/figures_html/captures/`.

### §6.3 Implémentation du frontend
- **Action** : Supprimer toute mention de `z_notes/`, `cartographies`, `z_mémoire` ou tout autre dossier/fichier ne participant pas à l'exécution de l'application.

---

## ✅ Fait récemment

- [x] Diviser les diagrammes MCD, MLD, MPD, MCT, SAT, UC, Arch, Classes, Séquences
- [x] Créer la couverture avec logos ENSIT, Ministère, Synelia
- [x] Page de garde = couverture (identiques)
- [x] Année académique hors du bloc auteur/encadrement
- [x] Retirer tous les blocs `note-box` d'aide à la rédaction
- [x] Intégrer les 33 captures PNG dans le Typst



