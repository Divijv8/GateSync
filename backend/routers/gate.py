from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import EntryLog, Pass
from schemas import EntryLogCreate, EntryLogRead


router = APIRouter(prefix="/gate", tags=["gate"])


def _resolve_pass(db: Session, payload: EntryLogCreate) -> Pass:
    if payload.pass_id is not None:
        access_pass = db.query(Pass).filter(Pass.id == payload.pass_id).first()
        if access_pass:
            return access_pass
    if payload.pass_code:
        access_pass = db.query(Pass).filter(Pass.pass_code == payload.pass_code).first()
        if access_pass:
            return access_pass
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pass not found")


@router.post("/entry", response_model=EntryLogRead, status_code=status.HTTP_201_CREATED)
def log_entry(payload: EntryLogCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    access_pass = _resolve_pass(db, payload)
    entry = EntryLog(pass_id=access_pass.id, gate_operator_id=current_user.id, action="entry", notes=payload.notes)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.post("/exit", response_model=EntryLogRead, status_code=status.HTTP_201_CREATED)
def log_exit(payload: EntryLogCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    access_pass = _resolve_pass(db, payload)
    entry = EntryLog(pass_id=access_pass.id, gate_operator_id=current_user.id, action="exit", notes=payload.notes)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/activity")
def recent_activity(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    logs = db.query(EntryLog).order_by(EntryLog.timestamp.desc()).limit(25).all()
    return {"items": [EntryLogRead.model_validate(log) for log in logs]}
