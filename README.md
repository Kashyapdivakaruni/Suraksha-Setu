# Suraksha Setu

**"Life-Saving Response Bridge"**

Suraksha Setu is a smart accident emergency response platform using secure vehicle QR codes. It connects Citizens, EMS/Ambulance personnel, Hospitals, Police, and emergency contacts through a single digital emergency workflow.

## Privacy-First QR Design
Suraksha Setu solves the primary risk of public medical data leaks. 
- The QR contains **no personal or medical data**.
- It holds only a secure URL token.
- If an unauthorized civilian scans the QR, they only see a protected access page.
- Authorized EMS and Police access the records strictly behind a role-based login portal.

## Key Features
1. **Secure QR Generation**: Citizen dashboard to manage profile and generate QR.
2. **EMS Command**: QR scanning, victim identification, and vitals logging.
3. **Hospital Pre-Arrival Alert**: Hospitals receive live case data and ETA.
4. **Mock Tracking**: Live ambulance tracking via animated map for the family.
5. **Role-Based Access Control**: Strict data silos. Police cannot see medical data; public scanning the QR sees nothing.
6. **No Paid APIs Required**: Uses CSS-based animations for tracking to avoid paid external maps.
7. **AI-Powered Triage System**: NEWS2 (National Early Warning Score 2) for clinical patient acuity assessment.

## AI Integration: NEWS2 Triage System

Suraksha Setu integrates the **NEWS2 (National Early Warning Score 2)** algorithm - a clinically validated scoring system used by NHS and emergency services globally. This AI-driven triage engine:

- **Computes Patient Acuity** from vital signs: SpO2, pulse rate, temperature, blood pressure, respiratory rate, and consciousness status
- **Generates Risk Levels**: LOW, MEDIUM, HIGH, or CRITICAL based on vital sign patterns
- **Provides Clinical Alerts**: Identifies critical physiological patterns requiring immediate intervention
- **Confidence Scoring**: Assigns confidence levels to each assessment
- **Real-Time Assessment**: Helps EMS and hospitals make data-driven triage decisions

### Usage
The triage engine is implemented in [lib/aiTriage.ts](lib/aiTriage.ts) and can be invoked by passing vital signs:

```typescript
import { computeTriageScore } from "@/lib/aiTriage";

const result = computeTriageScore({
  oxygenLevel: 94,
  pulseRate: 110,
  temperature: 101.5,
  bloodPressure: "140/90",
  respiratoryRate: 22,
  consciousnessStatus: "CONSCIOUS"
});

// Returns: { score: 7, level: "CRITICAL", recommendation: "...", alerts: [...] }
```

## Unknown Patient Handling

For safety and privacy, Suraksha Setu implements strict controls for unknown/unregistered patient cases:

- **No Emergency Contact Notifications**: Unknown patients do not trigger SMS/notification alerts to emergency contacts
- **Manual Entry Workflow**: EMS can manually enter patient details (name, age, gender) for unregistered patients
- **No Tracking Link Generation**: Tracking links are only generated for registered patients with verified emergency contacts
- **Fallback Status Message**: "No verified emergency contact available for this patient" is shown for unknown patient cases
- **Identity Status Tracking**: All cases track whether the patient is VERIFIED (registered citizen) or UNVERIFIED (unknown/manual entry)

This ensures that families are only notified when there's a verified emergency contact in the system, preventing false alarms and protecting patient privacy.

## Tech Stack
- **Frontend**: Next.js (App Router), React, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Next.js Route Handlers
- **Database / ORM**: Prisma with PostgreSQL (Production) / SQLite (Local)
- **Authentication**: JWT / Cookies with `bcryptjs`

## Local Setup (Development)

The project uses SQLite for local development so you can run it instantly without setting up a Postgres server.

```bash
# 1. Install dependencies
npm install

# 2. Setup Environment Variables
# Copy .env.example to .env
cp .env.example .env

# 3. Apply Prisma migrations and generate client
npm run prisma:migrate

# 4. Seed the database with test users
npm run seed

# 5. Start the development server
npm run dev
```

### Local Test Credentials
The seed script generates 4 test users (all with password: `password123`):
- `citizen@demo.com`
- `ems@demo.com`
- `hospital@demo.com`
- `police@demo.com`

## Production Deployment on Vercel

Suraksha Setu is fully database-backed and designed to be deployed with a **PostgreSQL** database on Vercel. 

1. Create a PostgreSQL database using providers like **Neon**, **Supabase**, **Railway**, or **Vercel Postgres**.
2. Get your connection string (e.g., `postgresql://user:password@host/db?sslmode=require`).
3. Push this repository to GitHub and import it to Vercel.
4. In the Vercel Environment Variables, configure:
   - `DATABASE_URL` = `"postgresql://..."`
   - `JWT_SECRET` = `"your_strong_random_secret_here"`
   - `APP_URL` = `"https://your-deployment-url.vercel.app"`
   - `NEXT_PUBLIC_APP_NAME` = `"Suraksha Setu"`
5. **IMPORTANT:** Go to Vercel Settings > General > Build & Development Settings and ensure the Build Command includes the DB migration:
   - `npx prisma generate && npx prisma migrate deploy && next build`
6. Deploy!

*(Note: In-memory storage is completely disabled; real users, QR codes, and cases will persist in your PostgreSQL database.)*
