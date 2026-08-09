# IPL Auction App

## Overview
This repository contains a real-time IPL auction application with a React/Vite frontend and a Node.js/Express backend using Socket.IO and PostgreSQL (Supabase).

## Database & Supabase Configuration
The backend connects to PostgreSQL via `DATABASE_URL` in `backend/.env`.

### Supabase Connection String format:
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

### Initializing Tables in Supabase:
Run the SQL script located in `backend/migrations/init.sql` inside the **Supabase SQL Editor** to create the required tables:
- `teams`
- `users`
- `players`
- `bids`
- `sold_players`
- `auction_state`

*Note: If `DATABASE_URL` is not set or fails to connect, the backend automatically operates in in-memory mode.*

## Required Environment Variables (`backend/.env`):
- `PORT=5051`
- `DATABASE_URL=postgresql://...`
- `JWT_SECRET=replace_with_secure_secret`
- `CLIENT_ORIGINS=http://localhost:5173,http://127.0.0.1:5173`

## Running Locally

1. **Backend**:
   ```bash
   cd backend
   npm start
   ```

2. **Frontend**:
   ```bash
   cd ipl-auction-app
   npm run dev
   ```
