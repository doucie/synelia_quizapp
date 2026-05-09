-- Refresh legacy seeded email presets with the newer refactored layouts

UPDATE email_template_preset
SET html_structure = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;margin:0;padding:24px;background:#f8f9fa}.container{max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden}.header{padding:28px;text-align:center;background:{{primaryColor}};color:#fff}.body{padding:30px;color:#334155;line-height:1.65;font-size:15px}.footer{padding:18px 30px;color:#94a3b8;font-size:12px;border-top:1px solid #e2e8f0}</style></head><body><div class="container"><div class="header"><h1>{{companyName}}</h1></div><div class="body">{{content}}</div><div class="footer">{{companyName}} - {{currentYear}}</div></div></body></html>',
    description = 'Template epure avec header simple, contenu central et footer discret.',
    is_deleted = FALSE,
    updated_at = NOW()
WHERE name = 'Minimal' AND category = 'MINIMAL';

INSERT INTO email_template_preset (name, category, html_structure, description, is_deleted, created_at, updated_at)
SELECT 'Minimal', 'MINIMAL', '<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;margin:0;padding:24px;background:#f8f9fa}.container{max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden}.header{padding:28px;text-align:center;background:{{primaryColor}};color:#fff}.body{padding:30px;color:#334155;line-height:1.65;font-size:15px}.footer{padding:18px 30px;color:#94a3b8;font-size:12px;border-top:1px solid #e2e8f0}</style></head><body><div class="container"><div class="header"><h1>{{companyName}}</h1></div><div class="body">{{content}}</div><div class="footer">{{companyName}} - {{currentYear}}</div></div></body></html>', 'Template epure avec header simple, contenu central et footer discret.', FALSE, NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM email_template_preset WHERE name = 'Minimal' AND category = 'MINIMAL'
);

UPDATE email_template_preset
SET html_structure = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Segoe UI,Roboto,sans-serif;margin:0;padding:24px;background:#eef2ff}.container{max-width:640px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 10px 35px rgba(15,23,42,0.08)}.header{padding:40px 32px;background:linear-gradient(135deg,{{primaryColor}},{{primaryColorDark}});color:#fff;text-align:center}.body{padding:34px 32px;color:#1e293b;line-height:1.7}.cta{text-align:center;padding:0 32px 32px}.footer{padding:24px 32px;background:#f8fafc;color:#64748b;font-size:12px;text-align:center}.btn{display:inline-block;padding:14px 30px;background:{{primaryColor}};color:#fff;text-decoration:none;border-radius:999px;font-weight:700}</style></head><body><div class="container"><div class="header"><h1>{{companyName}}</h1><p>{{subtitle}}</p></div><div class="body">{{content}}</div><div class="cta"><a href="{{buttonLink}}" class="btn">{{buttonText}}</a></div><div class="footer">{{companyName}} - {{currentYear}}</div></div></body></html>',
    description = 'Template moderne avec gradient, CTA et footer structure.',
    is_deleted = FALSE,
    updated_at = NOW()
WHERE name = 'Modern' AND category = 'MODERN';

INSERT INTO email_template_preset (name, category, html_structure, description, is_deleted, created_at, updated_at)
SELECT 'Modern', 'MODERN', '<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Segoe UI,Roboto,sans-serif;margin:0;padding:24px;background:#eef2ff}.container{max-width:640px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 10px 35px rgba(15,23,42,0.08)}.header{padding:40px 32px;background:linear-gradient(135deg,{{primaryColor}},{{primaryColorDark}});color:#fff;text-align:center}.body{padding:34px 32px;color:#1e293b;line-height:1.7}.cta{text-align:center;padding:0 32px 32px}.footer{padding:24px 32px;background:#f8fafc;color:#64748b;font-size:12px;text-align:center}.btn{display:inline-block;padding:14px 30px;background:{{primaryColor}};color:#fff;text-decoration:none;border-radius:999px;font-weight:700}</style></head><body><div class="container"><div class="header"><h1>{{companyName}}</h1><p>{{subtitle}}</p></div><div class="body">{{content}}</div><div class="cta"><a href="{{buttonLink}}" class="btn">{{buttonText}}</a></div><div class="footer">{{companyName}} - {{currentYear}}</div></div></body></html>', 'Template moderne avec gradient, CTA et footer structure.', FALSE, NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM email_template_preset WHERE name = 'Modern' AND category = 'MODERN'
);

UPDATE email_template_preset
SET html_structure = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Georgia,Times New Roman,serif;margin:0;padding:24px;background:#f5f5f0}.container{max-width:640px;margin:0 auto;background:#fff;border:1px solid #d6d3d1}.header{padding:26px 30px;border-bottom:4px solid {{primaryColor}}}.body{padding:32px 30px;color:#44403c;line-height:1.8}.signature{padding:18px 30px;border-top:1px solid #e7e5e4;color:#57534e;font-size:13px}.footer{padding:18px 30px;background:#fafaf9;color:#78716c;font-size:12px;text-align:center}.btn{display:inline-block;padding:12px 24px;background:{{primaryColor}};color:#fff;text-decoration:none;font-weight:700}</style></head><body><div class="container"><div class="header"><h1>{{companyName}}</h1></div><div class="body">{{content}}</div><div class="signature">{{signature}}</div><div class="footer">{{companyName}} - {{companyAddress}} - {{currentYear}}</div></div></body></html>',
    description = 'Template professionnel, sobre et adapte aux messages officiels.',
    is_deleted = FALSE,
    updated_at = NOW()
WHERE name = 'Corporate' AND category = 'CORPORATE';

INSERT INTO email_template_preset (name, category, html_structure, description, is_deleted, created_at, updated_at)
SELECT 'Corporate', 'CORPORATE', '<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Georgia,Times New Roman,serif;margin:0;padding:24px;background:#f5f5f0}.container{max-width:640px;margin:0 auto;background:#fff;border:1px solid #d6d3d1}.header{padding:26px 30px;border-bottom:4px solid {{primaryColor}}}.body{padding:32px 30px;color:#44403c;line-height:1.8}.signature{padding:18px 30px;border-top:1px solid #e7e5e4;color:#57534e;font-size:13px}.footer{padding:18px 30px;background:#fafaf9;color:#78716c;font-size:12px;text-align:center}.btn{display:inline-block;padding:12px 24px;background:{{primaryColor}};color:#fff;text-decoration:none;font-weight:700}</style></head><body><div class="container"><div class="header"><h1>{{companyName}}</h1></div><div class="body">{{content}}</div><div class="signature">{{signature}}</div><div class="footer">{{companyName}} - {{companyAddress}} - {{currentYear}}</div></div></body></html>', 'Template professionnel, sobre et adapte aux messages officiels.', FALSE, NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM email_template_preset WHERE name = 'Corporate' AND category = 'CORPORATE'
);

UPDATE email_template_preset
SET html_structure = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Poppins,Nunito,sans-serif;margin:0;padding:24px;background:linear-gradient(180deg,#f8f0ff,#fff7ed)}.container{max-width:620px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 14px 40px rgba(107,70,193,0.12)}.header{padding:38px 30px;background:linear-gradient(135deg,{{primaryColor}},#ec4899,#f59e0b);color:#fff;text-align:center}.emoji{font-size:34px;margin-bottom:10px}.body{padding:32px 30px;color:#334155;line-height:1.7}.footer{padding:22px 30px;text-align:center;color:#94a3b8;font-size:12px}.btn{display:inline-block;padding:14px 28px;background:linear-gradient(135deg,{{primaryColor}},#ec4899);color:#fff;text-decoration:none;border-radius:999px;font-weight:700}</style></head><body><div class="container"><div class="header"><div class="emoji">{{emoji}}</div><h1>{{title}}</h1></div><div class="body">{{content}}</div><div class="footer">{{companyName}} - {{currentYear}}</div></div></body></html>',
    description = 'Template dynamique avec header colore pour messages chaleureux.',
    is_deleted = FALSE,
    updated_at = NOW()
WHERE name = 'Colorful' AND category = 'COLORFUL';

INSERT INTO email_template_preset (name, category, html_structure, description, is_deleted, created_at, updated_at)
SELECT 'Colorful', 'COLORFUL', '<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Poppins,Nunito,sans-serif;margin:0;padding:24px;background:linear-gradient(180deg,#f8f0ff,#fff7ed)}.container{max-width:620px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 14px 40px rgba(107,70,193,0.12)}.header{padding:38px 30px;background:linear-gradient(135deg,{{primaryColor}},#ec4899,#f59e0b);color:#fff;text-align:center}.emoji{font-size:34px;margin-bottom:10px}.body{padding:32px 30px;color:#334155;line-height:1.7}.footer{padding:22px 30px;text-align:center;color:#94a3b8;font-size:12px}.btn{display:inline-block;padding:14px 28px;background:linear-gradient(135deg,{{primaryColor}},#ec4899);color:#fff;text-decoration:none;border-radius:999px;font-weight:700}</style></head><body><div class="container"><div class="header"><div class="emoji">{{emoji}}</div><h1>{{title}}</h1></div><div class="body">{{content}}</div><div class="footer">{{companyName}} - {{currentYear}}</div></div></body></html>', 'Template dynamique avec header colore pour messages chaleureux.', FALSE, NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM email_template_preset WHERE name = 'Colorful' AND category = 'COLORFUL'
);

UPDATE email_template_preset
SET html_structure = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Segoe UI,sans-serif;margin:0;padding:24px;background:#020617}.container{max-width:620px;margin:0 auto;background:#0f172a;border-radius:18px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)}.header{padding:34px 30px;background:linear-gradient(135deg,#0f172a,#1e293b);text-align:center;color:#fff}.body{padding:32px 30px;color:rgba(255,255,255,0.88);line-height:1.7}.cta{text-align:center;padding:0 30px 30px}.footer{padding:20px 30px;color:rgba(255,255,255,0.45);font-size:12px;text-align:center;border-top:1px solid rgba(255,255,255,0.08)}.btn{display:inline-block;padding:14px 30px;background:{{primaryColor}};color:#fff;text-decoration:none;border-radius:10px;font-weight:700}</style></head><body><div class="container"><div class="header"><h1>{{companyName}}</h1><p>{{subtitle}}</p></div><div class="body">{{content}}</div><div class="cta"><a href="{{buttonLink}}" class="btn">{{buttonText}}</a></div><div class="footer">{{companyName}} - {{currentYear}}</div></div></body></html>',
    description = 'Template sombre elegant avec contraste fort et CTA lumineux.',
    is_deleted = FALSE,
    updated_at = NOW()
WHERE name = 'Dark' AND category = 'DARK';

INSERT INTO email_template_preset (name, category, html_structure, description, is_deleted, created_at, updated_at)
SELECT 'Dark', 'DARK', '<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Segoe UI,sans-serif;margin:0;padding:24px;background:#020617}.container{max-width:620px;margin:0 auto;background:#0f172a;border-radius:18px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)}.header{padding:34px 30px;background:linear-gradient(135deg,#0f172a,#1e293b);text-align:center;color:#fff}.body{padding:32px 30px;color:rgba(255,255,255,0.88);line-height:1.7}.cta{text-align:center;padding:0 30px 30px}.footer{padding:20px 30px;color:rgba(255,255,255,0.45);font-size:12px;text-align:center;border-top:1px solid rgba(255,255,255,0.08)}.btn{display:inline-block;padding:14px 30px;background:{{primaryColor}};color:#fff;text-decoration:none;border-radius:10px;font-weight:700}</style></head><body><div class="container"><div class="header"><h1>{{companyName}}</h1><p>{{subtitle}}</p></div><div class="body">{{content}}</div><div class="cta"><a href="{{buttonLink}}" class="btn">{{buttonText}}</a></div><div class="footer">{{companyName}} - {{currentYear}}</div></div></body></html>', 'Template sombre elegant avec contraste fort et CTA lumineux.', FALSE, NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM email_template_preset WHERE name = 'Dark' AND category = 'DARK'
);