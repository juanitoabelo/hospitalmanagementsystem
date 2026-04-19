# MediCore HMS - Setup Complete ✅

## Database Status
✅ **Successfully seeded** with full demo data:
- 5 Users (Admin, 2 Doctors, Receptionist, Patient)
- 2 Doctor Profiles  
- 3 Patients
- 3 Appointments
- 3 Invoices

## Login Credentials

| Role          | Email                    | Password        |
|---------------|--------------------------|-----------------|
| Admin         | admin@medicore.com       | Admin1234!      |
| Doctor        | sarah@medicore.com       | Doctor1234!     |
| Doctor        | marcus@medicore.com      | Doctor1234!     |
| Receptionist  | reception@medicore.com   | Recept1234!     |
| Patient       | patient@medicore.com     | Patient1234!    |

## Important: Node Version

Due to macOS TLS/LibreSSL compatibility with MongoDB Atlas, you **MUST use Node 20** instead of Node 24:

```bash
# Use this alias in future terminals:
alias node20="/usr/local/opt/node@20/bin/node"

# Or run commands directly:
/usr/local/opt/node@20/bin/npm run dev
/usr/local/opt/node@20/bin/npm start
```

## Starting the Application

### Terminal 1 - Backend (API Server)
```bash
cd backend
export PATH="/usr/local/opt/node@20/bin:$PATH"
npm run dev
# Expected: Server running on http://localhost:5000
```

### Terminal 2 - Frontend (React App)
```bash
cd ..  # back to project root
npm install  # if needed
npm start
# Expected: Opens http://localhost:3000
```

## Troubleshooting

### If backend won't connect to MongoDB:
1. Check MongoDB Atlas dashboard:
   - Cluster should be **Running** (green)
   - Network Access should include `155.137.114.0/24`
   - Database user `juanitoabelo_db_user` should exist

2. Wait 30-60 seconds for connections to stabilize
3. Retry with Node 20: `/usr/local/opt/node@20/bin/npm run dev`

### If you see TLS errors:
- **NOT using Node 20?** Make sure you run with Node 20
- **Network changes?** Your IP might have changed - check `curl -s 'https://api.ipify.org?format=json' | jq '.ip'` and add to Network Access

## Files & Structure

```
hms/
├── backend/
│   ├── app.js              (Express server)
│   ├── seed-raw.js         (Database seeding - WORKS ✅)
│   ├── verify-seed.js      (Check seed status)
│   ├── package.json
│   ├── .env
│   ├── models/
│   ├── routes/
│   └── middleware/
├── src/
│   ├── App.jsx
│   ├── pages/
│   ├── components/
│   └── utils/
├── public/
├── package.json
└── CLAUDE.md               (Development history)
```

## API Health Check

Once backend is running, test the health endpoint:
```bash
curl http://localhost:5000/api/health
# Expected: {"status":"ok","timestamp":"2026-04-17T..."}
```

## What's Next?

1. ✅ Database seeded with demo data
2. ⏳ Start backend with Node 20
3. ⏳ Start frontend (npm start)
4. ⏳ Login with credentials above
5. ⏳ Explore the Hospital Management System!

---

*Generation Date: April 17, 2026*
*Updated: After successful seed completion*