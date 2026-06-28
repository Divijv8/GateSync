from pathlib import Path

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, SessionLocal, engine
from routers import auth as auth_router
from routers import blacklist as blacklist_router
from routers import gate as gate_router
from routers import pass_types as pass_types_router
from routers import passes as passes_router
from routers import reports as reports_router
from routers import users as users_router
from routers import visitors as visitors_router
from seed import seed_database

app = FastAPI(title="Visitor & Access Pass Management System", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(visitors_router.router)
app.include_router(passes_router.router)
app.include_router(gate_router.router)
app.include_router(blacklist_router.router)
app.include_router(reports_router.router)
app.include_router(users_router.router)
app.include_router(pass_types_router.router)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "Visitor & Access Pass Management System API is running."}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)