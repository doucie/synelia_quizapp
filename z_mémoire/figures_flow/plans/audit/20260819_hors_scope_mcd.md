# Entités et attributs hors-scope du MCD

> Date : 2026-08-19
> Contexte : modélisation Merise du projet QuizApp

---

## Principe

Le MCD (Modèle Conceptuel de Données) modélise les **entités métier** et leurs **associations conceptuelles**. Certaines tables présentes en BD ne figurent pas dans le MCD car elles relèvent de l'**implémentation technique** ou posent des problèmes de conformité aux règles Merise.

---

## Entités exclues du MCD

### 1. EVENEMENT_AUDIT

| Attribut | Valeur |
|----------|--------|
| **Table BD** | `audit_events` |
| **Domaine MCD** | Utilisateurs & droits (anciennement Config système) |
| **Raison d'exclusion** | Détail d'implémentation, pas un concept métier |
| **Problème technique** | Attributs `type_entite` + `id_entite` = association polymorphique (polymorphic association) |
| **Règle Merise violée** | R8 — cohérence : une entité doit avoir des associations stables vers des entités concrètes |

**Justification détaillée :**

La table `audit_events` enregistre les actions de traçabilité (créations, modifications, suppressions) sur n'importe quelle entité du système. Le champ `type_entite` stocke le nom de la table et `id_entite` l'identifiant de l'enregistrement concerné.

En Merise, cette approche est problématique car :
- `id_entite` n'est pas une clé étrangère vers une entité unique — c'est une référence polymorphique
- L'association n'est pas stable : elle peut pointer vers n'importe quelle entité du MCD
- Les examinateurs refusent ce type de modélisation car il ne respecte pas les règles d'identification

**Traitement retenu :** L'audit est assuré par des triggers MySQL ou un mécanisme d'audit applicatif. Il sera documenté dans le mémoire au §implémentation, pas au §conception MCD.

---

### 2. PERMISSION_ENTITE

| Attribut | Valeur |
|----------|--------|
| **Table BD** | `entity_permissions` |
| **Domaine MCD** | Utilisateurs & droits |
| **Raison d'exclusion** | Attribut `id_entite` = clé polymorphique |
| **Problème technique** | `type_entite` + `id_entite` référencent dynamiquement n'importe quelle table |
| **Règle Merise violée** | R8 — cohérence globale |

**Justification détaillée :**

La table `entity_permissions` stocke des permissions au niveau individuel d'une entité spécifique (ex : permission sur une candidature précise). Le champ `id_entite` fait référence à l'identifiant de l'entité cible, mais sans FK formelle.

Cette table fait doublon avec `PERMISSION_UTILISATEUR` (permissions utilisateur) et `PERMISSION_GROUPE` (permissions groupe) qui sont de simples attributs fonctionnels.

**Traitement retenu :** Supprimée du MCD. Les permissions sont modélisées via `PERMISSION_UTILISATEUR` et `PERMISSION_GROUPE`.

---

## Attributs supprimés d'entités conservées

### 1. NOTIFICATION.utilisateur

| Attribut | Valeur |
|----------|--------|
| **Entité** | NOTIFICATION |
| **Attribut supprimé** | `utilisateur` |
| **Raison** | Clé étrangère interdite en MCD |

**Justification :** En Merise, les clés étrangères ne figurent pas au MCD. La relation entre UTILISATEUR et NOTIFICATION est portée par l'association `obtenir` (0,n / 1,1). La FK `utilisateur_id` sera ajoutée au niveau MLD/MPD.

---

### 2. TOKEN_VERIFICATION_EMAIL.email

| Attribut | Valeur |
|----------|--------|
| **Entité** | TOKEN_VERIFICATION_EMAIL |
| **Attribut supprimé** | `email` |
| **Raison** | Redondant avec CANDIDATURE.email |

**Justification :** Le token de vérification est toujours lié à une candidature via l'association `creer` (1,1 / 1,1). L'adresse email est déjà portée par l'entité CANDIDATURE. En Merise, la redondance d'attributs entre entités liées directement est évitée (règle de normalisation).

---

## Attributs déplacés entre domaines

### TEXTE_JURIDIQUE (Communication → Config système)

| Attribut | Valeur |
|----------|--------|
| **Déplacement** | De `communication.ts` vers `config_systeme.ts` |
| **Raison** | Cohérence métier : les textes juridiques dépendent de la configuration globale |

**Justification :** Les textes juridiques (CGU, mentions légales) sont paramétrés au niveau de la configuration système, pas dans le module de communication. Leur contenu est lu par les candidats mais généré par l'administration via CONFIGURATION.

---

## Récapitulatif

| Entité/Attribut | Type d'exclusion | Raison | Impact MLD/MPD |
|-----------------|------------------|--------|----------------|
| EVENEMENT_AUDIT | Entité exclue | Audit = implémentation, polymorphique | Présente en BD, pas en MCD |
| PERMISSION_ENTITE | Entité exclue | `id_entite` polymorphique | Supprimée (doublon) |
| NOTIFICATION.utilisateur | Attribut supprimé | FK interdite en MCD | Ajouté comme FK au MLD/MPD |
| TOKEN_VERIFICATION_EMAIL.email | Attribut supprimé | Redondant avec CANDIDATURE.email | Non ajouté au MLD/MPD |
| TEXTE_JURIDIQUE | Entité déplacée | Cohérence métier | Même table, même schéma |
