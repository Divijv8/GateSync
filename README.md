# GateSync

Visitor & Access Pass Management System with a React + Vite frontend, FastAPI backend, and SQLite database.

## Project Layout

- `backend/` FastAPI app, SQLAlchemy models, JWT auth, seed data, and API routers
- `frontend/` Vite + React app with protected routes and placeholder dashboards

## Backend Setup

1. Open a terminal in `backend/`.
2. Create and activate a Python environment.
3. Install dependencies with `pip install -r requirements.txt`.
4. Start the API with `python main.py` or `uvicorn main:app --reload --port 8000`.

Demo credentials created on first startup:

- Admin: `admin` / `admin123`
- Employee: `employee` / `employee123`
- Gate operator: `gate` / `gate123`

## Frontend Setup

1. Open a terminal in `frontend/`.
2. Install dependencies with `npm install`.
3. Start the client with `npm run dev`.

The frontend expects the API at `http://localhost:8000`.

## Notes

- The backend mounts generated static assets from `backend/static`.
- QR code images are written to `backend/static/qrcodes`.
- The pages are intentionally placeholder-first so the project compiles before business logic is filled in.
