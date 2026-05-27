# Question Ref Repair Strategy

## Objectif

Definir comment diagnostiquer et reparer des donnees historiques incoherentes autour de `question_ref` maintenant que :

- `QuestionBusiness.create(...)` genere toujours un `questionRef` cote serveur
- les CRUD generiques refusent toute mutation manuelle de `questionRef`
- les commandes metier de duplication/versionnement reutilisent le meme `question_ref` pour conserver la filiation logique

## Invariant cible

`question_ref` est un identifiant de filiation logique, pas un hash de contenu.

Cela implique :

- plusieurs lignes `question` peuvent legitimement partager un meme `question_ref`
- un changement structurel isole sur brouillon cree une nouvelle ligne `question` mais conserve le meme `question_ref`
- une incoherence ne se deduit donc pas du seul fait que plusieurs contenus partagent un meme `question_ref`

Les vraies anomalies a traiter sont plutot :

- `question_ref` nul, vide, ou manifestement invalide sur une ligne active
- une meme question logique "coupee" en plusieurs `question_ref` a cause d'une ancienne edition manuelle
- plusieurs questions sans lien metier regroupees par erreur sous un meme `question_ref` suite a une manipulation manuelle

## Diagnostic SQL minimal

### 1. Detecter les lignes sans `question_ref` exploitable

```sql
SELECT q.id, q.question_text, q.question_ref, q.is_deleted
FROM question q
WHERE COALESCE(q.is_deleted, 0) = 0
  AND (q.question_ref IS NULL OR TRIM(q.question_ref) = '');
```

### 2. Detecter les `question_ref` partages par plusieurs lignes actives

Ce resultat n'est pas un bug en soi, mais c'est la base de revue manuelle.

```sql
SELECT q.question_ref, COUNT(*) AS active_question_count
FROM question q
WHERE COALESCE(q.is_deleted, 0) = 0
  AND q.question_ref IS NOT NULL
  AND TRIM(q.question_ref) <> ''
GROUP BY q.question_ref
HAVING COUNT(*) > 1
ORDER BY active_question_count DESC, q.question_ref;
```

### 3. Projeter les usages par version de formulaire

Permet de distinguer une filiation legitime d'un regroupement suspect.

```sql
SELECT
    q.question_ref,
    q.id AS question_id,
    fv.id AS form_version_id,
    fv.version_number,
    f.id AS form_id,
    f.form_name,
    fq.question_order,
    q.question_text,
    q.question_type,
    q.question_chrono,
    q.score
FROM question q
JOIN form_questions fq
  ON fq.question_id = q.id
 AND COALESCE(fq.is_deleted, 0) = 0
JOIN form_version fv
  ON fv.id = fq.form_version_id
 AND COALESCE(fv.is_deleted, 0) = 0
JOIN form f
  ON f.id = fv.form_id
 AND COALESCE(f.is_deleted, 0) = 0
WHERE COALESCE(q.is_deleted, 0) = 0
  AND q.question_ref IS NOT NULL
  AND TRIM(q.question_ref) <> ''
ORDER BY q.question_ref, f.id, fv.version_number, fq.question_order;
```

## Classification des anomalies

### Cas A. `question_ref` manquant

Symptome : une ligne `question` active n'a pas de `question_ref` exploitable.

Reparation :

- generer un nouveau UUID pour la ligne concernee
- ne jamais tenter de "deviner" un rattachement a un `question_ref` existant sans preuve d'usage claire
- verifier ensuite si une duplication metier devrait plutot relier cette question a une filiation existante

### Cas B. Une meme filiation a ete separee artificiellement en plusieurs `question_ref`

Symptome : plusieurs lignes `question` forment manifestement la meme chaine metier, mais l'une d'elles porte un `question_ref` different suite a une ancienne edition manuelle.

Indices de confiance :

- meme position fonctionnelle dans une suite de versions d'un meme formulaire
- meme graphe de duplication connu ou meme question d'origine metier
- historique montrant qu'une seule branche logique etait attendue

Reparation :

- choisir le `question_ref` canonique le plus ancien ou le plus massivement reference
- reassigner les lignes divergentes vers ce `question_ref`
- ne faire cela qu'apres revue manuelle de la filiation

### Cas C. Plusieurs questions sans lien metier ont ete fusionnees sous un meme `question_ref`

Symptome : un meme `question_ref` groupe plusieurs questions qui ne representent pas la meme filiation logique.

Indices de confiance :

- questions apparues dans des branches/familles sans continuité metier identifiable
- textes, types, jeux de reponses et usages formulaire sans rattachement fonctionnel commun
- revue metier concluant qu'il s'agit de questions distinctes et non d'evolutions d'une meme question

Reparation :

- conserver le `question_ref` actuel sur la branche canonique
- attribuer un nouveau UUID aux branches parasitees
- ne jamais mass-rewriter sans echantillon de validation metier

## Procedure de reparation recommandee

### Etape 1. Extraire les anomalies candidates

- lancer les requetes SQL ci-dessus
- constituer une table de travail `question_id -> question_ref actuel -> question_ref cible -> justification`

### Etape 2. Valider la filiation avant modification

Pour chaque lot suspect, verifier :

- les `form_version` et `form_questions` qui referencent la question
- si la duplication metier etait supposee conserver ou non la filiation logique
- si l'ecart vient d'un champ structurel modifie dans une meme branche, ou d'une vraie question differente

### Etape 3. Executer la correction en SQL cible

Regles :

- corriger uniquement `question.question_ref`
- ne pas recreer de questions ni toucher aux FK `form_questions.question_id` dans cette operation
- traiter d'abord les `question_ref` manquants, puis les splits, puis les merges parasites

Exemple pour corriger un `question_ref` manquant ou parasite :

```sql
UPDATE question
SET question_ref = 'NEW-OR-CANONICAL-REF'
WHERE id = 123;
```

### Etape 4. Rejouer les verifications post-reparation

- relancer les requetes de diagnostic
- rerun au minimum :
  - `QuestionBusinessTest`
  - `FormVersionBusinessTest`
  - `FormQuestionsBusinessTest`
- rejouer un parcours de duplication ciblee de question et un revert de brouillon non utilise

## Ce qu'il ne faut pas faire

- ne pas deduire l'incoherence depuis le seul contenu texte/reponses
- ne pas fusionner automatiquement tous les doublons de contenu sous un meme `question_ref`
- ne pas reassigner massivement des `question_ref` sans table de mapping revue par un humain
- ne pas modifier `form_questions.question_id` pour "reparer" un `question_ref` : la reparation porte d'abord sur la filiation logique, pas sur le snapshot de version

## Critere de cloture

L'item peut etre considere traite quand :

- toutes les lignes actives ont un `question_ref` non vide
- chaque lot multi-lignes suspect a ete classe en filiation legitime, split artificiel, ou fusion parasitee
- les corrections retenues ont ete appliquees avec une table de mapping explicite et revue
- les tests metier cibles restent verts apres correction

La reparation doit rester une maintenance ciblee et tracee, jamais une reassociation automatique globale.
