/**
 * Tokeniseur SQL minimal, sans dépendance.
 *
 * Pourquoi maison plutôt que Prism / highlight.js / Shiki : figures_flow n'a
 * aucune dépendance de coloration, et un script de 21 `CREATE TABLE` n'a besoin
 * que de 8 classes de jetons. Ajouter une librairie de highlighting pour cela
 * serait disproportionné (poids de bundle pour une figure de mémoire).
 *
 * Le point important est le **contexte** : après `REFERENCES` le mot suivant est
 * un nom de table, après `ON DELETE` c'est une politique de suppression. Sans
 * cette contextualisation, toutes les politiques se coloreraient comme des
 * mots-clés ordinaires et la lecture du script se perdrait.
 */

export type SqlTokenKind =
  | 'keyword'
  | 'type'
  | 'ident'
  | 'constraint'
  | 'policy'
  | 'literal'
  | 'audit'
  | 'comment'
  | 'punct'
  | 'plain'

export interface SqlToken {
  text: string
  kind: SqlTokenKind
}

/**
 * Teintes de la coloration — 5 teintes, toutes déjà présentes dans `SAFE_HUES`
 * (`src/utils/entityColors.ts`). Aucune couleur nouvelle n'est introduite dans
 * le projet : le script s'accorde aux autres figures.
 */
export const SQL_HUES: Record<SqlTokenKind, number | undefined> = {
  keyword: 210,
  type: 145,
  ident: 225,
  constraint: 30,
  policy: 330,
  literal: 275,
  audit: 15,
  comment: 0,
  punct: undefined,
  plain: undefined,
}

const KEYWORDS = new Set([
  'CREATE', 'TABLE', 'ALTER', 'ADD', 'CONSTRAINT', 'DEFAULT', 'ENGINE', 'SET',
  'REFERENCES', 'COLLATE', 'CHARSET', 'AUTO_INCREMENT', 'COMMENT',
  'ON', 'DELETE', 'TO',
])

const TYPES = new Set([
  'INT', 'INTEGER', 'BIGINT', 'TINYINT', 'SMALLINT', 'UNSIGNED', 'SIGNED',
  'VARCHAR', 'CHAR', 'TEXT', 'LONGTEXT', 'MEDIUMTEXT', 'JSON',
  'DATETIME', 'TIMESTAMP', 'DATE', 'TIME',
  'DECIMAL', 'NUMERIC', 'FLOAT', 'DOUBLE',
  'BOOLEAN', 'BIT', 'BLOB', 'ENUM',
])

const CONSTRAINTS = new Set(['PRIMARY', 'FOREIGN', 'UNIQUE', 'KEY', 'INDEX', 'NOT'])

const POLICIES = new Set(['CASCADE', 'RESTRICT', 'SET'])

const LITERALS = new Set(['CURRENT_TIMESTAMP', 'NOW', 'TRUE', 'FALSE', 'NULL'])

/** Colonnes systématiques ajoutées par la règle 7. */
const AUDIT = new Set(['created_at', 'created_by', 'updated_at', 'updated_by', 'is_deleted'])

/** Noms de contraintes : `fk_`, `uq_`, `idx_`… colorisés comme des mots-clés. */
function isConstraintName(word: string): boolean {
  return /^(fk_|pk_|uq_|idx_|ck_)/.test(word)
}

const IDENT_CHAR = /[A-Za-z0-9_$`]/

export interface TokenizeState {
  /** Le prochain mot est le nom d'une table référencée. */
  afterReferences: boolean
  /** Le prochain mot est une politique de suppression. */
  expectPolicy: boolean
  /** Le mot précédent était `NOT` : `NOT NULL` doit rester une seule couleur. */
  afterNot: boolean
}

function initialState(): TokenizeState {
  return { afterReferences: false, expectPolicy: false, afterNot: false }
}

/** Le dernier mot significatif de la ligne est-il `word` ? */
function lastWordWas(tokens: SqlToken[], word: string): boolean {
  for (let i = tokens.length - 1; i >= 0; i--) {
    const t = tokens[i]
    if (t.kind === 'plain' || t.kind === 'punct' || t.kind === 'comment') continue
    return t.text.toUpperCase() === word.toUpperCase()
  }
  return false
}

function classify(word: string, state: TokenizeState, tokens: SqlToken[]): SqlTokenKind {
  const upper = word.toUpperCase()

  // 1. Le contexte de la ligne prime sur le lexique.
  if (state.afterReferences) return 'ident'
  if (state.expectPolicy && POLICIES.has(upper)) return 'policy'
  if (state.afterNot && upper === 'NULL') return 'constraint'

  // 2. Lexique SQL.
  if (KEYWORDS.has(upper)) return 'keyword'
  if (CONSTRAINTS.has(upper)) return 'constraint'
  if (LITERALS.has(upper)) return 'literal'
  if (TYPES.has(upper)) return 'type'
  if (POLICIES.has(upper) && (lastWordWas(tokens, 'ON') || lastWordWas(tokens, 'DELETE'))) return 'policy'
  if (AUDIT.has(word)) return 'audit'

  return 'ident'
}

/** Découpe une ligne SQL en jetons, en portant le contexte à la ligne suivante. */
export function tokenizeLine(
  line: string,
  state: TokenizeState = initialState(),
): { tokens: SqlToken[]; state: TokenizeState } {
  const tokens: SqlToken[] = []
  const next: TokenizeState = { ...state }
  let i = 0

  const push = (text: string, kind: SqlTokenKind) => {
    if (!text) return
    tokens.push({ text, kind })
  }

  while (i < line.length) {
    const ch = line[i]

    // Commentaire de ligne : mange le reste de la ligne.
    if (ch === '-' && line[i + 1] === '-') {
      push(line.slice(i), 'comment')
      break
    }

    // Espaces.
    if (/\s/.test(ch)) {
      let j = i
      while (j < line.length && /\s/.test(line[j])) j++
      push(line.slice(i, j), 'plain')
      i = j
      continue
    }

    // Littéral entre apostrophes ou guillemets.
    if (ch === "'" || ch === '"') {
      let j = i + 1
      while (j < line.length && line[j] !== ch) j++
      j = Math.min(j + 1, line.length)
      push(line.slice(i, j), 'literal')
      i = j
      continue
    }

    // Backtick : identifiant cité (MySQL).
    if (ch === '`') {
      let j = i + 1
      while (j < line.length && line[j] !== '`') j++
      j = Math.min(j + 1, line.length)
      const inner = line.slice(i + 1, j - 1)
      const kind: SqlTokenKind = AUDIT.has(inner)
        ? 'audit'
        : isConstraintName(inner)
          ? 'constraint'
          : 'ident'
      push(line.slice(i, j), kind)
      i = j
      continue
    }

    // Mot : identifiant, mot-clé, type ou contrainte.
    if (/[A-Za-z_]/.test(ch)) {
      let j = i
      while (j < line.length && IDENT_CHAR.test(line[j])) j++
      const word = line.slice(i, j)
      const upper = word.toUpperCase()

      push(word, classify(word, next, tokens))

      next.afterReferences = upper === 'REFERENCES'
      next.expectPolicy = upper === 'ON' || upper === 'DELETE'
      next.afterNot = upper === 'NOT'
      i = j
      continue
    }

    // Ponctuation SQL.
    if (/[(),;.]/.test(ch)) {
      let j = i
      while (j < line.length && /[(),;.]/.test(line[j])) j++
      push(line.slice(i, j), 'punct')
      i = j
      continue
    }

    // Nombre.
    if (/[0-9]/.test(ch)) {
      let j = i
      while (j < line.length && /[0-9.]/.test(line[j])) j++
      push(line.slice(i, j), 'literal')
      i = j
      continue
    }

    push(ch, 'punct')
    i++
  }

  return { tokens, state: next }
}

/** Tokenise un script complet, ligne par ligne, en conservant le contexte. */
export function tokenizeSql(sql: string): SqlToken[][] {
  const state = initialState()
  return sql.split('\n').map((line) => {
    const { tokens, state: next } = tokenizeLine(line, state)
    Object.assign(state, next)
    return tokens
  })
}
