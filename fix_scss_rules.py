"""
Script to apply to-do-rules-front.md CSS variable rules to all SCSS files.
Replaces hardcoded values with design system CSS variables.
"""
import os
import re
import glob

BASE = r"c:\Users\kokoe\Documents\work\synelia\projects\quiz\codes\quizapp_full\quizapp_front\src\app"

# ─────────────────────────────────────────────────────────────────────────────
# FONT SIZE MAP  (value → variable)   ordered long→short to avoid partial matches
# ─────────────────────────────────────────────────────────────────────────────
FONT_SIZE_MAP = [
    # Exact rem
    ("4rem",      "var(--font-size-4xl)"),
    ("3.5rem",    "var(--font-size-4xl)"),
    ("3rem",      "var(--font-size-4xl)"),
    ("2.5rem",    "var(--font-size-4xl)"),
    ("2.25rem",   "var(--font-size-4xl)"),
    ("2rem",      "var(--font-size-3xl)"),
    ("1.875rem",  "var(--font-size-3xl)"),
    ("1.75rem",   "var(--font-size-3xl)"),
    ("1.5rem",    "var(--font-size-2xl)"),
    ("1.375rem",  "var(--font-size-xl)"),
    ("1.25rem",   "var(--font-size-xl)"),
    ("1.125rem",  "var(--font-size-lg)"),
    ("1.1rem",    "var(--font-size-lg)"),
    ("1rem",      "var(--font-size-base)"),
    ("0.9375rem", "var(--font-size-base)"),
    ("0.9rem",    "var(--font-size-sm)"),
    ("0.88rem",   "var(--font-size-sm)"),
    ("0.875rem",  "var(--font-size-sm)"),
    ("0.85rem",   "var(--font-size-sm)"),
    ("0.82rem",   "var(--font-size-sm)"),
    ("0.8125rem", "var(--font-size-sm)"),
    ("0.8rem",    "var(--font-size-xs)"),
    ("0.75rem",   "var(--font-size-xs)"),
    ("0.72rem",   "var(--font-size-xs)"),
    ("0.6875rem", "var(--font-size-xs)"),
    # Exact px
    ("26px",      "var(--font-size-2xl)"),
    ("24px",      "var(--font-size-2xl)"),
    ("22px",      "var(--font-size-xl)"),
    ("20px",      "var(--font-size-xl)"),
    ("18px",      "var(--font-size-lg)"),
    ("16px",      "var(--font-size-base)"),
    ("15px",      "var(--font-size-base)"),
    ("14px",      "var(--font-size-sm)"),
    ("13px",      "var(--font-size-sm)"),
    ("12px",      "var(--font-size-xs)"),
    ("11px",      "var(--font-size-xs)"),
]

# ─────────────────────────────────────────────────────────────────────────────
# FONT WEIGHT MAP
# ─────────────────────────────────────────────────────────────────────────────
FONT_WEIGHT_MAP = [
    ("800", "var(--font-weight-extrabold)"),
    ("700", "var(--font-weight-bold)"),
    ("600", "var(--font-weight-semibold)"),
    ("500", "var(--font-weight-medium)"),
    ("400", "var(--font-weight-normal)"),
    ("300", "var(--font-weight-light)"),
]

# ─────────────────────────────────────────────────────────────────────────────
# BORDER-RADIUS MAP  (for replacing individual tokens within border-radius lines)
# ─────────────────────────────────────────────────────────────────────────────
RADIUS_MAP = [
    ("9999px",   "var(--radius-full)"),
    ("50%",      "var(--radius-full)"),
    ("2rem",     "var(--radius-2xl)"),
    ("1.5rem",   "var(--radius-2xl)"),
    ("24px",     "var(--radius-2xl)"),
    ("1rem",     "var(--radius-xl)"),
    ("16px",     "var(--radius-xl)"),
    ("0.75rem",  "var(--radius-lg)"),
    ("12px",     "var(--radius-lg)"),
    ("0.5rem",   "var(--radius)"),
    ("8px",      "var(--radius)"),
    ("0.375rem", "var(--radius-md)"),
    ("6px",      "var(--radius-md)"),
    ("0.25rem",  "var(--radius-sm)"),
    ("4px",      "var(--radius-sm)"),
    ("2px",      "var(--radius-sm)"),
]

# ─────────────────────────────────────────────────────────────────────────────
# SPACING MAP  (rem/px values → spacing variables, for padding/margin/gap)
# ─────────────────────────────────────────────────────────────────────────────
SPACING_MAP = [
    ("4rem",    "var(--spacing-3xl)"),
    ("3rem",    "var(--spacing-2xl)"),
    ("2.5rem",  "var(--spacing-2xl)"),
    ("2rem",    "var(--spacing-xl)"),
    ("1.5rem",  "var(--spacing-lg)"),
    ("1.25rem", "var(--spacing-lg)"),
    ("1rem",    "var(--spacing-md)"),
    ("0.875rem","var(--spacing-md)"),
    ("0.75rem", "var(--spacing-md)"),
    ("0.5rem",  "var(--spacing-sm)"),
    ("0.25rem", "var(--spacing-xs)"),
    ("32px",    "var(--spacing-xl)"),
    ("24px",    "var(--spacing-lg)"),
    ("20px",    "var(--spacing-lg)"),
    ("16px",    "var(--spacing-md)"),
    ("12px",    "var(--spacing-md)"),
    ("10px",    "var(--spacing-sm)"),
    ("8px",     "var(--spacing-sm)"),
    ("6px",     "var(--spacing-sm)"),
    ("4px",     "var(--spacing-xs)"),
]

# ─────────────────────────────────────────────────────────────────────────────
# HELPER: replace tokens in a CSS value string (not `0` standalone)
# ─────────────────────────────────────────────────────────────────────────────
def replace_tokens(value_str, token_map):
    """Replace bare numeric tokens in a CSS value string using the given map."""
    result = value_str
    for token, var in token_map:
        # Match token with word boundaries, but not inside var() already
        pattern = r'(?<![a-zA-Z\-\(])' + re.escape(token) + r'(?![a-zA-Z0-9\-\)])'
        result = re.sub(pattern, var, result)
    return result


def process_font_size_line(line):
    """Replace font-size values with variables."""
    m = re.match(r'^(\s*font-size:\s*)(.*?)(\s*;.*)?$', line)
    if not m:
        return line
    prefix, value, suffix = m.group(1), m.group(2).strip(), m.group(3) or ''
    if value.startswith('var(--font-size'):
        return line
    for token, var in FONT_SIZE_MAP:
        if value == token:
            return f"{prefix}{var}{suffix}\n" if line.endswith('\n') else f"{prefix}{var}{suffix}"
    return line


def process_font_weight_line(line):
    """Replace font-weight values with variables."""
    m = re.match(r'^(\s*font-weight:\s*)(.*?)(\s*;.*)?$', line)
    if not m:
        return line
    prefix, value, suffix = m.group(1), m.group(2).strip(), m.group(3) or ''
    if value.startswith('var(--font-weight'):
        return line
    for token, var in FONT_WEIGHT_MAP:
        if value == token:
            return f"{prefix}{var}{suffix}\n" if line.endswith('\n') else f"{prefix}{var}{suffix}"
    return line


def process_border_radius_line(line):
    """Replace border-radius values with variables."""
    if 'border-radius:' not in line:
        return line
    if 'var(--radius' in line and not re.search(r'\b\d+(?:px|rem|%)\b', line.split('border-radius:')[1].split(';')[0]):
        return line  # already fully converted

    # Extract property and value parts
    m = re.match(r'^(\s*border-radius:\s*)(.*?)(\s*(?:;.*)?)$', line.rstrip('\n'))
    if not m:
        return line
    indent, value, tail = m.group(1), m.group(2), m.group(3)
    new_value = replace_tokens(value, RADIUS_MAP)
    result = f"{indent}{new_value}{tail}"
    if line.endswith('\n'):
        result += '\n'
    return result


def process_spacing_line(line):
    """Replace padding/margin/gap values with spacing variables."""
    prop_match = re.match(r'^(\s*(?:padding|margin|gap)(?:-(?:top|bottom|left|right|block|inline|block-start|block-end|inline-start|inline-end))?:\s*)(.*?)(\s*(?:;.*)?)$', line.rstrip('\n'))
    if not prop_match:
        return line

    indent = prop_match.group(1)
    value = prop_match.group(2)
    tail = prop_match.group(3)

    # Skip lines that are already using variables for spacing
    if 'var(--spacing' in value:
        # Might have mixed values; still try to replace remaining raw values
        pass

    # Don't change `0` alone or `auto`
    # Tokenize the value and replace each token
    def replace_spacing_token(m_tok):
        tok = m_tok.group(0)
        # Don't replace standalone 0
        if tok == '0':
            return tok
        for pattern, var in SPACING_MAP:
            if tok == pattern:
                return var
        return tok

    # Replace numeric spacing tokens
    # NOTE: (?<!\.) prevents matching rem values that are part of a decimal number
    # e.g. 0.4rem must NOT be matched as 0.[4rem], only standalone 4rem should match
    new_value = re.sub(
        r'(?<!\.)(?:' + '|'.join(re.escape(p) for p, _ in SPACING_MAP) + r')\b',
        replace_spacing_token,
        value
    )

    result = f"{indent}{new_value}{tail}"
    if line.endswith('\n'):
        result += '\n'
    return result


def transform_content(content):
    """Apply all rule transformations."""

    # ── 0. Strip hardcoded hex/color fallbacks from valid var() calls ────
    # e.g. var(--primary, #6366f1) → var(--primary)
    # Remove fallbacks that are hex colors, rgb/rgba values, or named colors
    content = re.sub(
        r'(var\(--[a-z][a-z0-9-]*)\s*,\s*(?:#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|(?:white|black|transparent|inherit|currentColor))\)',
        r'\1)',
        content
    )

    # ── 0b. Handle CSS keyword 'white' and 'black' in properties ─────────
    # color: white → color: var(--white)
    content = re.sub(r'((?:^|\s)color:\s*)white\b', r'\1var(--white)', content, flags=re.MULTILINE)
    # background/background-color: white → var(--white)
    content = re.sub(r'(background(?:-color)?:\s*)white\b', r'\1var(--white)', content, flags=re.IGNORECASE)
    # fill: white → fill: var(--white)
    content = re.sub(r'(fill:\s*)white\b', r'\1var(--white)', content, flags=re.IGNORECASE)
    # stroke: white → stroke: var(--white)
    content = re.sub(r'(stroke:\s*)white\b', r'\1var(--white)', content, flags=re.IGNORECASE)

    # ── 1. Fix forbidden / wrong variable names ───────────────────────────
    # These patterns use var(--wrong-name, fallback) or just var(--wrong-name)
    replacements_vars = [
        # Border variables
        (r'var\(--border-color(?:,\s*[^)]+)?\)', 'var(--border)'),
        (r'var\(--border-hover(?:,\s*[^)]+)?\)', 'var(--border-hover)'),  # keep correct
        # Primary / Color variables
        (r'var\(--primary-color-rgb(?:,\s*[^)]+)?\)', 'var(--primary-rgb)'),
        (r'var\(--color-primary-rgb(?:,\s*[^)]+)?\)', 'var(--primary-rgb)'),
        (r'var\(--primary-color(?:,\s*[^)]+)?\)', 'var(--primary)'),
        (r'var\(--color-primary(?:,\s*[^)]+)?\)', 'var(--primary)'),
        # Background variables
        (r'var\(--bg-primary(?:,\s*[^)]+)?\)', 'var(--background)'),
        (r'var\(--bg-secondary(?:,\s*[^)]+)?\)', 'var(--surface-secondary)'),
        (r'var\(--bg-tertiary(?:,\s*[^)]+)?\)', 'var(--surface-variant)'),
        (r'var\(--bg-hover(?:,\s*[^)]+)?\)', 'var(--surface-hover)'),
        (r'var\(--secondary-bg(?:,\s*[^)]+)?\)', 'var(--surface-secondary)'),
        (r'var\(--card-bg(?:,\s*[^)]+)?\)', 'var(--surface)'),
        (r'var\(--input-bg(?:,\s*[^)]+)?\)', 'var(--background)'),
        (r'var\(--code-bg(?:,\s*[^)]+)?\)', 'var(--surface-secondary)'),
        (r'var\(--hover-bg(?:,\s*[^)]+)?\)', 'var(--surface-hover)'),
        # Status variables (danger = error in this project)
        (r'var\(--danger-bg(?:,\s*[^)]+)?\)', 'rgba(var(--error-rgb), 0.1)'),
        (r'var\(--danger-color(?:,\s*[^)]+)?\)', 'var(--error)'),
        (r'var\(--danger-dark(?:,\s*[^)]+)?\)', 'var(--error-dark)'),
        (r'var\(--danger-light(?:,\s*[^)]+)?\)', 'var(--error-light)'),
        (r'var\(--danger(?:,\s*[^)]+)?\)', 'var(--error)'),
        (r'var\(--error-bg(?:,\s*[^)]+)?\)', 'rgba(var(--error-rgb), 0.1)'),
        (r'var\(--error-border(?:,\s*[^)]+)?\)', 'rgba(var(--error-rgb), 0.3)'),
        (r'var\(--info-bg(?:,\s*[^)]+)?\)', 'rgba(var(--info-rgb), 0.1)'),
        (r'var\(--warning-bg(?:,\s*[^)]+)?\)', 'rgba(var(--warning-rgb), 0.1)'),
        (r'var\(--success-bg(?:,\s*[^)]+)?\)', 'rgba(var(--success-rgb), 0.1)'),
        # Remove fallbacks from valid vars (they have hardcoded fallbacks)
        (r'var\(--info,\s*#[a-fA-F0-9]+\)', 'var(--info)'),
        (r'var\(--warning,\s*#[a-fA-F0-9]+\)', 'var(--warning)'),
        (r'var\(--success,\s*#[a-fA-F0-9]+\)', 'var(--success)'),
        (r'var\(--error,\s*#[a-fA-F0-9]+\)', 'var(--error)'),
        (r'var\(--warning,\s*[^)]+\)', 'var(--warning)'),
        (r'var\(--success,\s*[^)]+\)', 'var(--success)'),
        (r'var\(--error,\s*[^)]+\)', 'var(--error)'),
        # Text variables
        (r'var\(--text-muted(?:,\s*[^)]+)?\)', 'var(--text-secondary)'),
        (r'var\(--warning-text(?:,\s*[^)]+)?\)', 'var(--warning-dark)'),
    ]
    for pattern, repl in replacements_vars:
        content = re.sub(pattern, repl, content)

    # ── 2. rgba() with hardcoded RGB → rgba(var(--X-rgb), alpha) ─────────
    # Process known RGB triplets
    rgba_replacements = [
        # Error #EF4444
        (r'rgba\(\s*239\s*,\s*68\s*,\s*68\s*,\s*([0-9.]+)\s*\)', r'rgba(var(--error-rgb), \1)'),
        # Success #10B981
        (r'rgba\(\s*16\s*,\s*185\s*,\s*129\s*,\s*([0-9.]+)\s*\)', r'rgba(var(--success-rgb), \1)'),
        # Primary #6B46C1
        (r'rgba\(\s*107\s*,\s*70\s*,\s*193\s*,\s*([0-9.]+)\s*\)', r'rgba(var(--primary-rgb), \1)'),
        # Primary-light #8B5CF6 (approximate to primary-rgb)
        (r'rgba\(\s*139\s*,\s*92\s*,\s*246\s*,\s*([0-9.]+)\s*\)', r'rgba(var(--primary-rgb), \1)'),
        # Info #3B82F6
        (r'rgba\(\s*59\s*,\s*130\s*,\s*246\s*,\s*([0-9.]+)\s*\)', r'rgba(var(--info-rgb), \1)'),
        # Warning #F59E0B
        (r'rgba\(\s*245\s*,\s*158\s*,\s*11\s*,\s*([0-9.]+)\s*\)', r'rgba(var(--warning-rgb), \1)'),
        # Warning-ish yellow #FFC107
        (r'rgba\(\s*255\s*,\s*193\s*,\s*7\s*,\s*([0-9.]+)\s*\)', r'rgba(var(--warning-rgb), \1)'),
        # Gold / warm yellow
        (r'rgba\(\s*255\s*,\s*215\s*,\s*0\s*,\s*([0-9.]+)\s*\)', r'rgba(var(--warning-rgb), \1)'),
        # Orange warning
        (r'rgba\(\s*255\s*,\s*152\s*,\s*0\s*,\s*([0-9.]+)\s*\)', r'rgba(var(--warning-rgb), \1)'),
        # Purple (close to primary)
        (r'rgba\(\s*168\s*,\s*85\s*,\s*247\s*,\s*([0-9.]+)\s*\)', r'rgba(var(--primary-rgb), \1)'),
        (r'rgba\(\s*99\s*,\s*102\s*,\s*241\s*,\s*([0-9.]+)\s*\)', r'rgba(var(--primary-rgb), \1)'),
        (r'rgba\(\s*102\s*,\s*126\s*,\s*234\s*,\s*([0-9.]+)\s*\)', r'rgba(var(--primary-rgb), \1)'),
        # rgba(255,193,7) without alpha → var(--warning)
        (r'rgba\(\s*255\s*,\s*193\s*,\s*7\s*\)', r'var(--warning)'),
        # Cyan #00f2fe / sky blue decorative gradients — keep as-is, no semantic var
        # but for non-gradient contexts, map sky blue to info
        (r'rgba\(\s*14\s*,\s*165\s*,\s*233\s*,\s*([0-9.]+)\s*\)', r'rgba(var(--info-rgb), \1)'),
        (r'rgba\(\s*34\s*,\s*197\s*,\s*94\s*,\s*([0-9.]+)\s*\)', r'rgba(var(--success-rgb), \1)'),
        # Gray 107,114,128 (Tailwind gray-500) → use as neutral/border alpha
        (r'rgba\(\s*107\s*,\s*114\s*,\s*128\s*,\s*([0-9.]+)\s*\)', r'rgba(var(--text-secondary-rgb, 107, 114, 128), \1)'),
        # Gray 156,163,175 (Tailwind gray-400) → text-tertiary
        (r'rgba\(\s*156\s*,\s*163\s*,\s*175\s*,\s*([0-9.]+)\s*\)', r'rgba(var(--text-tertiary-rgb, 156, 163, 175), \1)'),
        # Red 220,38,38 / 229,62,62 (Tailwind red-600/500) → error-rgb
        (r'rgba\(\s*220\s*,\s*38\s*,\s*38\s*,\s*([0-9.]+)\s*\)', r'rgba(var(--error-rgb), \1)'),
        (r'rgba\(\s*229\s*,\s*62\s*,\s*62\s*,\s*([0-9.]+)\s*\)', r'rgba(var(--error-rgb), \1)'),
        # Amber 251,191,36 (Tailwind amber-300) → warning-rgb
        (r'rgba\(\s*251\s*,\s*191\s*,\s*36\s*,\s*([0-9.]+)\s*\)', r'rgba(var(--warning-rgb), \1)'),
        # Purple variant 124,58,237 → primary-rgb
        (r'rgba\(\s*124\s*,\s*58\s*,\s*237\s*,\s*([0-9.]+)\s*\)', r'rgba(var(--primary-rgb), \1)'),
        # Cyan 6,182,212 (Tailwind cyan-500) → info-rgb
        (r'rgba\(\s*6\s*,\s*182\s*,\s*212\s*,\s*1\s*\)', r'var(--info)'),
        (r'rgba\(\s*6\s*,\s*182\s*,\s*212\s*,\s*([0-9.]+)\s*\)', r'rgba(var(--info-rgb), \1)'),
        # Pink 244,114,182 (Tailwind pink-400) → primary-rgb
        (r'rgba\(\s*244\s*,\s*114\s*,\s*182\s*,\s*1\s*\)', r'var(--primary)'),
        (r'rgba\(\s*244\s*,\s*114\s*,\s*182\s*,\s*([0-9.]+)\s*\)', r'rgba(var(--primary-rgb), \1)'),
        # Green 134,239,172 (Tailwind green-300) → success-rgb
        (r'rgba\(\s*134\s*,\s*239\s*,\s*172\s*,\s*([0-9.]+)\s*\)', r'rgba(var(--success-rgb), \1)'),
        # Green 74,222,128 (Tailwind green-400) → success-rgb
        (r'rgba\(\s*74\s*,\s*222\s*,\s*128\s*,\s*([0-9.]+)\s*\)', r'rgba(var(--success-rgb), \1)'),
        # Green 5,150,105 (Tailwind emerald-600) → success-rgb
        (r'rgba\(\s*5\s*,\s*150\s*,\s*105\s*,\s*([0-9.]+)\s*\)', r'rgba(var(--success-rgb), \1)'),
        # Red 231,76,60 (Bootstrap red) → error-rgb
        (r'rgba\(\s*231\s*,\s*76\s*,\s*60\s*,\s*([0-9.]+)\s*\)', r'rgba(var(--error-rgb), \1)'),
        # Red 185,28,28 (Tailwind red-700) → error-rgb
        (r'rgba\(\s*185\s*,\s*28\s*,\s*28\s*,\s*([0-9.]+)\s*\)', r'rgba(var(--error-rgb), \1)'),
        # Rose 252,165,165 (Tailwind rose-300) → error-rgb
        (r'rgba\(\s*252\s*,\s*165\s*,\s*165\s*,\s*([0-9.]+)\s*\)', r'rgba(var(--error-rgb), \1)'),
        # Rose 248,113,113 (Tailwind rose-400) → error-rgb
        (r'rgba\(\s*248\s*,\s*113\s*,\s*113\s*,\s*([0-9.]+)\s*\)', r'rgba(var(--error-rgb), \1)'),
    ]
    for pattern, repl in rgba_replacements:
        content = re.sub(pattern, repl, content)

    # ── 3. Modal/drawer backdrops: rgba(0,0,0,0.5/0.6) ────────────────────
    content = re.sub(r'rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.(?:5|6)\s*\)', 'var(--overlay-backdrop)', content)

    # ── 4. box-shadow → elevation/shadow variables ────────────────────────
    # Order: most specific first
    # Pattern that handles rgba() with nested var() calls, e.g. rgba(var(--X-rgb), 0.4)
    _rgba_nested = r'rgba\((?:[^()]+|\([^()]*\))*\)'

    box_shadow_replacements = [
        # Very heavy modal shadows
        (r'box-shadow:\s*0\s+20px\s+60px\s+' + _rgba_nested,          'box-shadow: var(--elevation-4)'),
        (r'box-shadow:\s*0\s+14px\s+28px\s+' + _rgba_nested,          'box-shadow: var(--elevation-4)'),
        (r'box-shadow:\s*0\s+16px\s+32px\s+' + _rgba_nested,          'box-shadow: var(--elevation-4)'),
        (r'box-shadow:\s*0\s+12px\s+28px\s+' + _rgba_nested,          'box-shadow: var(--elevation-4)'),
        (r'box-shadow:\s*0\s+8px\s+24px\s+' + _rgba_nested,           'box-shadow: var(--elevation-3)'),
        (r'box-shadow:\s*0\s+10px\s+(?:20|25|40)px\s+' + _rgba_nested, 'box-shadow: var(--elevation-3)'),
        (r'box-shadow:\s*0\s+12px\s+(?:24|25|32|40)px\s+' + _rgba_nested, 'box-shadow: var(--elevation-3)'),
        (r'box-shadow:\s*0\s+8px\s+25px\s+' + _rgba_nested,           'box-shadow: var(--elevation-3)'),
        (r'box-shadow:\s*-4px\s+0\s+24px\s+' + _rgba_nested,          'box-shadow: var(--elevation-3)'),
        # Medium shadows
        (r'box-shadow:\s*0\s+[34]px\s+12px\s+rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.[0-9]+\)', 'box-shadow: var(--elevation-2)'),
        (r'box-shadow:\s*0\s+4px\s+16px\s+rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.[0-9]+\)', 'box-shadow: var(--elevation-2)'),
        (r'box-shadow:\s*0\s+4px\s+20px\s+rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.[0-9]+\)', 'box-shadow: var(--elevation-2)'),
        (r'box-shadow:\s*0\s+24px\s+64px\s+' + _rgba_nested, 'box-shadow: var(--elevation-4)'),
        (r'box-shadow:\s*0\s+25px\s+50px\s+-?\d+px\s+' + _rgba_nested, 'box-shadow: var(--elevation-4)'),
        (r'box-shadow:\s*0\s+1px\s+4px\s+rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.[0-9]+\)', 'box-shadow: var(--shadow)'),
        # Light shadows
        (r'box-shadow:\s*0\s+2px\s+4px\s+rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.[0-9]+\)',  'box-shadow: var(--elevation-1)'),
        (r'box-shadow:\s*0\s+2px\s+(?:10|12|16)px\s+rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.[0-9]+\)', 'box-shadow: var(--shadow)'),
        (r'box-shadow:\s*0\s+2px\s+8px\s+rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.[0-9]+\)',  'box-shadow: var(--shadow)'),
        (r'box-shadow:\s*0\s+1px\s+3px\s+rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.[0-9]+\)',  'box-shadow: var(--shadow)'),
        (r'box-shadow:\s*0\s+1px\s+2px\s+rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.[0-9]+\)',  'box-shadow: var(--shadow-sm)'),
    ]
    for pattern, repl in box_shadow_replacements:
        content = re.sub(pattern, repl, content)

    # Keep color-tinted focus rings as rgba(var(--X-rgb), alpha) — already handled by step 2
    # The pattern `box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1)` stays as-is

    # ── 5. Hex colors in CSS properties ──────────────────────────────────

    # --- color: hex ---
    color_hex_map = [
        # Neutral / text
        (r'#333(?:333)?\b',  'var(--text-primary)'),
        (r'#666(?:666)?\b',  'var(--text-secondary)'),
        (r'#999(?:999)?\b',  'var(--text-tertiary)'),
        (r'#(?:fff|ffffff|FFFFFF|FFF)\b', 'var(--white)'),
        # Status
        (r'#(?:22c55e|4caf50|27ae60)\b', 'var(--success)'),
        (r'#(?:10b981|10B981)\b',         'var(--success)'),
        (r'#(?:059669)\b',                'var(--success-dark)'),
        (r'#(?:219a52)\b',                'var(--success-dark)'),
        (r'#(?:ef4444|EF4444|f44336|e74c3c)\b', 'var(--error)'),
        (r'#(?:b91c1c|c62828|d32f2f|dc2626|c0392b)\b', 'var(--error-dark)'),
        (r'#(?:fef2f2|fde8e8)\b',         'var(--error-light)'),
        (r'#(?:fecaca)\b',                'rgba(var(--error-rgb), 0.3)'),
        (r'#(?:991B1B|991b1b)\b',         'var(--error-dark)'),
        (r'#(?:f59e0b|F59E0B)\b',         'var(--warning)'),
        (r'#(?:ffc107|FFC107)\b',           'var(--warning)'),
        (r'#(?:d39e00|D39E00)\b',           'var(--warning-dark)'),
        (r'#(?:d97706|D97706)\b',           'var(--warning-dark)'),
        (r'#(?:92400[Ee]|92400e)\b',        'var(--warning-dark)'),
        (r'#(?:665000)\b',                  'var(--warning-dark)'),
        (r'#(?:332701)\b',                  'var(--warning-dark)'),
        (r'#(?:ff9800)\b',                  'var(--warning)'),
        (r'#(?:fff3cd)\b',                  'rgba(var(--warning-rgb), 0.15)'),
        (r'#(?:856404)\b',                  'var(--warning-dark)'),
        (r'#(?:3b82f6|3B82F6|2196F3|3498db)\b', 'var(--info)'),
        (r'#(?:1e40af|1E40AF|1976D2|2563[Ee][Bb])\b',  'var(--info-dark)'),
        # Success dark shades
        (r'#(?:065[Ff]46|065f46)\b',        'var(--success-dark)'),
        (r'#(?:16[Aa]34[Aa]|16a34a)\b',     'var(--success)'),
        # Text gray shades
        (r'#(?:374151)\b',                  'var(--text-secondary)'),
        (r'#(?:6[Bb]7280)\b',               'var(--text-secondary)'),
        (r'#(?:9[Cc][Aa]3[Aa][Ff]|9ca3af)\b', 'var(--text-tertiary)'),
        # Purple variant
        (r'#(?:7[Cc]3[Aa][Ee][Dd]|7c3aed)\b', 'var(--primary-light)'),
        (r'#(?:6[Dd]28[Dd]9|6d28d9)\b',     'var(--primary-dark)'),
        (r'#(?:5[Aa]3[Aa][Aa]8|5a3aa8)\b',  'var(--primary-dark)'),
        (r'#(?:9333[Ee][Aa]|9333ea)\b',      'var(--primary)'),
        (r'#(?:[Bb]45309|b45309)\b',         'var(--warning-dark)'),
        (r'#(?:[Ff][Bb][Bb][Ff]24|fbbf24)\b',  'var(--warning)'),
        (r'#(?:78350[Ff]|78350f)\b',           'var(--warning-dark)'),
        (r'#(?:60[Aa]5[Ff][Aa]|60a5fa)\b',     'var(--info)'),
        (r'#(?:9[Ff]7[Aa][Ee][Aa]|9f7aea)\b',  'var(--primary-light)'),
        (r'#(?:22[Cc]55[Ee]|22c55e)\b',         'var(--success)'),
        # Primary / purple
        (r'#(?:6B46C1|6b46c1)\b',         'var(--primary)'),
        (r'#(?:553C9A|553c9a)\b',          'var(--primary-dark)'),
        (r'#(?:8B5CF6|8b5cf6)\b',          'var(--primary-light)'),
        (r'#(?:a855f7|A855F7)\b',          'var(--primary-light)'),
        (r'#(?:667eea)\b',                 'var(--primary)'),
        (r'#(?:5568d3)\b',                 'var(--primary-dark)'),
        (r'#(?:764ba2)\b',                 'var(--primary-dark)'),
        (r'#(?:9C27B0|9c27b0)\b',          'var(--primary)'),
        (r'#(?:7B1FA2|7b1fa2)\b',          'var(--primary-dark)'),
        # Neutral surfaces
        (r'#(?:e0e0e0)\b',                 'var(--border)'),
        (r'#(?:f3f3f3)\b',                 'var(--border)'),
        (r'#(?:f0f0f0|f5f5f5|fafafa|f4f4f4)\b', 'var(--surface)'),
    ]

    # Apply in `color:` context
    for hex_pat, var in color_hex_map:
        content = re.sub(r'((?:^|\s)color:\s*)' + hex_pat, r'\1' + var, content, flags=re.MULTILINE | re.IGNORECASE)
        # Also handle stroke: (SVG) same map
        content = re.sub(r'(stroke:\s*)' + hex_pat, r'\1' + var, content, flags=re.IGNORECASE)
        # Also handle fill: same map
        content = re.sub(r'(fill:\s*)' + hex_pat, r'\1' + var, content, flags=re.IGNORECASE)

    # Apply in `background:` / `background-color:` context
    bg_hex_map = [
        (r'#(?:fff|ffffff|FFFFFF|FFF)\b',    'var(--background)'),
        (r'#(?:22c55e|4caf50|27ae60)\b',     'var(--success)'),
        (r'#(?:10b981|10B981)\b',            'var(--success)'),
        (r'#(?:f44336|ef4444|EF4444)\b',     'var(--error)'),
        (r'#(?:fef2f2|fde8e8)\b',            'var(--error-light)'),
        (r'#(?:667eea)\b',                   'var(--primary)'),
        (r'#(?:5568d3)\b',                   'var(--primary-dark)'),
        (r'#(?:27ae60)\b',                   'var(--success)'),
        (r'#(?:219a52)\b',                   'var(--success-dark)'),
        (r'#(?:c0392b)\b',                   'var(--error-dark)'),
        (r'#(?:e74c3c)\b',                   'var(--error)'),
        (r'#(?:e74c3c|c62828|d32f2f)\b',     'var(--error-dark)'),
        (r'#(?:f0f0f0|f5f5f5|fafafa)\b',     'var(--surface)'),
        (r'#(?:fff3cd)\b',                   'rgba(var(--warning-rgb), 0.15)'),
        (r'#(?:332701)\b',                   'var(--warning-dark)'),
        (r'#(?:5[Aa]3[Aa][Aa]8|5a3aa8)\b',  'var(--primary-dark)'),
        (r'#(?:7[Cc]3[Aa][Ee][Dd]|7c3aed)\b', 'var(--primary-light)'),
        (r'#(?:6[Dd]28[Dd]9|6d28d9)\b',     'var(--primary-dark)'),
        (r'#(?:9[Ff]7[Aa][Ee][Aa]|9f7aea)\b', 'var(--primary-light)'),
        (r'#(?:[Ff][Bb][Bb][Ff]24|fbbf24)\b', 'var(--warning)'),
        (r'#(?:60[Aa]5[Ff][Aa]|60a5fa)\b',  'var(--info)'),
    ]
    for hex_pat, var in bg_hex_map:
        content = re.sub(r'(background(?:-color)?:\s*)' + hex_pat, r'\1' + var, content, flags=re.IGNORECASE)

    # Apply green/danger specific hex in background buttons
    content = re.sub(r'(background:\s*)#(?:27ae60)\b', r'\1var(--success)', content)
    content = re.sub(r'(background:\s*)#(?:219a52)\b', r'\1var(--success-dark)', content)

    # Borders: replace hex colors in `border` properties (expanded set)
    def fix_border_hex(m):
        full = m.group(0)
        for hex_pat, var in [
            (r'#(?:f3f3f3)\b', 'var(--border)'),
            (r'#(?:e0e0e0)\b', 'var(--border)'),
            (r'#(?:3b82f6|3B82F6)\b', 'var(--info)'),
            (r'#(?:ef4444|EF4444)\b', 'var(--error)'),
            (r'#(?:fecaca)\b', 'rgba(var(--error-rgb), 0.3)'),
            (r'#(?:667eea)\b', 'var(--primary)'),
            (r'#(?:ffc107|FFC107)\b', 'var(--warning)'),
            (r'#(?:665000)\b', 'var(--warning-dark)'),
            (r'#(?:fff|ffffff|FFF|FFFFFF)\b', 'var(--white)'),
        ]:
            full = re.sub(hex_pat, var, full, flags=re.IGNORECASE)
        return full

    content = re.sub(r'border(?:-[a-z]+)*:[^;{}\n]+', fix_border_hex, content)

    # Fix gradient with #7c3aed variant → use primary-dark
    content = re.sub(
        r'linear-gradient\(135deg,\s*var\(--primary\)\s*,\s*#7[Cc]3[Aa][Ee][Dd]\)',
        'linear-gradient(135deg, var(--primary), var(--primary-dark))',
        content
    )
    # Fix var(--shadow-large, ...) fallback containing full shadow → just use elevation-4
    content = re.sub(
        r'box-shadow:\s*var\(--shadow-large\s*,[^)]+\)',
        'box-shadow: var(--elevation-4)',
        content
    )
    # Fix success gradient `linear-gradient(135deg, var(--success), #059669)` → use success-dark
    content = re.sub(
        r'linear-gradient\(135deg,\s*var\(--success\)\s*,\s*#059669\)',
        'linear-gradient(135deg, var(--success), var(--success-dark))',
        content
    )
    # Fix warning gradient `linear-gradient(135deg, var(--warning), #f59e0b)` → solid warning (same color)
    content = re.sub(
        r'linear-gradient\(135deg,\s*var\(--warning\)\s*,\s*#[Ff]59[Ee]0[Bb]\)',
        'linear-gradient(135deg, var(--warning), var(--warning-dark))',
        content
    )
    # Fix all-hex purple gradient `#7c3aed, #6d28d9`
    content = re.sub(
        r'linear-gradient\(135deg,\s*#7[Cc]3[Aa][Ee][Dd]\s*,\s*#6[Dd]28[Dd]9\)',
        'linear-gradient(135deg, var(--primary-light), var(--primary-dark))',
        content
    )
    # Fix success gradient `#22c55e, #16a34a`
    content = re.sub(
        r'linear-gradient\(135deg,\s*#22[Cc]55[Ee]\s*,\s*#16[Aa]34[Aa]\)',
        'linear-gradient(135deg, var(--success), var(--success-dark))',
        content
    )
    # Fix gradient `#9f7aea, var(--primary)` → primary-light to primary
    content = re.sub(
        r'linear-gradient\(135deg,\s*#9[Ff]7[Aa][Ee][Aa]\s*,\s*var\(--primary\)\)',
        'linear-gradient(135deg, var(--primary-light), var(--primary))',
        content
    )

    # ── 6. Linear gradients with hardcoded colors ─────────────────────────
    gradient_map = [
        (r'linear-gradient\(\s*135deg\s*,\s*#10[Bb]981\s*,\s*#059669\s*\)',
         'linear-gradient(135deg, var(--success), var(--success-dark))'),
        (r'linear-gradient\(\s*135deg\s*,\s*#[Ff]59[Ee]0[Bb]\s*,\s*#[Dd]97706\s*\)',
         'linear-gradient(135deg, var(--warning), var(--warning-dark))'),
        (r'linear-gradient\(\s*90deg\s*,\s*#[Ff]59[Ee]0[Bb]\s*,\s*#[Dd]97706\s*\)',
         'linear-gradient(90deg, var(--warning), var(--warning-dark))'),
        (r'linear-gradient\(\s*135deg\s*,\s*#3[Bb]82[Ff]6\s*,\s*#2563[Ee][Bb]\s*\)',
         'linear-gradient(135deg, var(--info), var(--info-dark))'),
        (r'linear-gradient\(\s*90deg\s*,\s*#3[Bb]82[Ff]6\s*,\s*#2563[Ee][Bb]\s*\)',
         'linear-gradient(90deg, var(--info), var(--info-dark))'),
        (r'linear-gradient\(\s*135deg\s*,\s*#2196F3\s*,\s*#1976D2\s*\)',
         'linear-gradient(135deg, var(--info), var(--info-dark))'),
        (r'linear-gradient\(\s*135deg\s*,\s*#9C27B0\s*,\s*#7B1FA2\s*\)',
         'linear-gradient(135deg, var(--primary), var(--primary-dark))'),
        (r'linear-gradient\(\s*135deg\s*,\s*#[Ff]44336\s*,\s*#[Dd]32[Ff]2[Ff]\s*\)',
         'linear-gradient(135deg, var(--error), var(--error-dark))'),
        (r'linear-gradient\(\s*135deg\s*,\s*#667[Ee]{1}[Ee]{1}[Aa]\s+0%\s*,\s*#764[Bb][Aa]2\s+100%\s*\)',
         'var(--gradient-primary)'),
        (r'linear-gradient\(\s*135deg\s*,\s*#667[Ee]{1}[Ee]{1}[Aa]\s*,\s*#764[Bb][Aa]2\s*\)',
         'var(--gradient-primary)'),
        # Light status gradients (badge backgrounds) 
        (r'linear-gradient\(\s*135deg\s*,\s*#[Ff][Ee][Ff]3[Cc]7\s*,\s*#[Ff][Dd][Ee]68[Aa]\s*\)',
         'linear-gradient(135deg, rgba(var(--warning-rgb), 0.2), rgba(var(--warning-rgb), 0.35))'),
        (r'linear-gradient\(\s*135deg\s*,\s*#[Dd]1[Ff][Aa][Ee]5\s*,\s*#[Aa]7[Ff]3[Dd]0\s*\)',
         'linear-gradient(135deg, rgba(var(--success-rgb), 0.15), rgba(var(--success-rgb), 0.3))'),
        (r'linear-gradient\(\s*135deg\s*,\s*#[Ff][Ee][Ee]2[Ee]2\s*,\s*#[Ff][Ee][Cc][Aa][Cc][Aa]\s*\)',
         'linear-gradient(135deg, rgba(var(--error-rgb), 0.15), rgba(var(--error-rgb), 0.3))'),
        (r'linear-gradient\(\s*135deg\s*,\s*#[Dd][Bb][Ee][Aa][Ff][Ee]\s*,\s*#[Bb][Ff][Dd][Bb][Ff][Ee]\s*\)',
         'linear-gradient(135deg, rgba(var(--info-rgb), 0.15), rgba(var(--info-rgb), 0.3))'),
        # "90deg" variants too
        (r'linear-gradient\(\s*90deg\s*,\s*var\(--success\)\s*,\s*#059669\s*\)',
         'linear-gradient(90deg, var(--success), var(--success-dark))'),
        (r'linear-gradient\(\s*90deg\s*,\s*var\(--info\)\s*,\s*#2563[Ee][Bb]\s*\)',
         'linear-gradient(90deg, var(--info), var(--info-dark))'),
    ]
    for pat, repl in gradient_map:
        content = re.sub(pat, repl, content)

    # ── 7. Transitions ────────────────────────────────────────────────────
    content = re.sub(r'transition:\s*all\s+0\.15s\s+ease(?:-in-out)?(?=\s*[;{}\n])', 'transition: var(--transition-fast)', content)
    content = re.sub(r'transition:\s*all\s+0\.2s\s+ease(?:-in-out)?(?=\s*[;{}\n])', 'transition: var(--transition)', content)
    content = re.sub(r'transition:\s*all\s+0\.3s\s+ease(?:-in-out)?(?=\s*[;{}\n])', 'transition: var(--transition-slow)', content)
    content = re.sub(r'transition:\s*all\s+0\.15s\s*(?=[;{}\n])', 'transition: var(--transition-fast)', content)
    content = re.sub(r'transition:\s*all\s+0\.2s\s*(?=[;{}\n])', 'transition: var(--transition)', content)
    content = re.sub(r'transition:\s*all\s+0\.3s\s*(?=[;{}\n])', 'transition: var(--transition-slow)', content)

    # ── 8. Z-index (high values → named z-index vars) ─────────────────────
    content = re.sub(r'z-index:\s*1100\b', 'z-index: var(--z-tooltip)', content)
    content = re.sub(r'z-index:\s*1070\b', 'z-index: var(--z-tooltip)', content)
    content = re.sub(r'z-index:\s*1060\b', 'z-index: var(--z-popover)', content)
    content = re.sub(r'z-index:\s*1050\b', 'z-index: var(--z-modal)', content)
    content = re.sub(r'z-index:\s*1040\b', 'z-index: var(--z-modal-backdrop)', content)
    content = re.sub(r'z-index:\s*1030\b', 'z-index: var(--z-fixed)', content)
    content = re.sub(r'z-index:\s*1020\b', 'z-index: var(--z-sticky)', content)
    content = re.sub(r'z-index:\s*1000\b', 'z-index: var(--z-dropdown)', content)
    # z-index: 999 → dropdown
    content = re.sub(r'z-index:\s*999\b',  'z-index: var(--z-dropdown)', content)
    content = re.sub(r'z-index:\s*100\b',  'z-index: var(--z-dropdown)', content)

    # ── Fix var(--color-primary-light) → var(--primary-light) ────────────
    content = content.replace('var(--color-primary-light)', 'var(--primary-light)')

    # ── Add missing rgba() mappings (pink/slate not handled before) ───────
    # Pink (no semantic equivalent, map to primary as decorative)
    content = re.sub(r'rgba\(\s*236\s*,\s*72\s*,\s*153\s*,\s*([0-9.]+)\s*\)', r'rgba(var(--primary-rgb), \1)', content)
    # Slate gray 148,163,184 → surface-hover or text-tertiary alpha
    content = re.sub(r'rgba\(\s*148\s*,\s*163\s*,\s*184\s*,\s*([0-9.]+)\s*\)', r'rgba(var(--text-tertiary-rgb, 148, 163, 184), \1)', content)
    # rgba(255,255,255, alpha) on dark bg → transparent white
    content = re.sub(r'rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*([0-9.]+)\s*\)', r'rgba(255, 255, 255, \1)', content)
    # rgba(0,0,0, 0.3) → use overlay at lower opacity
    content = re.sub(r'rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.3\s*\)', 'rgba(0, 0, 0, 0.3)', content)
    # rgba(14, 165, 233) → info (sky blue)
    content = re.sub(r'rgba\(\s*14\s*,\s*165\s*,\s*233\s*,\s*([0-9.]+)\s*\)', r'rgba(var(--info-rgb), \1)', content)
    # rgba(34, 197, 94) → success (green)
    content = re.sub(r'rgba\(\s*34\s*,\s*197\s*,\s*94\s*,\s*([0-9.]+)\s*\)', r'rgba(var(--success-rgb), \1)', content)

    # ── 9. Line-by-line replacements for font-size, font-weight, border-radius, spacing ──
    lines = content.split('\n')
    new_lines = []
    for line in lines:
        # Skip lines that are inside CSS variable definitions or already fully converted
        if re.match(r'\s*--', line):  # variable definition line, don't modify
            new_lines.append(line)
            continue
        if re.match(r'\s*//', line) or re.match(r'\s*/\*', line):  # comment line
            new_lines.append(line)
            continue

        # Font size
        if 'font-size:' in line and 'var(--font-size' not in line:
            line = process_font_size_line(line + ('\n' if not line.endswith('\n') else ''))
            line = line.rstrip('\n')

        # Font weight
        if 'font-weight:' in line and 'var(--font-weight' not in line:
            line = process_font_weight_line(line + ('\n' if not line.endswith('\n') else ''))
            line = line.rstrip('\n')

        # Border radius
        if 'border-radius:' in line:
            line = process_border_radius_line(line + ('\n' if not line.endswith('\n') else ''))
            line = line.rstrip('\n')

        # Spacing (padding, margin, gap)
        if re.match(r'\s*(?:padding|margin|gap)(?:-[a-z-]+)?:', line):
            line = process_spacing_line(line + ('\n' if not line.endswith('\n') else ''))
            line = line.rstrip('\n')

        new_lines.append(line)

    content = '\n'.join(new_lines)

    # ── 10. inline border with hex inside shorthand ───────────────────────
    # border: 1px solid #3b82f6 already handled in step 5

    return content


def main():
    scss_files = glob.glob(os.path.join(BASE, "**", "*.scss"), recursive=True)
    print(f"Found {len(scss_files)} SCSS files")

    updated = 0
    for filepath in sorted(scss_files):
        with open(filepath, 'r', encoding='utf-8') as f:
            original = f.read()

        transformed = transform_content(original)

        if transformed != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(transformed)
            rel = os.path.relpath(filepath, BASE)
            print(f"  Updated: {rel}")
            updated += 1

    print(f"\nDone. {updated}/{len(scss_files)} files updated.")


if __name__ == "__main__":
    main()
