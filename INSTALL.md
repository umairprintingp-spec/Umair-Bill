# Umair Bills - Hostinger Deployment Guide

Follow these steps to deploy Umair Bills on your Hostinger shared hosting.

## 1. Prepare the Files
1. Run `npm run build` in your local environment.
2. Zip the contents of the `dist` folder.

## 2. Create Database
1. Log in to your Hostinger hPanel.
2. Go to **Databases** -> **MySQL Databases**.
3. Create a new database and a user. Note down the database name, username, and password.

## 3. Import SQL
1. Open **phpMyAdmin** for the new database.
2. Click on the **Import** tab.
3. Select the `Database.sql` file provided in this project.
4. Click **Go**.

## 4. Upload Files
1. Go to **Files** -> **File Manager**.
2. Navigate to `public_html`.
3. Upload the zip file you created in Step 1 and extract it.
4. Ensure `index.html` is in the root of `public_html`.

## 5. Configure Database (For Full-Stack Version)
If you are using the PHP backend version:
1. Open `config/database.php`.
2. Update `DB_USER`, `DB_PASS`, and `DB_NAME` with the credentials you created in Step 2.

## 6. Node.js Hosting (Alternative)
If your Hostinger plan supports Node.js:
1. Go to **Advanced** -> **Node.js**.
2. Create a new application.
3. Set the entry point to `server.ts` (or the compiled `server.js`).
4. Upload all project files.
5. Run `npm install` via the terminal in hPanel.

---
For support, contact: Mohammad Shadab (+91 9140090305)
