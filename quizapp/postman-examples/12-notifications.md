# Notifications - Exemples d'occurrences multiples

**Endpoint:** `POST /notifications/create`  
**Base URL:** `http://localhost:8081`

---

## 📥 Créer les notifications (un par un)

> **Prérequis:** Avoir créé des utilisateurs avant d'exécuter ces requêtes

### 🎯 Notification 1 - Nouveau candidat
```json
{
    "user": "1",
    "datas": [
        {
            "notificationTitle": "Nouveau candidat",
            "notificationMessage": "Marie Martin a postulé pour le poste de Développeur Java Senior",
            "notificationType": "info",
            "isRead": false,
            "userId": 1
        }
    ]
}
```

### 🎯 Notification 2 - Entretien planifié
```json
{
    "user": "1",
    "datas": [
        {
            "notificationTitle": "Entretien planifié",
            "notificationMessage": "Entretien technique prévu demain à 14h avec Thomas Dubois",
            "notificationType": "warning",
            "isRead": false,
            "userId": 2
        }
    ]
}
```

### 🎯 Notification 3 - Quiz complété
```json
{
    "user": "1",
    "datas": [
        {
            "notificationTitle": "Quiz complété",
            "notificationMessage": "Sarah Chen a terminé le quiz avec un score de 91/100",
            "notificationType": "success",
            "isRead": false,
            "userId": 1
        }
    ]
}
```

### 🎯 Notification 4 - Candidature rejetée
```json
{
    "user": "1",
    "datas": [
        {
            "notificationTitle": "Candidature rejetée",
            "notificationMessage": "Alexandre Rodriguez n'a pas été retenu pour le poste",
            "notificationType": "error",
            "isRead": true,
            "userId": 3
        }
    ]
}
```

### 🎯 Notification 5 - Évaluation en attente
```json
{
    "user": "1",
    "datas": [
        {
            "notificationTitle": "Évaluation en attente",
            "notificationMessage": "Julie Lefevre attend votre évaluation suite à l'entretien",
            "notificationType": "warning",
            "isRead": false,
            "userId": 2
        }
    ]
}
```

### 🎯 Notification 6 - Campagne close
```json
{
    "user": "1",
    "datas": [
        {
            "notificationTitle": "Campagne clôturée",
            "notificationMessage": "La campagne 'Recrutement Développeur Java Senior' est maintenant fermée",
            "notificationType": "info",
            "isRead": false,
            "userId": 1
        }
    ]
}
```

### 🎯 Notification 7 - Rappel deadline
```json
{
    "user": "1",
    "datas": [
        {
            "notificationTitle": "Deadline proche",
            "notificationMessage": "La campagne 'Stage Frontend React' se termine dans 3 jours",
            "notificationType": "warning",
            "isRead": false,
            "userId": 1
        }
    ]
}
```
            "notificationTitle": "Évaluation complétée",
            "notificationMessage": "L'évaluation d'Alexandre Moreau a été finalisée avec une note de 91/100",
            "notificationType": "success",
            "isRead": true,
            "userId": 1
        },
        {
            "notificationTitle": "Candidature rejetée",
            "notificationMessage": "Emma Rousseau n'a pas été retenue pour le poste (score insuffisant)",
            "notificationType": "error",
            "isRead": false,
            "userId": 3
        },
        {
            "notificationTitle": "Campagne expirée",
            "notificationMessage": "La campagne 'Stage Développeur Frontend React' expire dans 2 jours",
            "notificationType": "warning",
            "isRead": false,
            "userId": 1
        },
        {
            "notificationTitle": "Quiz terminé",
            "notificationMessage": "Nicolas Petit a terminé le quiz technique avec un score de 78/100",
            "notificationType": "info",
            "isRead": true,
            "userId": 2
        },
        {
            "notificationTitle": "Nouveau message",
            "notificationMessage": "Camille Garcia a envoyé une question concernant le processus de recrutement",
            "notificationType": "info",
            "isRead": false,
            "userId": 4
        },
        {
            "notificationTitle": "Rappel entretien",
            "notificationMessage": "Entretien RH avec Maxime Bernard programmé aujourd'hui à 16h",
            "notificationType": "warning",
            "isRead": false,
            "userId": 5
        },
        {
            "notificationTitle": "Candidat accepté",
            "notificationMessage": "Félicitations ! Maxime Bernard a été accepté pour le poste",
            "notificationType": "success",
            "isRead": true,
            "userId": 1
        },
        {
            "notificationTitle": "Système mis à jour",
            "notificationMessage": "Le système QuizApp a été mis à jour avec de nouvelles fonctionnalités",
            "notificationType": "info",
            "isRead": false,
            "userId": 1
        },
        {
            "notificationTitle": "Rapport mensuel",
            "notificationMessage": "Le rapport mensuel de recrutement est disponible dans votre tableau de bord",
            "notificationType": "info",
            "isRead": false,
            "userId": 1
        },
        {
            "notificationTitle": "Erreur système",
            "notificationMessage": "Erreur détectée lors de l'envoi automatique des emails de confirmation",
            "notificationType": "error",
            "isRead": false,
            "userId": 1
        }
    ]
}
```

---

## 🔍 Vérifier la création
**POST** `/notifications/getByCriteria`

```json
{
    "user": "1",
    "size": 20,
    "index": 0
}
```
