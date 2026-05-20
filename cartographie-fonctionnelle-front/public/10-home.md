# Public Home

## 1. Identite

- Route: `/`
- Guard: aucun
- Fichier TS: `quizapp_front/src/app/pages/home/home.ts`
- Fichier HTML: `quizapp_front/src/app/pages/home/home.html`

## 2. Objectif Produit

La page sert de porte d'entree publique minimale vers la plateforme de recrutement, en orientant surtout vers la reprise de candidature.

## 3. Etat Constate

- [x] La page est entierement statique, sans chargement de donnees backend.
- [x] Le hero presente la plateforme comme outil de recrutement / quiz.
- [x] Deux CTA principaux sont visibles.
- [x] Les deux CTA redirigent actuellement vers `/suivre-candidature`.
- [x] Les cartes visuelles de droite sont demonstratives et non alimentees par de vraies donnees.
- [ ] Verifier si le CTA `Acceder aux Quiz` doit vraiment pointer vers le suivi de candidature.
- [ ] Verifier si cette page doit aussi orienter vers `/campagnes` maintenant que le code source est la vraie entree publique de candidature.

## 4. Blocs UI Constates

### 4.1 Hero

- [x] titre `Synelia Quiz Platform`
- [x] accroche `Recruitment Tool`
- [x] texte d'introduction court

### 4.2 Actions

- [x] bouton `Suivre ma Candidature`
- [x] bouton `Acceder aux Quiz`

### 4.3 Illustration

- [x] carte `Developpeur Frontend`
- [x] carte `Resultats Live`

## 5. Donnees Affichees Ou Editees

- contenus statiques seulement

## 6. Services Et Endpoints

- aucun appel frontend constate

## 7. Ce Que Le Backend Doit Envoyer

- Aucun contrat backend n'est requis aujourd'hui pour cette page.
- Si la home devient dynamique, il faudra definir une source de verite claire pour les CTA publics, le branding et les chiffres mis en avant.

## 8. Entites Metier Impliquees

- aucune entite metier directement chargee

## 9. Questions Ou Ecarts A Qualifier

- [ ] Le lien principal doit-il plutot orienter vers `/campagnes` pour respecter le nouveau flux source-token ?
- [ ] Les statistiques et cartes de droite doivent-elles rester purement illustratives ?

## 10. Recette Manuelle

1. Ouvrir `/` sans etre connecte.
2. Verifier l'affichage du hero et des deux CTA.
3. Cliquer `Suivre ma Candidature` puis verifier la navigation.
4. Cliquer `Acceder aux Quiz` puis verifier la destination reelle.
