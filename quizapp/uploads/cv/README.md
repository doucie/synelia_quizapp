# Répertoire d'Upload des CVs

Ce répertoire contient les fichiers CVs uploadés par les candidats lors de leur candidature.

## 📁 Structure

```
uploads/cv/
├── .gitignore           # Ignore tous les fichiers uploadés
├── README.md            # Ce fichier
└── [CVs uploadés]       # Fichiers CV des candidats (non versionnés)
```

## 🔒 Sécurité

- Les fichiers uploadés ne sont **PAS versionnés** dans Git
- Seuls les formats PDF, DOC et DOCX sont acceptés
- Taille maximale : **5 Mo**
- Les noms de fichiers sont automatiquement sécurisés

## 📝 Nomenclature des fichiers

Format : `email_sanitized_timestamp.extension`

Exemple : `john_at_example_com_1729432156789.pdf`

## 🚀 Accès

- **Upload** : `POST /files/upload/cv` (public, pour les candidats)
- **Download** : `GET /files/download/{filename}` (authentifié, pour les recruteurs)
- **Vérification** : `GET /files/exists/{filename}` (authentifié)

## 💾 Backup

⚠️ **Important** : Ce répertoire doit être sauvegardé régulièrement car il contient des données sensibles (CVs des candidats).

## 🗑️ Nettoyage

Les CVs des candidatures supprimées ou rejetées doivent être nettoyés régulièrement conformément au RGPD.

## 📊 Permissions

Le répertoire doit avoir les permissions en écriture pour l'application Spring Boot :

```bash
chmod 755 uploads/cv
```

## 🔗 Référence en BDD

Le chemin du fichier est stocké dans la table `applications`, colonne `candidate_cv_path`.

Format en BDD : `uploads/cv/filename.pdf`
