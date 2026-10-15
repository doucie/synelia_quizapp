# Échange collab — Lot 1 quater : 3 questions de suivi → réponses (à envoyer à Claude)

> Suite de `lot1_qa3_reponses.md`. Mêmes conventions : questions recopiées
> telles quelles, faits sourcés `fichier:ligne`, `NON TROUVÉ` écrit en
> toutes lettres, rien d’inventé.
>
> ## Principe de lecture (consigne du demandeur, à appliquer aux diagrammes)
>
> « Certains points nécessitent une interprétation logique et non physique.
> L’application est présentable mais ni finie ni parfaite : il faut tenir
> compte de la réalité, mais la corriger quand elle est complètement
> illogique. On a des bugs, mais on ne va pas copier ces erreurs de codage
> dans le mémoire comme si elles étaient correctes. »
>
> Concrètement ci-dessous : chaque réponse donne la **réalité du code**,
> puis l’**interprétation logique à modéliser** quand les deux divergent.
> Un bug ne devient jamais un cas d’utilisation.

---

## Q1. Quel endpoint appelle /mot-de-passe-oublie, et ça marche sans connexion ?

> Quel endpoint appelle la page /mot-de-passe-oublie du front (composant et service Angular), et avec quels paramètres ? Cet appel fonctionne-t-il pour un utilisateur non connecté, compte tenu de SecurityConfig ?

- **Réalité : aucun appel.** Le composant est une coquille vide, sans
  logique ni service (`quizapp_front/src/app/pages/mot-de-passe-oublie/
  mot-de-passe-oublie.ts:1-12`, simple décorateur). Le HTML est statique :
  « Cette fonctionnalité sera disponible prochainement. Veuillez contacter
  votre administrateur système. » (`mot-de-passe-oublie.html:1-8`). La route
  existe (`app.routes.ts`, `noAuthGuard`) mais ne déclenche rien.
- Même si elle appelait `POST /userManager/reinitialiserMotDePasse`, ça
  échouerait sans connexion : endpoint NON whitelisté
  (`config/SecurityConfig.java:56,64` ne citent que `connexion` et
  `registerWithCode`), donc `anyRequest().authenticated()` (`:69`) rejette
  l’anonyme.
- **Interprétation logique à modéliser** : le flux prévu existe côté
  métier (demande par email → mot de passe généré 8 car. → template
  `PASSWORD_RESET`, `UserManagmentBusiness.java:390-511`). Le diagramme
  montre ce flux comme **cas public** (« Demander un nouveau mot de
  passe »), pas la page coquille ni le 401.

## Q2. Qui appelle reinitialiserMotDePasse ? L’admin peut-il réinitialiser un autre ?

> Qui appelle POST /userManager/reinitialiserMotDePasse dans le front (quel écran, quel rôle) ? L'admin peut-il réinitialiser le mot de passe d'un autre utilisateur ?

- **Personne.** Grep `reinitialiserMotDePasse` dans `quizapp_front/src` :
  **NON TROUVÉ** (aucun écran, aucun service, aucun rôle ne l’appelle).
- Endpoint : `POST /userManager/reinitialiserMotDePasse`
  (`user/managment/UserManagmentController.java:176-178`, authentifié, sans
  `@PreAuthorize` sur le contrôleur — que des `@RequestMapping`).
- Le métier prend **l’email du DTO** (`findByEmail`, `UserManagmentBusiness.
  java:408`), sans imposer l’identité de l’appelant (contrairement à
  `changerMotDePasse`, même-id exigé `:307-312`).
- **Donc oui : un admin (en pratique tout authentifié) peut réinitialiser
  le mot de passe d’un autre utilisateur** en fournissant son email.
- **Interprétation logique à modéliser** : cas « Réinitialiser le mot de
  passe (admin) » côté gouvernance ; le flux « mot de passe oublié »
  public relève de Q1, pas de cet endpoint en l’état.

## Q3. Valeurs de campaign_status et progress_status

> Quelles sont les valeurs possibles de campaigns.campaign_status et de application_progress.progress_status, avec l'enum et fichier:ligne ?

- `campaign_status` : `DRAFT, PENDING, OPEN, PAUSED, CLOSED`
  (`quizapp/.../utils/enums/CampaignStatus.java:3-8`), avec matrice de
  transitions `canTransitionTo` (`:20-35`) : DRAFT → PENDING/OPEN/CLOSED ;
  PENDING → OPEN/DRAFT/CLOSED ; OPEN → PAUSED/DRAFT/CLOSED ; PAUSED →
  OPEN/DRAFT/CLOSED ; CLOSED → DRAFT/PENDING/OPEN.
- `progress_status` : `PENDING, IN_PROGRESS, AWAITING_VALIDATION,
  COMPLETED, FAILED, SKIPPED`
  (`quizapp/.../utils/enums/ProgressStatus.java:3-9`). Rappel :
  `AWAITING_VALIDATION` défini mais **jamais posé** en code (normalisation
  et affichage seuls) — à dessiner en pointillés/non piloté ou à omettre.
