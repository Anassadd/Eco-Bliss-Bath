# 🧩 Prérequis

Avant de démarrer, assurez-vous d’avoir installé :
- **Docker** → pour exécuter le backend (API + base de données)
- **Node.js** et **npm** → pour lancer le frontend Angular


---

# ⚙️ Installation et démarrage

### 1️⃣ Cloner le projet
Téléchargez le projet sur votre ordinateur :
```bash
git clone https://github.com/OpenClassrooms-Student-Center/Eco-Bliss-Bath-V2.git
cd Eco-Bliss-Bath-V2
```
### 2️⃣ Démarrer le backend avec Docker
Lancez l’API et la base de données avec Docker :
```bash
docker compose up -d
```
### 3️⃣ Démarrer le frontend Angular
Lancez le site web en local :
```bash
cd ./frontend
npm start
```
### 4️⃣ Lancer les tests Cypress
Ouvrez l’interface de test :
```bash
npx cypress open
```
---
## 🧪 Une fois Cypress ouvert :

- Lorsque la fenêtre Cypress s’ouvre, **choisissez le mode “E2E Testing” (End-to-End)** pour exécuter les tests du site.  
- Sélectionnez le **navigateur Chrome** pour exécuter les tests.  
- La liste des fichiers de test s’affiche (ex : `api-tests.cy.js connexion.cy.js panier.cy.js`, etc.).  
- Cliquez sur le fichier souhaité pour **lancer automatiquement les tests correspondants**.