-- V1_020 : Système de templates email prédéfinis + mapping type d'action
-- 9a: Table email_template_preset
CREATE TABLE IF NOT EXISTS email_template_preset (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category ENUM('MINIMAL','MODERN','CORPORATE','COLORFUL','DARK') NOT NULL DEFAULT 'MODERN',
    html_structure TEXT NOT NULL,
    preview_image VARCHAR(500) DEFAULT NULL,
    description VARCHAR(500) DEFAULT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9b: Ajouter action_type à email_template
ALTER TABLE email_template
    ADD COLUMN action_type VARCHAR(50) DEFAULT NULL AFTER available_variables,
    ADD COLUMN preset_id INT DEFAULT NULL AFTER action_type;

-- Index pour recherche par action_type
CREATE INDEX idx_email_template_action_type ON email_template(action_type);

-- Insérer les presets de base
INSERT INTO email_template_preset (name, category, html_structure, description) VALUES
('Minimal', 'MINIMAL',
'<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;margin:0;padding:0;background:#f8f9fa}
.container{max-width:600px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden}
.header{padding:30px;text-align:center;background:{{primaryColor}};color:#fff}
.header h1{margin:0;font-size:24px;font-weight:600}
.body{padding:30px;color:#333;line-height:1.6;font-size:15px}
.footer{padding:20px 30px;text-align:center;font-size:12px;color:#999;border-top:1px solid #eee}
.btn{display:inline-block;padding:12px 30px;background:{{primaryColor}};color:#fff;text-decoration:none;border-radius:6px;font-weight:600;margin:15px 0}
</style></head><body><div class="container"><div class="header"><h1>{{companyName}}</h1></div><div class="body">{{content}}</div><div class="footer">{{companyName}} — {{currentYear}}</div></div></body></html>',
'Template épuré avec un header simple, un corps de texte et un footer minimal.'),

('Modern', 'MODERN',
'<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;margin:0;padding:0;background:#f0f2f5}
.container{max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)}
.header{padding:40px 30px;background:linear-gradient(135deg,{{primaryColor}},{{primaryColorDark}});color:#fff;text-align:center}
.header h1{margin:0 0 8px;font-size:26px;font-weight:700;letter-spacing:-0.5px}
.header p{margin:0;opacity:0.85;font-size:14px}
.body{padding:35px 30px;color:#1a1a2e;line-height:1.7;font-size:15px}
.body h2{color:{{primaryColor}};font-size:20px;margin-top:0}
.cta{text-align:center;padding:0 30px 35px}
.btn{display:inline-block;padding:14px 36px;background:{{primaryColor}};color:#fff;text-decoration:none;border-radius:10px;font-weight:600;font-size:15px;transition:all 0.2s}
.footer{padding:25px 30px;background:#f8f9fa;text-align:center;font-size:12px;color:#666;border-top:1px solid #e8e8e8}
.footer a{color:{{primaryColor}};text-decoration:none}
</style></head><body><div class="container"><div class="header"><h1>{{companyName}}</h1><p>{{subtitle}}</p></div><div class="body">{{content}}</div><div class="cta">{{ctaButton}}</div><div class="footer"><p>{{companyName}} &copy; {{currentYear}}</p><p><a href="{{unsubscribeUrl}}">Se désabonner</a></p></div></div></body></html>',
'Template moderne avec gradient, ombres et bouton CTA proéminent.'),

('Corporate', 'CORPORATE',
'<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Georgia,Times New Roman,serif;margin:0;padding:0;background:#f5f5f0}
.container{max-width:600px;margin:40px auto;background:#fff;border:1px solid #ddd}
.header{padding:25px 30px;border-bottom:3px solid {{primaryColor}};display:flex;align-items:center;gap:15px}
.header img{height:40px}
.header h1{margin:0;font-size:20px;color:#333;font-weight:600}
.body{padding:30px;color:#444;line-height:1.8;font-size:15px}
.body h2{color:#333;font-size:18px;border-bottom:1px solid #eee;padding-bottom:8px}
.signature{padding:20px 30px;border-top:1px solid #eee;font-size:13px;color:#666}
.footer{padding:15px 30px;background:#f8f8f5;text-align:center;font-size:11px;color:#999;border-top:1px solid #ddd}
.btn{display:inline-block;padding:10px 24px;background:{{primaryColor}};color:#fff;text-decoration:none;font-weight:600;font-size:14px}
</style></head><body><div class="container"><div class="header"><h1>{{companyName}}</h1></div><div class="body">{{content}}</div><div class="signature">{{signature}}</div><div class="footer">{{companyName}} — {{companyAddress}}<br>{{currentYear}}</div></div></body></html>',
'Template professionnel avec serif, signature et aspect corporate sobre.'),

('Colorful', 'COLORFUL',
'<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Poppins,Nunito,sans-serif;margin:0;padding:0;background:linear-gradient(180deg,#f8f0ff,#fff5f5)}
.container{max-width:600px;margin:40px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(107,70,193,0.12)}
.header{padding:40px;background:linear-gradient(135deg,{{primaryColor}},#ec4899,#f59e0b);color:#fff;text-align:center}
.header h1{margin:0;font-size:28px;font-weight:800;letter-spacing:-0.5px}
.header .emoji{font-size:36px;margin-bottom:10px}
.body{padding:35px;color:#333;line-height:1.7;font-size:15px}
.highlight{background:linear-gradient(135deg,rgba(107,70,193,0.1),rgba(236,72,153,0.1));border-left:4px solid {{primaryColor}};padding:15px 20px;border-radius:0 10px 10px 0;margin:15px 0}
.btn{display:inline-block;padding:14px 32px;background:linear-gradient(135deg,{{primaryColor}},#ec4899);color:#fff;text-decoration:none;border-radius:50px;font-weight:700;font-size:15px}
.footer{padding:25px;text-align:center;font-size:12px;color:#999}
</style></head><body><div class="container"><div class="header"><div class="emoji">{{emoji}}</div><h1>{{title}}</h1></div><div class="body">{{content}}</div><div class="footer">{{companyName}} {{currentYear}}</div></div></body></html>',
'Template coloré et dynamique avec gradient multicolore et emoji header.'),

('Dark', 'DARK',
'<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;margin:0;padding:0;background:#0f0f23}
.container{max-width:600px;margin:40px auto;background:#1a1a2e;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)}
.header{padding:35px 30px;background:linear-gradient(135deg,#1a1a2e,#16213e);text-align:center;border-bottom:1px solid rgba(255,255,255,0.06)}
.header h1{margin:0;font-size:24px;font-weight:700;color:#fff}
.header p{margin:8px 0 0;color:rgba(255,255,255,0.6);font-size:13px}
.body{padding:35px 30px;color:rgba(255,255,255,0.85);line-height:1.7;font-size:15px}
.body h2{color:{{primaryColor}};font-size:18px}
.body a{color:{{primaryColor}}}
.cta{text-align:center;padding:0 30px 30px}
.btn{display:inline-block;padding:14px 36px;background:{{primaryColor}};color:#fff;text-decoration:none;border-radius:10px;font-weight:600;font-size:15px}
.footer{padding:20px 30px;text-align:center;font-size:12px;color:rgba(255,255,255,0.4);border-top:1px solid rgba(255,255,255,0.06)}
</style></head><body><div class="container"><div class="header"><h1>{{companyName}}</h1><p>{{subtitle}}</p></div><div class="body">{{content}}</div><div class="cta">{{ctaButton}}</div><div class="footer">{{companyName}} &copy; {{currentYear}}</div></div></body></html>',
'Template sombre élégant avec fond noir/bleu marine et accents lumineux.');
