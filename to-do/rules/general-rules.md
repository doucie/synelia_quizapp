# Règles à respecter

- Séparer optimalement frontend (`/quizapp_front`) et backend (`/quizapp`)
- S'assurer que le code soit optimisé
- Créer une migration MySQL si nécessaire
- Mettre à jour les checklists au fur et à mesure
- Interdiction d'utiliser des couleurs autres que celles qui sont dans les variables existantes
- Interdiction d'utiliser des couleurs en dur, utiliser les variables de couleur présentes
- Les pages doivent être responsives
- Regarder l'existant avant de créer quelque chose : si quelque chose de similaire existe déjà, faire la même chose
  - Backend : les endpoints se répètent (même pattern pour chaque controller)
  - Backend : respecter aussi `to-do/rules/to-do-rules-back.md` pour la structure, les APIs de base et les garde-fous anti-spaghetti
  - Frontend : réutiliser les pages, boutons, styles existants — pattern `EntityCrudBase`
- Convention update partiel : `""` → ignorer, `null` → mettre à null, autre → mettre à jour
- Convention API : tout en POST, jamais de GET/PUT/DELETE
- Frontend : envoyer `null` au lieu de `""` quand un champ est vide
