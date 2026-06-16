from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import get_current_user, require_role
from database import get_db
from models import Blacklist, Visitor
from schemas import BlacklistCreate, BlacklistRead, BlacklistUpdate


router = APIRouter(prefix="/blacklist", tags=["blacklist"])


@router.get("", response_model=list[BlacklistRead])
def list_blacklist(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Blacklist).order_by(Blacklist.added_at.desc()).all()


@router.post("", response_model=BlacklistRead, status_code=status.HTTP_201_CREATED)
def add_to_blacklist(payload: BlacklistCreate, db: Session = Depends(get_db), current_user=Depends(require_role("admin"))):
    entry = Blacklist(**payload.model_dump())
    
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/{visitor_id}/check")
def check_blacklist(visitor_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    visitor = db.query(Visitor).filter(Visitor.id == visitor_id).first()
    if visitor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Visitor not found")
    entry = db.query(Blacklist).filter(Blacklist.visitor_id == visitor_id, Blacklist.is_active.is_(True)).first()
    return {"visitor_id": visitor_id, "blacklisted": entry is not None, "entry": BlacklistRead.model_validate(entry) if entry else None}


@router.patch("/{blacklist_id}", response_model=BlacklistRead)
def update_blacklist_entry(blacklist_id: int, payload: BlacklistUpdate, db: Session = Depends(get_db), current_user=Depends(require_role("admin"))):
    entry = db.query(Blacklist).filter(Blacklist.id == blacklist_id).first()
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blacklist entry not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(entry, key, value)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{blacklist_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_blacklist(blacklist_id: int, db: Session = Depends(get_db), current_user=Depends(require_role("admin"))):
    entry = db.query(Blacklist).filter(Blacklist.id == blacklist_id).first()
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blacklist entry not found")
    db.delete(entry)
    db.commit()
    return None
