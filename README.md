# Aarogrya-Seva: Healthcare Information Management Platform
### Rural Healthcare | Multilingual Medical Communication Support
**Milestone 1: Patient & Healthcare Information Management System**

A full-stack, production-grade healthcare information management system built specifically for rural communities and primary health infrastructure. AarogyaSeva establishes the core foundation for medical record digitization, document management, role-based workflows, and regional language preferences, preparing the platform for upcoming milestones in AI medical translation, voice assistance, and medication tracking.

---

## 1. System Architecture & Tech Stack

```
                                  +---------------------------------------+
                                  |    AarogyaSeva Web Client (React 19)   |
                                  |    TypeScript + Vite + Tailwind CSS   |
                                  |   Lucide Icons + Recharts Analytics   |
                                  +-------------------+-------------------+
                                                      |
                                           REST API / JSON / JWT
                                                      |
                                  +-------------------v-------------------+
                                  |      FastAPI Backend Application      |
                                  |       Python 3.10+ / Pydantic v2      |
                                  |   Role-Based RBAC + Bcrypt + Auth     |
                                  +-------------------+-------------------+
                                                      |
                                           SQLAlchemy 2.0 ORM
                                                      |
                      +-------------------------------+-------------------------------+
                      |                                                               |
        +-------------v-------------+                                   +-------------v-------------+
        |   PostgreSQL / SQLite     |                                   |    Secure File Storage    |
        | 10 Relational Entities    |                                   |   PDF / JPG / PNG Files   |
        | Alembic Migrations Track  |                                   | UUID Storage & Validations|
        +---------------------------+                                   +---------------------------+
```

### Technology Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts.
- **Backend**: Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy 2.0, Uvicorn, Python-Jose (JWT), Bcrypt.
- **Database**: PostgreSQL (with automatic SQLite fallback for zero-configuration local runs), Alembic migrations.
- **Document Management**: Multi-format medical document upload (PDF, JPG, JPEG, PNG up to 10MB), secure file streaming, metadata management.
- **Security**: Strict Role-Based Access Control (RBAC), password hashing with bcrypt, JWT bearer token authorization, isolated medical record access per patient.

---

## 2. Implemented Features (Milestone 1)

### A. Authentication & Role-Based Access Control (RBAC)
- **Three Core User Roles**:
  - `patient`: Can register, view/edit their demographic profile, choose preferred regional language, upload prescriptions/discharge summaries/medical reports, view their own documents, and review their medical history.
  - `healthcare_worker`: Can manage profiles, search and filter rural patients across villages/districts, issue structured prescriptions, log clinical consultation notes with vitals, record lab reports, and upload medical files.
  - `admin`: Can oversee platform statistics, manage all user accounts (activate/deactivate), review audit logs, and curate the educational Healthcare Content Repository.
- **Zero-Friction Demo Access**: 1-Click quick login buttons on the login screen for instant switching between Patient, Healthcare Worker, and Administrator accounts.

### B. Dynamic Analytics Dashboard
- Live database-backed metrics: Total Patients, Healthcare Workers, Medical Documents, and Prescriptions.
- Area chart for monthly patient & worker registration growth.
- Donut chart showing document category distribution (Prescriptions, Discharge Summaries, Medical Reports).
- Realtime audit activity stream logging logins, registrations, and document additions.
- Quick action shortcuts for instant clinical record-keeping.

### C. Patient Management Module
- Complete demographic fields: Full Name, Email, Phone, Date of Birth, Gender, Address, Village, District, State, Blood Group, Emergency Contact, and Preferred Language.
- Comprehensive search (by name, phone, village, district) and filtering (by gender, regional language).
- Dedicated Patient Medical History Timeline modal showing all past clinical events.

### D. Healthcare Worker Management Module
- Fields: Full Name, Email, Phone, Qualification (MBBS, BAMS, GNM, ASHA, etc.), Healthcare Facility (PHC, CHC, Sub-centre), Designation, License Number, and Preferred Language.
- Facility filtering, search, and administrator status toggles (activate/deactivate).

### E. Medical Document Management
- Supported formats: PDF, JPG, JPEG, PNG (validated up to 10MB).
- Upload modal with progress feedback and automatic metadata extraction.
- In-app document viewer for inline PDF reading and high-resolution image preview.
- Direct secure file download with content disposition headers.

### F. Specialized Clinical Records
- **Prescriptions**: Doctor name, facility, date, diagnosis, multi-line medication regimen, and dosage instructions.
- **Discharge Summaries**: Hospital name, admitting physician, admission/discharge dates, final diagnosis, treatment given, and discharge advice.
- **Medical Lab Reports**: Diagnostic laboratory, test type (CBC, USG, HbA1c, Lipid, etc.), findings, interpretation, and Normal/Abnormal clinical status.
- **Consultation Notes**: Patient symptoms, vital signs (Blood Pressure, Pulse, SpO2, Temperature), and clinical notes.

### G. Healthcare Content Repository (Admin CMS)
- Educational health guides across 6 verified categories:
  1. *General Healthcare* (First aid for farm cuts, burns & heatstroke)
  2. *Preventive Healthcare* (Safe drinking water & waterborne disease prevention)
  3. *Maternal Health* (Essential nutrition & ANC care during pregnancy)
  4. *Child Healthcare* (National infant immunization schedule & post-vaccine care)
  5. *Elderly Care* (Blood pressure management & arthritis care in older adults)
  6. *Common Diseases* (Recognizing & preventing malaria, dengue & viral fevers)
- Full admin CRUD tools: Create, Edit, Delete, and Publish/Unpublish toggle.

### H. Multilingual & Regional Language Support
- Native language preferences: **English**, **हिन्दी (Hindi)**, **తెలుగు (Telugu)**, **தமிழ் (Tamil)**, **ಕನ್ನಡ (Kannada)**, and **বাংলা (Bengali)**.
- Preferences are stored in the database and synchronized on the user profile.

### I. Future Milestones Placeholders
- Cleanly tagged **Coming Soon** roadmap navigation items for Milestone 2 (AI Medical Translation & NLP Simplification) and Milestone 3 (Voice Health Assistant & Medication SOS Reminders).

---

## 3. Seed Accounts & Credentials

The system initializes with realistic seed data upon first startup:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@ruralhealth.org` | `Admin@12345` | Central Health Directorate Admin |
| **Healthcare Worker** | `dr.rajesh@phc.in` | `Doctor@12345` | Dr. Rajesh Sharma, MBBS (PHC Rampur) |
| **Community Worker** | `sunita.devi@asha.in` | `Asha@12345` | Sunita Devi, ASHA (Sub-Centre Chandpur) |
| **Staff Nurse** | `priya.patel@chc.in` | `Nurse@12345` | Priya Patel, B.Sc Nursing (CHC Balrampur) |
| **Rural Patient** | `ramesh.kumar@rural.in` | `Patient@12345` | Ramesh Kumar (Rampur Village, Sitapur) |
| **Rural Patient** | `lakshmi.devi@rural.in` | `Patient@12345` | Lakshmi Devi (Chandpur Village, Sitapur) |
| **Rural Patient** | `venkat.rao@rural.in` | `Patient@12345` | Venkata Rao (Kothapeta Village, Guntur) |

*(You can also use the 1-Click Demo Buttons on the login page to sign in instantly with zero typing).*

---

## 4. Localhost Execution Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Method 1: Instant Start with Batch / PowerShell Scripts (Recommended)

1. **Start the Backend**:
   Double click `run_backend.bat` or run in PowerShell:
   ```powershell
   .\run_backend.ps1
   ```
   *Runs FastAPI on http://localhost:8000 (API Docs: http://localhost:8000/docs)*

2. **Start the Frontend**:
   Double click `run_frontend.bat` or run in PowerShell:
   ```powershell
   .\run_frontend.ps1
   ```
   *Runs React Vite application on http://localhost:5173*

3. **Open in Browser**:
   Navigate to **http://localhost:5173**

---

### Method 2: Manual Terminal Commands

#### A. Backend Setup & Run
```powershell
# In project root:
cd backend

# Create .env from template (already pre-configured)
Copy-Item .env.example .env

# Set PYTHONPATH and start server
$env:PYTHONPATH="."
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### B. Frontend Setup & Run
```powershell
# In a new terminal window, navigate to frontend:
cd frontend

# Install dependencies (already installed during build)
npm install --legacy-peer-deps

# Start Vite development server
npm run dev
```

---

### Method 3: Docker Compose (PostgreSQL + Backend + Frontend)

If you have Docker Desktop installed:
```bash
docker-compose up --build
```
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- PostgreSQL: localhost:5432

---

## 5. PostgreSQL Database & Migrations

The database connection is configured via `backend/.env`:
```env
# For local PostgreSQL or Docker:
DATABASE_URL="postgresql+psycopg2://postgres:postgres@localhost:5432/rural_health_db"

# Or for zero-setup SQLite (Default):
DATABASE_URL="sqlite:///./rural_health.db"
```

### Running Alembic Migrations:
```powershell
cd backend
$env:PYTHONPATH="."
python -m alembic upgrade head
```

---

## 6. Running Automated Tests

Run the test suite covering authentication, RBAC, document upload/view, and dashboard statistics:
```powershell
# From project root:
$env:PYTHONPATH="backend"
pytest backend/tests -v
```
**Results: 8 passed in ~8 seconds (100% pass rate).**

To test frontend production build:
```powershell
cd frontend
npm run build
```

---

## 7. Project Structure

```
Project/
├── backend/
│   ├── alembic/                      # Database migration scripts
│   │   ├── versions/
│   │   │   └── 001_initial_schema.py # Initial migration for 10 entities
│   │   └── env.py
│   ├── app/
│   │   ├── api/                      # REST API Routers
│   │   │   ├── auth.py               # JWT login, registration & profile
│   │   │   ├── dashboard.py          # Realtime analytics & trends
│   │   │   ├── patients.py           # Patient CRUD & clinical timeline
│   │   │   ├── workers.py            # Healthcare worker roster
│   │   │   ├── documents.py          # Multipart file upload, view & download
│   │   │   ├── prescriptions.py      # Prescription records
│   │   │   ├── discharge_summaries.py# Hospital discharge records
│   │   │   ├── medical_reports.py    # Lab test records
│   │   │   ├── medical_records.py    # Clinical consultation logs
│   │   │   ├── content.py            # Healthcare educational articles
│   │   │   └── users.py              # User management & audit logs
│   │   ├── core/                     # App settings, security & RBAC dependencies
│   │   ├── database/                 # SQLAlchemy session & seed script
│   │   ├── models/                   # 10 Relational entities
│   │   ├── schemas/                  # Pydantic v2 validation models
│   │   ├── services/                 # File storage & audit logging services
│   │   └── main.py                   # FastAPI application entrypoint
│   ├── tests/                        # Pytest automated test suite
│   ├── uploads/                      # Uploaded medical documents storage
│   ├── alembic.ini
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/               # Navbar, Sidebar, Modals, MetricCards
│   │   ├── context/                  # AuthContext with language & demo auth
│   │   ├── pages/                    # 13 Complete SaaS application views
│   │   ├── services/                 # Centralized API service
│   │   ├── types/                    # TypeScript interfaces
│   │   ├── App.tsx                   # Main portal layout
│   │   └── index.css                 # Medical design system styles
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── Dockerfile
│   └── nginx.conf
│
├── docker-compose.yml                # Multi-container orchestration
├── run_backend.bat / .ps1            # 1-click backend runner
├── run_frontend.bat / .ps1           # 1-click frontend runner
└── README.md
```

>>>>>>> d523efb (feat: complete AarogyaSeva healthcare platform implementation)
