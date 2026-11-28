# MediVault Admin Panel (Full Stack — Express + MongoDB)

Gentle, mobile-responsive administrative console and REST API for **MediVault** — the Personal Health Record, Family Health Locker & Healthcare Discovery Platform.

## Folder Structure
```text
medivault-admin/
├── client/          # Frontend (Practo-inspired index.html + Vite/Tailwind scaffolding)
└── server/          # Backend (Express + MongoDB REST API, Super Admin auth & seeder)
```

## Architecture
- **Frontend (`client/`)**: Practo-inspired, pastel-themed responsive UI (`client/index.html`) with Light (default) & gentle Dark theme, Chart.js analytics, and live API hydration (with offline preview fallback).
- **Backend (`server/`)**: Node.js + Express (`server/src/index.js`) with Helmet, CORS, and JWT authentication.
- **Database**: MongoDB via Mongoose (`server/src/models/`).
- **Role Scope**: `SUPER_ADMIN` only in v1 (other staff roles can be added later to `AdminUser`).

## Getting Started (Full Stack)

### 1. Configure Environment
```bash
cd server
cp .env.example .env
```
Update `MONGO_URI` in `server/.env` if using MongoDB Atlas or a custom local port (defaults to `mongodb://127.0.0.1:27017/medivault_admin`).

### 2. Install & Seed Database
```bash
cd server
npm install
npm run seed
```
Default seeded Super Admin credentials:
- **Email**: `admin@medivault.in`
- **Password**: `Admin@123`

### 3. Run the Server
```bash
npm run dev
```
Open `http://localhost:5000` in your browser and click **Connect API** in the top-right corner to sign in as Super Admin.

## API Endpoints (`/api/*`)
- `POST /api/auth/login` · `GET /api/auth/me`
- `GET /api/dashboard/stats`
- `GET /api/users` · `PATCH /api/users/:id/status` · `POST /api/users/:id/export` · `DELETE /api/users/:id/sessions/:sessionId`
- `GET /api/records` · `POST /api/records/:id/break-glass`
- `GET /api/ocr` · `POST /api/ocr/simulate` · `POST /api/ocr/:id/retry`
- `GET /api/providers` · `POST /api/providers` · `PATCH /api/providers/:id/verify` · `POST /api/providers/:id/resolve-report`
- `GET /api/communications` · `POST /api/communications`
- `GET /api/tickets` · `PATCH /api/tickets/:id`
- `GET /api/billing`
- `GET /api/audit`
