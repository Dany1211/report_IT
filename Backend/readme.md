# ⚙️ Backend API

This is the **Node.js/Express (or Supabase integration)** backend powering both mobile and web apps.

## Features
- User Authentication (citizens & admin roles)
- Issue reporting API (create, read, update, delete reports)
- File storage (uploaded images)
- Task assignment & notifications
- Analytics endpoints

## Tech Stack
- Node.js + Express (or Supabase as BaaS)
- PostgreSQL (via Supabase) / MongoDB
- JWT Authentication
- Cloud Storage for images

## Folder Structure
- `src/routes/` → API endpoints
- `src/models/` → Database schemas
- `src/controllers/` → Business logic
- `src/middleware/` → Auth, validation
- `src/utils/` → Helper functions

---
