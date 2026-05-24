# BL-009 - Cloture de l'audit des routes

## Conclusion

- Aucune route frontend inutile n'a ete identifiee.
- La dualite `dashboard/entities/*` vs `dashboard/*` est volontaire et correspond bien a la separation entre surface technique `super-admin` et page metier.
- Les seules anomalies observees pendant l'audit relevaient du surfacing sidebar, pas d'un besoin de supprimer des pages.
- Le sujet routes / permissions est de-priorise pour l'instant: le focus doit revenir au fonctionnement normal des pages.

## Ce qui a ete verifie

- les routes raw `dashboard/entities/*` ont bien des points d'entree via le hub `Gestion des Entites`;
- les routes contextuelles (`:page`, `new/edit/detail`, `dashboard/evaluate`, `postuler/:sourceToken`, `verify-email/:token`, `quiz/:applicationId/:quizToken`) ont un usage reel;
- `/home` et `/campaigns` ressemblent a des aliases de compatibilite, pas a des routes a supprimer.

## Ajustement fait pendant l'audit

- les entrees sidebar `Questions`, `Reponses` et `Groupes metiers` ont ete alignees sur les permissions reellement utilisees par le front;
- cela corrigeait un probleme de navigation, pas un probleme d'utilite produit.

## Decision

- aucune suppression ni deprecation de route n'est a lancer dans BL-009;
- aucune reanalyse routes prioritaire n'est a poursuivre maintenant;
- le chantier prioritaire redevient la verification du fonctionnement normal des pages dans leurs flux CRUD et metier.

## Suite

- garder ce document comme cloture de BL-009;
- traiter plus tard, si besoin, les sujets fins de permissions et de navigation.
