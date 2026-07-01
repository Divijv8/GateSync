from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import AuditLog, Blacklist, EntryLog, Pass
from schemas import EntryLogCreate, EntryLogRead

router = APIRouter(prefix="/gate", tags=["gate"])


def _resolve_pass(db: Session, payload: EntryLogCreate) -> Pass:
    # try pass_id first
    if payload.pass_id is not None:
        access_pass = db.query(Pass).filter(Pass.id == payload.pass_id).first()
        if access_pass:
            return access_pass
    # try pass_code
    if payload.pass_code:
        access_pass = db.query(Pass).filter(Pass.pass_code == payload.pass_code).first()
        if access_pass:
            return access_pass
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pass not found")


def _check_pass_validity(access_pass: Pass):
    if access_pass.status == "revoked":
        raise HTTPException(status_code=400, detail="Pass has been revoked")
    if access_pass.expires_at and access_pass.expires_at < datetime.now(timezone.utc).replace(tzinfo=None):
        raise HTTPException(status_code=400, detail="Pass has expired")


@router.post("/entry", response_model=EntryLogRead, status_code=status.HTTP_201_CREATED)
def log_entry(payload: EntryLogCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    access_pass = _resolve_pass(db, payload)
    _check_pass_validity(access_pass)

    blacklisted = db.query(Blacklist).filter(
        Blacklist.visitor_id == access_pass.visitor_id,
        Blacklist.is_active == True
    ).first()
    if blacklisted:
        raise HTTPException(status_code=403, detail="Visitor is blacklisted")

    entry = EntryLog(pass_id=access_pass.id, gate_operator_id=current_user.id, action="entry", notes=payload.notes)
    db.add(entry)
    db.add(AuditLog(
        user_id=current_user.id,
        action="entry_logged",
        entity_type="pass",
        entity_id=str(access_pass.id),
        details=f"Gate entry {payload.notes or ''}",
    ))
    db.commit()
    db.refresh(entry)
    return entry


@router.post("/exit", response_model=EntryLogRead, status_code=status.HTTP_201_CREATED)
def log_exit(payload: EntryLogCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    access_pass = _resolve_pass(db, payload)
    _check_pass_validity(access_pass)

    entry = EntryLog(pass_id=access_pass.id, gate_operator_id=current_user.id, action="exit", notes=payload.notes)
    db.add(entry)
    db.add(AuditLog(
        user_id=current_user.id,
        action="exit_logged",
        entity_type="pass",
        entity_id=str(access_pass.id),
        details=f"Gate exit {payload.notes or ''}",
    ))
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/activity")
def recent_activity(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    logs = db.query(EntryLog).order_by(EntryLog.timestamp.desc()).limit(25).all()
    items = []
    for log in logs:
        entry = EntryLogRead.model_validate(log)
        data = entry.model_dump()
        # fetch pass code and visitor name
        access_pass = db.query(Pass).filter(Pass.id == log.pass_id).first()
        if access_pass:
            data['pass_code'] = access_pass.pass_code
            from models import Visitor
            visitor = db.query(Visitor).filter(Visitor.id == access_pass.visitor_id).first()
            if visitor:
                data['visitor_name'] = f"{visitor.first_name} {visitor.last_name}"
            else:
                data['visitor_name'] = '—'
        else:
            data['pass_code'] = f"#{log.pass_id}"
            data['visitor_name'] = '—'
        items.append(data)
    return {"items": items}