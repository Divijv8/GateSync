from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import get_current_user, require_role
from database import get_db
from models import PassType
from schemas import PassTypeCreate, PassTypeRead, PassTypeUpdate

router = APIRouter(prefix="/pass-types", tags=["pass-types"])


@router.get("", response_model=list[PassTypeRead])
def list_pass_types(db=Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(PassType).order_by(PassType.abbreviation).all()


@router.post("", response_model=PassTypeRead, status_code=201)
def create_pass_type(payload: PassTypeCreate, db=Depends(get_db), current_user=Depends(require_role("admin"))):
    if db.query(PassType).filter(PassType.abbreviation == payload.abbreviation).first():
        raise HTTPException(status_code=400, detail="Abbreviation already exists")
    pt = PassType(**payload.model_dump())
    db.add(pt)
    db.commit()
    db.refresh(pt)
    return pt


@router.patch("/{pt_id}", response_model=PassTypeRead)
def update_pass_type(pt_id: int, payload: PassTypeUpdate, db=Depends(get_db), current_user=Depends(require_role("admin"))):
    pt = db.query(PassType).filter(PassType.id == pt_id).first()
    if not pt:
        raise HTTPException(status_code=404, detail="Pass type not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(pt, key, value)
    db.commit()
    db.refresh(pt)
    return pt


@router.delete("/{pt_id}", status_code=204)
def delete_pass_type(pt_id: int, db=Depends(get_db), current_user=Depends(require_role("admin"))):
    pt = db.query(PassType).filter(PassType.id == pt_id).first()
    if not pt:
        raise HTTPException(status_code=404, detail="Pass type not found")
    db.delete(pt)
    db.commit()