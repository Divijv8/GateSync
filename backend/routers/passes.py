from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import get_current_user, require_role
from database import get_db
from models import AuditLog, Pass, PassType, Visitor
from schemas import PassIssueResponse, PassRead

router = APIRouter(prefix="/passes", tags=["passes"])

@router.get("", response_model=list[PassRead])
def list_passes(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Pass).order_by(Pass.issued_at.desc()).all()

@router.get("/code/{pass_code}", response_model=PassRead)
def lookup_pass_by_code(pass_code: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    pass_record = db.query(Pass).filter(Pass.pass_code == pass_code).first()
    if pass_record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pass not found")
    return pass_record

@router.get("/{pass_id}", response_model=PassRead)
def get_pass(pass_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    pass_record = db.query(Pass).filter(Pass.id == pass_id).first()
    if pass_record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pass not found")
    return pass_record



@router.post("/{visitor_id}", response_model=PassIssueResponse, status_code=status.HTTP_201_CREATED)
def issue_pass(
    visitor_id: int,
    pass_type_abbr: str,
    duration_days: int | None = None,  # None = permanent
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    visitor = db.query(Visitor).filter(Visitor.id == visitor_id).first()
    if visitor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Visitor not found")

    pass_type = db.query(PassType).filter(
        PassType.abbreviation == pass_type_abbr,
        PassType.is_active == True
    ).first()
    if not pass_type:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid pass type abbreviation")

    count = db.query(Pass).filter(
        Pass.pass_code.like(f"{pass_type_abbr}-%")
    ).count()
    pass_code = f"{pass_type_abbr}-{(count + 1):04d}"

    pass_record = Pass(
        visitor_id=visitor.id,
        pass_code=pass_code,
        status="active",
        expires_at = datetime.utcnow() + timedelta(days=duration_days) if duration_days else None,
    )
    db.add(pass_record)
    db.flush()

    db.add(AuditLog(
        user_id=current_user.id,
        action="pass_issued",
        entity_type="pass",
        entity_id=str(pass_record.id),
        details=f"Issued {pass_type.label} pass {pass_code} for visitor {visitor_id}",
    ))
    db.commit()
    db.refresh(pass_record)

    return PassIssueResponse(
        message="Pass issued successfully",
        access_pass=PassRead.model_validate(pass_record),
    )

@router.patch("/{pass_id}/revoke", response_model=PassRead)
def revoke_pass(pass_id: int, db: Session = Depends(get_db), current_user=Depends(require_role("admin"))):
    pass_record = db.query(Pass).filter(Pass.id == pass_id).first()
    if pass_record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pass not found")
    pass_record.status = "revoked"
    db.add(AuditLog(
        user_id=current_user.id,
        action="pass_revoked",
        entity_type="pass",
        entity_id=str(pass_record.id),
        details=f"Pass {pass_record.pass_code} revoked",
    ))
    db.commit()
    db.refresh(pass_record)
    return pass_record