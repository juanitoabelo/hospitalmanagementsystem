# MongoDB Setup Guide for MediCore HMS
## Complete Step-by-Step Connection Guide

---

## Overview

This guide walks you through connecting MediCore HMS to a real MongoDB database.
You have two options:

| Option | Best for | Cost |
|--------|----------|------|
| **Option A** — MongoDB Atlas (Cloud) | Quick setup, no installation | Free tier available |
| **Option B** — MongoDB Local         | Full offline control         | Free, requires install |

---

## OPTION A — MongoDB Atlas (Recommended for Beginners)

### Step 1 — Create a Free Atlas Account

1. Go to **https://www.mongodb.com/cloud/atlas/register**
2. Sign up with your email (Google login also works)
3. Choose **"Free"** plan when prompted (M0 Sandbox — 512MB storage, always free)
4. Select any cloud provider and region close to you (e.g. AWS / Singapore)
5. Click **"Create Cluster"** — takes about 2 minutes to provision

---

### Step 2 — Create a Database User

1. In the left sidebar, click **"Database Access"**
2. Click **"Add New Database User"**
3. Choose **"Password"** as authentication method
4. Set a username (e.g. `medicore_admin`) and a strong password
5. Under "Built-in Role", select **"Read and write to any database"**
6. Click **"Add User"**

> ⚠️ Save this username and password — you will need them for the connection string.

---

### Step 3 — Whitelist Your IP Address

1. In the left sidebar, click **"Network Access"**
2. Click **"Add IP Address"**
3. Click **"Allow Access From Anywhere"** (sets `0.0.0.0/0`)
   - For production: use your specific server IP instead
4. Click **"Confirm"**

---

### Step 4 — Get Your Connection String

1. In the left sidebar, click **"Database"**
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **Driver: Node.js**, Version: **5.5 or later**
5. Copy the connection string — it looks like:

```
mongodb+srv://medicore_admin:<password>@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
```

6. Replace `<password>` with your actual database user password
7. Add your database name before the `?`:

```
mongodb+srv://medicore_admin:YourPassword@cluster0.abc123.mongodb.net/medicore?retryWrites=true&w=majority
```

---

### Step 5 — Configure Your .env File

```bash
# Navigate to backend folder
cd backend

# Copy the template
cp .env.example .env
```

Open `backend/.env` and fill in:

```env
MONGO_URI=mongodb+srv://medicore_admin:YourPassword@cluster0.abc123.mongodb.net/medicore?retryWrites=true&w=majority
JWT_SECRET=pick-a-long-random-string-here-at-least-32-chars
JWT_EXPIRES=1h
PORT=5000
CLIENT_URL=http://localhost:3000
```

---

## OPTION B — Local MongoDB Installation

### Step 1 — Install MongoDB Community Edition

**Windows:**
1. Go to https://www.mongodb.com/try/download/community
2. Select **Windows**, **msi** package, latest version
3. Run the installer — choose "Complete" setup
4. Check **"Install MongoDB as a Service"** (auto-starts with Windows)
5. Also install **MongoDB Compass** (GUI) when prompted

**macOS (with Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu / Debian Linux:**
```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

---

### Step 2 — Verify MongoDB is Running

```bash
# Check if MongoDB service is active
mongosh

# You should see a prompt like:
# Current Mongosh Log ID: ...
# Connecting to: mongodb://127.0.0.1:27017/
# >
```

Type `exit` to quit.

---

### Step 3 — Configure Your .env File

```bash
cd backend
cp .env.example .env
```

Open `backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/medicore
JWT_SECRET=pick-a-long-random-string-here-at-least-32-chars
JWT_EXPIRES=1h
PORT=5000
CLIENT_URL=http://localhost:3000
```

---

## Step 6 — Install Backend Dependencies

```bash
# Make sure you are in the backend folder
cd backend

npm install
```

This installs: `express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `cors`, `dotenv`, `nodemon`

---

## Step 7 — Seed the Database

Run the seed script to create demo users, doctors, patients, appointments and invoices:

```bash
# Still in the backend folder
node seed.js
```

You should see:

```
Connected to MongoDB: mongodb://localhost:27017/medicore
Cleared existing data.
Created users.
Created doctors.
Created patients.
Created appointments.
Created invoices.

✅ Seed complete! Login credentials:

  Role          | Email                     | Password
  --------------|---------------------------|---------------
  Admin         | admin@medicore.com        | Admin1234!
  Doctor        | sarah@medicore.com        | Doctor1234!
  Doctor        | marcus@medicore.com       | Doctor1234!
  Receptionist  | reception@medicore.com    | Recept1234!
  Patient       | patient@medicore.com      | Patient1234!
```

---

## Step 8 — Start the Backend Server

```bash
# Development mode (auto-restarts on file changes)
npm run dev

# OR production mode
npm start
```

You should see:
```
MongoDB connected
Server running on http://localhost:5000
```

---

## Step 9 — Start the Frontend

Open a **new terminal** (keep the backend running):

```bash
# Navigate to the project ROOT (not backend/)
cd ..

npm install
npm start
```

The browser opens automatically at **http://localhost:3000**

---

## Step 10 — Login

Use any seeded credential:

| Role         | Email                   | Password     |
|--------------|-------------------------|--------------|
| Admin        | admin@medicore.com      | Admin1234!   |
| Doctor       | sarah@medicore.com      | Doctor1234!  |
| Receptionist | reception@medicore.com  | Recept1234!  |
| Patient      | patient@medicore.com    | Patient1234! |

---

## Verify Data in MongoDB

### Using MongoDB Compass (GUI)

1. Open **MongoDB Compass**
2. Connect with:
   - Local: `mongodb://localhost:27017`
   - Atlas: paste your full connection string
3. Select the **medicore** database
4. Browse collections: `users`, `patients`, `doctors`, `appointments`, `invoices`

### Using mongosh (Terminal)

```bash
mongosh
use medicore
db.users.find().pretty()
db.patients.find().pretty()
db.appointments.find().pretty()
```

---

## Project Folder Structure (Final)

```
hms/
├── public/
│   └── index.html
├── src/
│   ├── index.js
│   ├── App.jsx                  ← JWT auth, session restore from localStorage
│   ├── utils/
│   │   ├── api.js               ← ALL HTTP calls to Express (new)
│   │   ├── auth.js              ← Real JWT decode (base64url)
│   │   └── theme.js
│   ├── components/
│   │   ├── UI.jsx
│   │   └── Sidebar.jsx
│   └── pages/
│       ├── Login.jsx            ← calls POST /api/auth/login
│       ├── Dashboard.jsx        ← fetches live stats from MongoDB
│       ├── Patients.jsx         ← full CRUD via /api/patients
│       ├── Appointments.jsx     ← live booking via /api/appointments
│       ├── Doctors.jsx          ← live data via /api/doctors
│       ├── Billing.jsx          ← live invoices via /api/invoices
│       └── Schema.jsx
├── backend/
│   ├── app.js
│   ├── seed.js                  ← run once to populate MongoDB (new)
│   ├── .env                     ← your actual secrets (never commit)
│   ├── .env.example
│   ├── models/models.js
│   ├── middleware/authMiddleware.js
│   └── routes/
│       ├── auth.js
│       ├── patients.js
│       ├── doctors.js
│       ├── appointments.js
│       └── invoices.js
└── package.json
```

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `MongoServerError: bad auth` | Wrong password in MONGO_URI | Re-check `.env` password |
| `ECONNREFUSED 127.0.0.1:27017` | Local MongoDB not running | Run `brew services start mongodb-community` or `sudo systemctl start mongod` |
| `Network timeout` (Atlas) | IP not whitelisted | Add your IP in Atlas → Network Access |
| `Cannot GET /api/...` | Backend not running | Start backend: `cd backend && npm run dev` |
| `CORS error` in browser | Wrong CLIENT_URL in .env | Set `CLIENT_URL=http://localhost:3000` |
| `jwt malformed` | Old btoa token in localStorage | Clear localStorage and log in again |
| `401 Unauthorized` | Token expired (1hr) | Log out and log back in |
| Port 5000 already in use | Another process using port | Change `PORT=5001` in `.env` and update `package.json` proxy |

---

## Security Checklist Before Going Live

- [ ] Change `JWT_SECRET` to a random 64-character string
- [ ] Set `JWT_EXPIRES=8h` or shorter
- [ ] Remove `0.0.0.0/0` from Atlas IP whitelist, use your server's IP
- [ ] Enable HTTPS (use a reverse proxy like nginx + Let's Encrypt)
- [ ] Set `NODE_ENV=production`
- [ ] Use environment variables — never hardcode secrets
- [ ] Enable MongoDB Atlas audit logging

---

*MediCore HMS — MongoDB Setup Guide · Generated by Claude (Anthropic)*
