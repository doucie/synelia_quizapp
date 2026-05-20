# Modele De Fiche Page

## 1. Identite

- Route:
- Guard / permission:
- Fichier TS:
- Fichier HTML:
- Services utilises:
- Routes voisines:

## 2. Objectif Produit

- A quoi sert la page pour l'utilisateur.
- Quelle action ou quel pilotage elle doit permettre.

## 3. Etat Constate

- [ ] Ce qui est deja visible et fonctionnel.
- [ ] Ce qui semble incomplet.
- [ ] Ce qui doit etre verifie manuellement.

## 4. Blocs UI Constates

### 4.1 Header

- [ ] Titre / sous-titre
- [ ] Compteurs / badges
- [ ] Boutons d'action

### 4.2 Filtres / recherche

- [ ] Recherche texte
- [ ] Filtres par statut / categorie / campagne / autre
- [ ] Reset filtres

### 4.3 Contenu principal

- [ ] Liste / cartes / tableau
- [ ] Etat vide
- [ ] Etat loading
- [ ] Vue detail / modal / panneau secondaire

### 4.4 Navigation et sorties

- [ ] Boutons qui changent de route
- [ ] Fragments ou query params pris en charge
- [ ] Retour ou redirection importante

## 5. Donnees Affichees

- Champs visibles bloc par bloc
- Compteurs calcules
- Donnees derivees cote front

## 6. Services Et Endpoints

- `Service.method()` -> `METHOD /endpoint`
- Format de reponse attendu (`item`, `items`, `content`, pagination, etc.)
- Enrichissements croises entre services

## 7. Ce Que Le Backend Doit Envoyer

- Champs minimum par item
- Meta de pagination / comptage
- Permissions ou drapeaux d'action
- Etats / enums normalises
- Relations deja resolues ou IDs suffisants pour les resoudre cote front

## 8. Entites Metier Impliquees

- Table ou entite principale
- Tables ou entites annexes
- Dependances implicites (permissions, historique, tokens, progression, etc.)

## 9. Ecarts Et Questions Ouvertes

- [ ] Ambiguites fonctionnelles
- [ ] Contrats backend pas assez explicites
- [ ] Cas limites non qualifies

## 10. Recette Manuelle

1. Ouvrir la page avec un role autorise.
2. Verifier les blocs visibles.
3. Tester chaque filtre majeur.
4. Tester au moins une action principale.
5. Verifier l'etat vide et l'etat erreur si possible.
6. Noter les donnees backend manquantes ou incoherentes.