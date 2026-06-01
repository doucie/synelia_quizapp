# Squelette Typst du memoire

Ce dossier contient un squelette Typst modulaire pour le memoire de fin d'etudes du projet SyneliaQuizApp.

## Fichiers

- `main.typ` : point d'entree du document
- `theme.typ` : style global, helpers visuels et fonctions reutilisables
- `sections/frontmatter.typ` : couverture, page de garde, remerciements, resume, sommaire, avant-propos, glossaire
- `sections/body.typ` : introduction, quatre parties et neuf chapitres
- `sections/backmatter.typ` : conclusion, references, annexes, table des matieres

## Utilisation

1. Ouvrir `main.typ` dans Tinymist.
2. Remplir d'abord le bloc `meta` dans `main.typ`.
3. Rediger ensuite les chapitres directement dans les fichiers du dossier `sections`.

Si la commande CLI Typst est disponible, compilation possible avec :

```powershell
typst compile .\main.typ .\memoire.pdf
```

## Ligne editoriale retenue

- mise en page sobre et lisible
- palette discrete bleu-gris
- hierarchie visuelle nette sans effet flashy
- structure conforme a l'ordre impose par les consignes du memoire

## Suite logique

L'etape suivante recommandee consiste a rediger d'abord :

1. le chapitre 5
2. le chapitre 6
3. le chapitre 3
4. le chapitre 4

Une fois ces chapitres stabilises, il sera plus simple de finaliser l'introduction, la conclusion, le resume et l'abstract.