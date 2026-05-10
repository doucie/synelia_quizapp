-- V1_035 : Ajout du support dark mode aux 10 presets fonctionnels email.
-- Prerequis : V1_033 applique (10 presets actifs dans email_template_preset).
--
-- Strategie :
--   Etape 1 — Ajout des meta tags color-scheme (tous les presets actifs)
--   Etape 2 — Ajout d un bloc @media (prefers-color-scheme:dark) commun (9 presets,
--             sauf FINAL_DECISION qui a une palette de couleurs differente)
--   Etape 3 — Ajout du bloc dark pour FINAL_DECISION (palette gris-Tailwind differente)
--   Etapes 4-8 — Ajout d un second bloc @media dark par categorie pour les blocs
--              colores specifiques (blue, amber, button, green, purple)
--
-- Note : MySQL REPLACE() remplace TOUTES les occurrences, mais chaque preset
--        ne contient qu un seul </style>, donc le remplacement est deterministe.
--        Les deux blocs @media dark resultants sont concatenes par
--        rewritePreferredColorSchemeStyles() cote Angular.

-- ─── Etape 1 : Meta tags color-scheme (tous les 10 presets actifs) ────────────────────────
UPDATE email_template_preset
SET html_structure = REPLACE(
    html_structure,
    '<meta name="viewport"',
    '<meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><meta name="viewport"'
),
    updated_at = NOW()
WHERE is_deleted = FALSE;

-- ─── Etape 2 : Dark CSS commun — palette slate (tous sauf FINAL_DECISION) ─────────────────
-- Couleurs dark mode :
--   body bg #f1f5f9 / #f8fafc → #0f172a
--   card bg #ffffff → #1e293b
--   card border #e2e8f0 → #334155
--   .t1 (titre) #1e293b → #f1f5f9
--   .rp.bd (corps) #334155 → #cbd5e1
--   secondaire (td) #64748b → #94a3b8
--   footer bg #f8fafc → #0f172a
--   footer texte #94a3b8 → #64748b
--   dividers #e2e8f0 → #334155
--   companyName <p> #334155 (PRE_SCREEN_DECISION) → #e2e8f0
UPDATE email_template_preset
SET html_structure = REPLACE(
    html_structure,
    '</style>',
    '@media (prefers-color-scheme:dark){body{background-color:#0f172a !important}[bgcolor="#f1f5f9"],[bgcolor="#f8fafc"]{background-color:#0f172a !important}table[style*="background-color:#ffffff"]{background-color:#1e293b !important}td[style*="background-color:#ffffff"]{background-color:#1e293b !important}table[style*="border:1px solid #e2e8f0"]{border-color:#334155 !important}.t1{color:#f1f5f9 !important}.rp.bd{color:#cbd5e1 !important}p[style*="color:#334155"]{color:#e2e8f0 !important}td[style*="color:#64748b"]{color:#94a3b8 !important}td[style*="background-color:#f8fafc"]{background-color:#0f172a !important}td[style*="color:#94a3b8"]{color:#64748b !important}td[style*="border-top:1px solid #e2e8f0"]{border-top-color:#334155 !important}}</style>'
),
    updated_at = NOW()
WHERE is_deleted = FALSE
  AND category != 'FINAL_DECISION';

-- ─── Etape 3 : Dark CSS pour FINAL_DECISION (palette gris-Tailwind, differente du reste) ──
-- Couleurs dark mode FINAL_DECISION :
--   body bg #ffffff → #0f172a
--   card bg #ffffff + border #d1d5db → bg #1e293b + border #374151
--   .t1 #111827 → #f9fafb
--   .rp.bd #374151 → #d1d5db
--   secondaire #6b7280 → #9ca3af
--   footer bg #f9fafb → #0f172a
--   footer texte #9ca3af → #6b7280
--   dividers #e5e7eb → #374151
UPDATE email_template_preset
SET html_structure = REPLACE(
    html_structure,
    '</style>',
    '@media (prefers-color-scheme:dark){body{background-color:#0f172a !important}[bgcolor="#ffffff"]{background-color:#0f172a !important}table[style*="background-color:#ffffff;border:1px solid #d1d5db"]{background-color:#1e293b !important;border-color:#374151 !important}.t1{color:#f9fafb !important}.rp.bd{color:#d1d5db !important}td[style*="color:#6b7280"]{color:#9ca3af !important}td[style*="background-color:#f9fafb"]{background-color:#0f172a !important}td[style*="color:#9ca3af"]{color:#6b7280 !important}td[style*="border-top:1px solid #e5e7eb"]{border-top-color:#374151 !important}td[style*="border-bottom:1px solid #e5e7eb"]{border-bottom-color:#374151 !important}}</style>'
),
    updated_at = NOW()
WHERE is_deleted = FALSE
  AND category = 'FINAL_DECISION';

-- ─── Etape 4 : APPLICATION_VERIFICATION — bloc de verification bleu ────────────────────────
-- Couleurs dark mode bloc bleu :
--   bg #f0f9ff → #082f49
--   border dashed #7dd3fc → #38bdf8
--   texte td #0c4a6e → #bae6fd
--   label <p> #0369a1 → #7dd3fc
UPDATE email_template_preset
SET html_structure = REPLACE(
    html_structure,
    '</style>',
    '@media (prefers-color-scheme:dark){td[style*="background-color:#f0f9ff"]{background-color:#082f49 !important}td[style*="border:1px dashed #7dd3fc"]{border-color:#38bdf8 !important}td[style*="color:#0c4a6e"]{color:#bae6fd !important}p[style*="color:#0369a1"]{color:#7dd3fc !important}}</style>'
),
    updated_at = NOW()
WHERE is_deleted = FALSE
  AND category = 'APPLICATION_VERIFICATION';

-- ─── Etape 5 : PASSWORD_RESET — bloc d avertissement ambre ───────────────────────────────
-- Couleurs dark mode bloc ambre :
--   bg #fefce8 → #451a03
--   border-left #f59e0b → #d97706
--   texte #78350f → #fcd34d
UPDATE email_template_preset
SET html_structure = REPLACE(
    html_structure,
    '</style>',
    '@media (prefers-color-scheme:dark){td[style*="background-color:#fefce8"]{background-color:#451a03 !important}td[style*="border-left:4px solid #f59e0b"]{border-left-color:#d97706 !important}td[style*="color:#78350f"]{color:#fcd34d !important}}</style>'
),
    updated_at = NOW()
WHERE is_deleted = FALSE
  AND category = 'PASSWORD_RESET';

-- ─── Etape 6 : INVITATION_CODE — correction du bouton sombre sur fond sombre ──────────────
-- Le bouton "{{buttonText}}" utilise background-color:#1e293b (slate-800).
-- En dark mode la carte devient aussi #1e293b → le bouton devient invisible.
-- Correction : background-color:#475569 (slate-600), encore sombre mais visible.
UPDATE email_template_preset
SET html_structure = REPLACE(
    html_structure,
    '</style>',
    '@media (prefers-color-scheme:dark){a[style*="background-color:#1e293b"]{background-color:#475569 !important}}</style>'
),
    updated_at = NOW()
WHERE is_deleted = FALSE
  AND category = 'INVITATION_CODE';

-- ─── Etape 7 : INTERVIEW_INVITE — bloc d information vert ────────────────────────────────
-- Couleurs dark mode bloc vert :
--   bg #f0fdf4 → #052e16
--   border #bbf7d0 → #4ade80
--   label td #166534 → #bbf7d0
--   texte td #15803d → #86efac
UPDATE email_template_preset
SET html_structure = REPLACE(
    html_structure,
    '</style>',
    '@media (prefers-color-scheme:dark){table[style*="background-color:#f0fdf4"]{background-color:#052e16 !important}table[style*="border:1px solid #bbf7d0"]{border-color:#4ade80 !important}td[style*="color:#166534"]{color:#bbf7d0 !important}td[style*="color:#15803d"]{color:#86efac !important}}</style>'
),
    updated_at = NOW()
WHERE is_deleted = FALSE
  AND category = 'INTERVIEW_INVITE';

-- ─── Etape 8 : QUIZ_INVITE — bloc d information violet ───────────────────────────────────
-- Couleurs dark mode bloc violet :
--   bg #faf5ff → #2e1065
--   border #e9d5ff → #a78bfa
--   label td #581c87 → #e9d5ff
--   texte td #7e22ce → #d8b4fe
UPDATE email_template_preset
SET html_structure = REPLACE(
    html_structure,
    '</style>',
    '@media (prefers-color-scheme:dark){table[style*="background-color:#faf5ff"]{background-color:#2e1065 !important}table[style*="border:1px solid #e9d5ff"]{border-color:#a78bfa !important}td[style*="color:#581c87"]{color:#e9d5ff !important}td[style*="color:#7e22ce"]{color:#d8b4fe !important}}</style>'
),
    updated_at = NOW()
WHERE is_deleted = FALSE
  AND category = 'QUIZ_INVITE';
