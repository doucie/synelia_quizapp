# Registre des corrections demandées (collab Claude)

> Répartition assumée : Claude = lisibilité et théorie (ses diagrammes
> doivent rester compréhensibles sans ambiguïté) ; moi = exactitude
> technique sourcée (code réel, fichier:ligne) ; l’arbitrage appartient au
> demandeur. Une correction `demandée` n’est appliquée qu’après arbitrage
> (`arbitrée-retenue` → `appliquée`). `arbitrée-rejetée` = version Claude
> gardée en connaissance de cause, sans y revenir.
>
> Les corrections dormantes de `../verification.md` (extend-notif, Super
> admin, endpoints réels, états enum…) y entreront au fil des lots sous le
> même format, avec renvoi — pas de doublon.

## Statuts

`demandée` → `arbitrée-retenue` / `arbitrée-rejetée` (demandeur) → `appliquée` (build).

## Corrections

### C-01 — UC candidat v2 : cas « S’authentifier par code » supprimé

- **Figure** : `results_claude/cas_utilisation_candidat_v2.svg` (remplace « Suivre sa candidature »).
- **Demandé** : réintégrer le cas (facteur commun de Suivre / Demander /
  Retirer), ou justifier sa suppression.
- **Motif technique** : le code de suivi (6 majuscules) + email est exigé
  pour le suivi (`ApplicationsBusiness.java:4165-4207`), le retrait
  (`:3838-3883`) et les demandes (`submitTrackedCandidateAsk`) — sans ce
  cas, trois includes du brief n’ont plus de cible.
- **Version Claude** : « Suivre sa candidature » à la place (cas réel,
  `/track`, pertinent — mais pas un facteur commun).
- **Statut** : `demandée`.

### C-02 — UC candidat v2 : condition « [candidat indisponible] »

- **Figure** : `results_claude/cas_utilisation_candidat_v2.svg` (l.27,
  `«extend»` de « Demander une autre date » vers « Répondre »).
- **Demandé** : remplacer par `[autre date souhaitée]`.
- **Motif technique** : aucune notion de « candidat indisponible » dans le
  code ; le réel est `REQUEST_RESCHEDULE` = le candidat propose une autre
  date (`ApplicationsBusiness.java:4129`, réponse `CANCELLED` + replanification).
- **Version Claude** : `[candidat indisponible]`.
- **Statut** : `demandée`.

### C-03 — UC candidat v2 : ajouts « Consulter les campagnes » et « Suivre sa candidature »

- **Figure** : `results_claude/cas_utilisation_candidat_v2.svg`.
- **Demandé** : confirmation (pas une correction — pencherait pour garder).
- **Motif technique** : les deux sont réels (`GET
  /campaigns/public/getAvailable`, `POST /applications/track`) et le total
  (10 cas) reste dans la limite règle 13 (10-15).
- **Version Claude** : ajouts non demandés par le brief.
- **Statut** : `demandée`.
