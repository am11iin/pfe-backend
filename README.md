# GIG PLATLEARN - Backend API

## Introduction

GIG PLATLEARN Backend est une API RESTful développée pour Gulf Insurance Group (GIG) Algérie, conçue pour gérer une plateforme d'apprentissage en ligne. Cette API fournit les fonctionnalités nécessaires pour la gestion des utilisateurs, des cours, des communications, et le suivi des progrès des employés.

## Technologies utilisées

- **Framework**: FastAPI
- **Base de données**: PostgreSQL (hébergée sur Render)
- **ORM**: SQLAlchemy
- **Authentification**: JWT (JSON Web Tokens)
- **Hachage de mot de passe**: bcrypt
- **Stockage de fichiers**: Système de fichiers local

## Fonctionnalités principales

### Gestion des utilisateurs
- Contrôle d'accès basé sur les rôles (Admin, Professeur, Employé)
- Système d'inscription et d'approbation des utilisateurs
- Authentification sécurisée avec tokens JWT
- Gestion de profil et préférences utilisateur

### Gestion des cours
- Création, lecture, mise à jour et suppression des cours de formation
- Accès aux cours basé sur les rôles:
  - Admins: Accès complet à tous les cours
  - Professeurs: Accès à leurs propres cours et aux cours départementaux
  - Employés: Accès uniquement aux cours de leur département
- Gestion des supports de formation (PDF, vidéos, liens externes)
- Suivi des progrès des cours

### Système de communication
- Messagerie interne avec pièces jointes
- Système de notifications pour:
  - Création de nouveaux cours
  - Mises à jour des supports de formation
  - Suivi des progrès des cours
  - Suppression de cours

### Conférences et événements
- Planification et gestion des conférences
- Approbation des demandes de conférence
- Calendrier des événements

### Tableaux de bord
- Tableaux de bord spécifiques aux rôles:
  - Tableau de bord Admin: Gestion des utilisateurs, vue d'ensemble du système
  - Tableau de bord Professeur: Gestion des cours, suivi des progrès des employés
  - Tableau de bord Employé: Navigation dans les cours, suivi personnel

## Architecture du projet

```
Backend-main/
├── models/                # Modèles de données SQLAlchemy
│   ├── user.py            # Modèle Utilisateur
│   ├── course.py          # Modèles Cours et Matériels
│   ├── notification.py    # Modèle Notification
│   ├── message.py         # Modèle Message
│   └── conference.py      # Modèle Conférence
├── schemas/               # Schémas Pydantic pour la validation
├── services/              # Services métier
│   ├── notification_service.py  # Service de notifications
│   └── message_service.py       # Service de messagerie
├── static/                # Fichiers statiques
│   └── uploads/           # Fichiers téléchargés (cours, pièces jointes)
├── main.py                # Point d'entrée principal de l'application
├── database.py            # Configuration de la base de données
├── auth.py                # Fonctions d'authentification
└── utils.py               # Utilitaires divers
```

## Points d'API principaux

### Authentification
- `POST /register` - Inscription d'un nouvel utilisateur
- `POST /token` - Connexion et obtention du token d'accès
- `GET /users/me` - Obtenir le profil de l'utilisateur actuel

### Administration
- `GET /admin/pending-users` - Voir les demandes d'approbation d'utilisateurs
- `POST /admin/approve-user/{user_id}` - Approuver/rejeter les utilisateurs
- `DELETE /admin/users/{user_id}` - Supprimer des utilisateurs
- `PUT /admin/users/{user_id}` - Mettre à jour les informations d'un utilisateur

### Gestion des cours
- `POST /courses/` - Créer un nouveau cours (téléchargement de fichiers)
- `GET /courses/` - Lister les cours (filtré par rôle)
- `GET /courses/department` - Obtenir les cours par département
- `GET /courses/{course_id}` - Obtenir les détails d'un cours
- `PUT /courses/{course_id}` - Mettre à jour un cours
- `DELETE /courses/{course_id}` - Supprimer un cours
- `GET /courses/{course_id}/materials` - Lister les supports de cours
- `POST /courses/{course_id}/enroll` - S'inscrire à un cours
- `PUT /courses/{course_id}/complete` - Marquer un cours comme terminé
- `GET /courses/{course_id}/progress` - Obtenir la progression d'un cours
- `PUT /courses/{course_id}/progress` - Mettre à jour la progression d'un cours

### Communication
- `GET /notifications/` - Obtenir les notifications de l'utilisateur
- `PUT /notifications/{notification_id}/read` - Marquer une notification comme lue
- `POST /messages/` - Envoyer un message (avec pièce jointe possible)
- `GET /messages/` - Obtenir les messages (reçus/envoyés)
- `GET /messages/{message_id}` - Obtenir les détails d'un message
- `PUT /messages/{message_id}/read` - Marquer un message comme lu
- `DELETE /messages/{message_id}` - Supprimer un message
- `GET /messages/file/{message_id}` - Télécharger une pièce jointe

### Conférences
- `POST /conferences/request` - Demander une conférence
- `PUT /conferences/{conf_id}/approve` - Approuver une demande de conférence
- `GET /conferences/pending` - Obtenir les demandes de conférence en attente
- `GET /conferences/professor` - Obtenir les conférences d'un professeur
- `GET /calendar` - Obtenir le calendrier des événements
- `DELETE /conferences/{conference_name}` - Supprimer une conférence

### Tableaux de bord
- `GET /dashboard/admin` - Tableau de bord administrateur
- `GET /dashboard/prof` - Tableau de bord professeur
- `GET /dashboard/employer` - Tableau de bord employé

## Configuration et installation

1. Cloner le dépôt
2. Créer un environnement virtuel:
   ```bash
   python -m venv venv
   # Sur Linux/macOS:
   source venv/bin/activate
   # Sur Windows:
   venv\Scripts\activate
   ```
3. Installer les dépendances:
   ```bash
   pip install -r requirements.txt
   ```
4. Configurer les variables d'environnement dans un fichier `.env`:
   ```
   POSTGRES_USER=votre_utilisateur
   POSTGRES_PASSWORD=votre_mot_de_passe
   POSTGRES_HOST=votre_hote
   POSTGRES_PORT=votre_port
   POSTGRES_DB=votre_base_de_donnees
   SECRET_KEY=votre_cle_secrete
   ```
5. Initialiser la base de données:
   ```bash
   python init_db.py
   ```
6. Lancer l'application:
   ```bash
   uvicorn main:app --reload
   
