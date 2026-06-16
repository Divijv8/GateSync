from datetime import datetime
from pathlib import Path
from uuid import uuid4

import qrcode
from auth import get_current_user, require_role
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import get_current_user
from backend.auth import require_role
from database import get_db
from models import AuditLog, Pass, Visitor
from schemas import PassIssueResponse, PassRead


router = APIRouter(prefix="/passes", tags=["passes"])
STATIC_DIR = Path(__file__).resolve().parents[1] / "static"
QR_DIR = STATIC_DIR / "qrcodes"
QR_DIR.mkdir(parents=True, exist_ok=True)



def _build_qr_code(pass_record: Pass) -> str:
    qr_path = QR_DIR / f"pass_{pass_record.id}.png"
    qr_data = f"pass:{pass_record.id}:{pass_record.pass_code}"
    image = qrcode.make(qr_data)
    image.save(qr_path)
    pass_record.qr_code_path = f"/static/qrcodes/{qr_path.name}"
    return pass_record.qr_code_path


@router.post("/{visitor_id}", response_model=PassIssueResponse, status_code=status.HTTP_201_CREATED)
def issue_pass(
    visitor_id: int,
    request: Request,
    expires_at: datetime | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    visitor = db.query(Visitor).filter(Visitor.id == visitor_id).first()
    if visitor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Visitor not found")

    pass_record = Pass(
        visitor_id=visitor.id,
        pass_code=f"PASS-{visitor.id}-{uuid4().hex[:8].upper()}",
        status="active",
        expires_at=expires_at,
    )
    db.add(pass_record)
    db.flush()
    qr_code_url = _build_qr_code(pass_record)
    db.add(
        AuditLog(
            user_id=current_user.id,
            action="pass_issued",
            entity_type="pass",
            entity_id=str(pass_record.id),
            details=f"Issued pass for visitor {visitor.id}",
        )
    )
    db.commit()
    db.refresh(pass_record)
    return PassIssueResponse(
        message="Pass issued successfully",
        access_pass=PassRead.model_validate(pass_record),
        qr_code_url=qr_code_url,
    )

@router.patch("/{pass_id}/revoke", response_model=PassRead)
def revoke_pass(pass_id: int, db: Session = Depends(get_db), current_user=Depends(require_role("admin"))):
    pass_record = db.query(Pass).filter(Pass.id == pass_id).first()
    if pass_record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pass not found")
    pass_record.status = "revoked"
    db.commit()
    db.refresh(pass_record)
    return pass_record


@router.get("/{pass_id}", response_model=PassRead)
def get_pass(pass_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    pass_record = db.query(Pass).filter(Pass.id == pass_id).first()
    if pass_record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pass not found")
    return pass_record


@router.get("/code/{pass_code}", response_model=PassRead)
def lookup_pass_by_code(pass_code: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    pass_record = db.query(Pass).filter(Pass.pass_code == pass_code).first()
    if pass_record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pass not found")
    return pass_record
