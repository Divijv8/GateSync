from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from auth import get_current_user
from database import get_db
from models import AuditLog, Blacklist, Visitor
from schemas import VisitorCreate, VisitorRead, VisitorUpdate



router = APIRouter(prefix="/visitors", tags=["visitors"])


@router.get("")
def list_visitors(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    visitors = db.query(Visitor).options(joinedload(Visitor.passes)).order_by(Visitor.created_at.desc()).all()
    result = []
    for v in visitors:
        data = VisitorRead.model_validate(v).model_dump()
        data['pass_count'] = len(v.passes)
        data['first_pass_id'] = v.passes[0].id if v.passes else None
        data['pass_status'] = v.passes[0].status if v.passes else None
        data['pass_expires_at'] = v.passes[0].expires_at.isoformat() if v.passes and v.passes[0].expires_at else None
        result.append(data)
    return result


@router.post("", response_model=VisitorRead, status_code=status.HTTP_201_CREATED)
def create_visitor(payload: VisitorCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    blacklisted = db.query(Blacklist).filter(
        Blacklist.full_name == f"{payload.first_name} {payload.last_name}",
        Blacklist.is_active == True
    ).first()
    if blacklisted:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Visitor is blacklisted and cannot be registered")

    visitor = Visitor(**payload.model_dump())
    db.add(visitor)
    db.flush()
    db.add(
        AuditLog(
            user_id=current_user.id,
            action="visitor_created",
            entity_type="visitor",
            entity_id=str(visitor.id),
            details=f"Created visitor {visitor.first_name} {visitor.last_name}",
        )
    )
    db.commit()
    db.refresh(visitor)
    return visitor


@router.get("/{visitor_id}", response_model=VisitorRead)
def get_visitor(visitor_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    visitor = db.query(Visitor).filter(Visitor.id == visitor_id).first()
    if visitor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Visitor not found")
    return visitor


@router.put("/{visitor_id}", response_model=VisitorRead)
def update_visitor(visitor_id: int, payload: VisitorUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    visitor = db.query(Visitor).filter(Visitor.id == visitor_id).first()
    if visitor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Visitor not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(visitor, key, value)

    db.commit()
    db.refresh(visitor)
    return visitor


@router.delete("/{visitor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_visitor(visitor_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    visitor = db.query(Visitor).filter(Visitor.id == visitor_id).first()
    if visitor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Visitor not found")
    db.delete(visitor)
    db.commit()
    return None
