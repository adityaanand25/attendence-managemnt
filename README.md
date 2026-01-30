# Attendance Management API

A FastAPI server with authentication (signup/signin) using Supabase.

## Features

- ✅ User signup with email and password
- ✅ User signin with authentication
- ✅ Supabase integration
- ✅ CORS enabled
- ✅ Interactive API documentation

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 1b. Frontend (React + TypeScript)

```
cd frontend
npm install
npm run dev # starts Vite dev server on 5173
```

Create a `.env` in `frontend/` if you want to point to a non-default API URL:

```
VITE_API_BASE_URL=http://localhost:8000
```

### 2. Configure Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env`
3. Fill in your Supabase credentials:
   - `SUPABASE_URL`: Your project URL (found in Project Settings > API)
   - `SUPABASE_KEY`: Your anon/public key (found in Project Settings > API)

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
```

### 3. Run the Server

```bash
python -m backend.main
```

Or with uvicorn directly:
```bash
uvicorn backend.main:app --reload
```

The server will start at `http://localhost:8000`

## API Endpoints

### Root
- `GET /` - API information

### Authentication
- `POST /auth/signup` - Register a new user
- `POST /auth/signin` - Sign in an existing user
- `POST /auth/signout` - Sign out current user

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Example Usage

### Signup
```bash
curl -X POST "http://localhost:8000/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "full_name": "John Doe"
  }'
```

### Signin
```bash
curl -X POST "http://localhost:8000/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

## Project Structure

```
attendence managemnt/
├── backend/             # FastAPI backend package
│   ├── main.py          # FastAPI application
│   ├── database.py      # Database helpers
│   ├── static/          # Static assets served by FastAPI
│   └── __init__.py
├── frontend/            # React + Vite frontend
├── requirements.txt     # Python dependencies
├── .env.example         # Environment variables template
├── .env                 # Your environment variables (not in git)
├── .gitignore           # Git ignore file
└── README.md            # This file
```

## Next Steps

- Add JWT token verification middleware
- Implement password reset functionality
- Add user profile endpoints
- Create attendance tracking endpoints
- Add role-based access control

## Notes

- Make sure email confirmation is configured in your Supabase project settings
- In production, update CORS origins to specific domains
- Store sensitive data securely and never commit `.env` to version control
