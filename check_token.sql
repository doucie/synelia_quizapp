-- Vérifier le token dans la base de données
SELECT 
    id,
    email,
    LEFT(token, 30) as token_preview,
    LENGTH(token) as token_length,
    token_type,
    is_used,
    created_at,
    expires_at,
    token -- token complet
FROM email_verification_token 
ORDER BY created_at DESC 
LIMIT 3;

-- Si vous avez le token exact, vous pouvez chercher comme ceci :
-- SELECT * FROM email_verification_token 
-- WHERE token = 'df3a60e8e3b04645b4704112770274117df97d3aadb14680b0ac17211c37f567';
