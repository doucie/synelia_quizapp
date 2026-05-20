# Dashboard Shell

## 1. Identite

- Route: `/dashboard`
- Guard: `authGuard`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/dashboard.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/dashboard.html`
- Fonction: shell partage avec sidebar, header, notifications et `RouterOutlet`

## 2. Etat Constate

- [x] Le dashboard sert de layout principal pour les pages connectees.
- [x] Le shell pilote la sidebar pliable, le menu utilisateur et le theme.
- [x] Le shell contient les categories de navigation `accueil`, `recrutement`, `donnees`, `administration`, `systeme`.
- [x] Les entrees de menu portent deja des permissions explicites cote front.
- [x] Le shell gere aussi le dropdown `entities` et les notifications.
- [ ] Verifier que toutes les permissions de menu sont strictement alignees avec les guards de routes.
- [ ] Verifier le comportement exact du shell quand aucun droit ne correspond a une entree.

## 3. Blocs UI A Cartographier Dans Chaque Fiche Fille

- [x] Sidebar et categories de menu
- [x] Bouton de collapse / expand
- [x] Header utilisateur
- [x] Notifications
- [x] Menu avatar
- [x] Theme toggle
- [x] Zone `RouterOutlet`

## 4. Entrees De Menu Observees

### 4.1 Recrutement

- `overview`
- `campaigns`
- `candidates`
- `interviews`
- `evaluations`
- `decisions`

### 4.2 Donnees

- `users`
- `departments`
- `specialities`
- `questions`
- `answers`
- `pipeline-templates`

### 4.3 Administration / Systeme

- `system-role-permissions`
- `business-groups`
- `user-permissions`
- `entities`
- `merise`
- `settings`

## 5. Ce Que Le Backend Doit Envoyer Au Shell

- Identite utilisateur connecte: `id`, `firstName`, `lastName`, `email`, `role`.
- Permissions effectives ou infos suffisantes pour les deduire correctement.
- Notifications utilisateur lisibles par le front.
- Etat de session exploitable par le header si necessaire.
- Rien de serveur n'est requis pour le simple collapse de sidebar ou le toggle local du theme.

## 6. Questions A Garder En Tete

- [ ] Les permissions front de menu suffisent-elles ou faut-il un endpoint profile/permissions consolide ?
- [ ] Les notifications du shell sont-elles purement decoratives ou contractuelles ?
- [ ] Le menu `entities` doit-il etre documente comme une page a part ou comme une famille de pages ?