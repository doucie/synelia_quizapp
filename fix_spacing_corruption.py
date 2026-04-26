"""
Fix corrupted spacing values caused by regex bug in fix_scss_rules.py.
The bug: patterns like `4rem` were matched inside decimal values like `0.4rem`,
turning `0.4rem` into `0.var(--spacing-3xl)`.

Reverse mapping (based on SPACING_MAP):
  4rem → --spacing-3xl  → digit.var(--spacing-3xl) came from digit.4rem
  3rem → --spacing-2xl  → digit.var(--spacing-2xl) came from digit.3rem
  2rem → --spacing-xl   → digit.var(--spacing-xl)  came from digit.2rem
  1rem → --spacing-md   → digit.var(--spacing-md)  came from digit.1rem
"""
import re
import os
import sys

SCSS_ROOT = os.path.join(os.path.dirname(__file__), 'quizapp_front', 'src', 'app')

REVERSE_MAP = [
    # Pattern: digit + .var(--spacing-X) → digit + .Nrem
    (r'(\d)\.var\(--spacing-3xl\)', r'\g<1>.4rem'),
    (r'(\d)\.var\(--spacing-2xl\)', r'\g<1>.3rem'),
    (r'(\d)\.var\(--spacing-xl\)',  r'\g<1>.2rem'),
    (r'(\d)\.var\(--spacing-md\)',  r'\g<1>.1rem'),
]

fixed_files = 0
fixed_total = 0

for dirpath, dirnames, filenames in os.walk(SCSS_ROOT):
    for fname in filenames:
        if not fname.endswith('.scss'):
            continue
        fpath = os.path.join(dirpath, fname)
        with open(fpath, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()

        new_content = content
        count = 0
        for pattern, replacement in REVERSE_MAP:
            new_content, n = re.subn(pattern, replacement, new_content)
            count += n

        if count > 0:
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            rel = os.path.relpath(fpath, SCSS_ROOT)
            print(f"  [{count:2d}] {rel}")
            fixed_files += 1
            fixed_total += count

print(f"\nDone. Fixed {fixed_total} values in {fixed_files} files.")
