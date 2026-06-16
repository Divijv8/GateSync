from datetime import datetime
from io import BytesIO

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from sqlalchemy.orm import Session

from auth import require_role
from database import get_db
from models import AuditLog, Blacklist, EntryLog, Pass, User, Visitor

router = APIRouter(prefix="/reports", tags=["reports"])

HEADER_STYLE = [
    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f2937")),
    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.whitesmoke, colors.lightgrey]),
    ("PADDING", (0, 0), (-1, -1), 8),
]

def _base_doc(title: str):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = [
        Paragraph("GateSync — Defense Establishment", styles["Normal"]),
        Paragraph(title, styles["Title"]),
        Paragraph(f"Generated: {datetime.now().strftime('%d %b %Y, %H:%M')}", styles["Normal"]),
        Spacer(1, 16),
    ]
    return buffer, doc, styles, story


# ── Report 1: Summary ────────────────────────────────────────────────────────
@router.get("/summary.pdf")
def summary_report(db: Session = Depends(get_db), current_user=Depends(require_role("admin"))):
    buffer, doc, styles, story = _base_doc("Visitor & Access Summary Report")

    metrics = [
        ["Metric", "Count"],
        ["Total Visitors Registered", str(db.query(Visitor).count())],
        ["Total Passes Issued", str(db.query(Pass).count())],
        ["Active Passes", str(db.query(Pass).filter(Pass.status == "active").count())],
        ["Total Entry/Exit Logs", str(db.query(EntryLog).count())],
        ["Blacklist Entries", str(db.query(Blacklist).filter(Blacklist.is_active == True).count())],
        ["Total Users", str(db.query(User).count())],
    ]
    table = Table(metrics, colWidths=[300, 120])
    table.setStyle(TableStyle(HEADER_STYLE))
    story.append(table)

    doc.build(story)
    buffer.seek(0)
    return StreamingResponse(buffer, media_type="application/pdf",
        headers={"Content-Disposition": "inline; filename=summary-report.pdf"})


# ── Report 2: Visitor Log ─────────────────────────────────────────────────────
@router.get("/visitors.pdf")
def visitor_report(db: Session = Depends(get_db), current_user=Depends(require_role("admin"))):
    buffer, doc, styles, story = _base_doc("Visitor Log Report")

    visitors = db.query(Visitor).order_by(Visitor.created_at.desc()).all()

    rows = [["Name", "Company", "Purpose", "Host", "Registered"]]
    for v in visitors:
        rows.append([
            f"{v.first_name} {v.last_name}",
            v.company or "—",
            v.purpose[:30] + "..." if len(v.purpose) > 30 else v.purpose,
            v.host_name or "—",
            v.created_at.strftime("%d %b %Y"),
        ])

    if len(rows) == 1:
        story.append(Paragraph("No visitors registered yet.", styles["BodyText"]))
    else:
        table = Table(rows, colWidths=[120, 90, 120, 90, 80])
        table.setStyle(TableStyle(HEADER_STYLE))
        story.append(table)

    doc.build(story)
    buffer.seek(0)
    return StreamingResponse(buffer, media_type="application/pdf",
        headers={"Content-Disposition": "inline; filename=visitor-report.pdf"})


# ── Report 3: Audit Log ───────────────────────────────────────────────────────
@router.get("/audit.pdf")
def audit_report(db: Session = Depends(get_db), current_user=Depends(require_role("admin"))):
    buffer, doc, styles, story = _base_doc("Audit Log Report")

    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100).all()

    rows = [["Timestamp", "Action", "Entity", "Details"]]
    for log in logs:
        rows.append([
            log.timestamp.strftime("%d %b %Y %H:%M"),
            log.action,
            f"{log.entity_type} #{log.entity_id or '—'}",
            (log.details or "")[:40],
        ])

    if len(rows) == 1:
        story.append(Paragraph("No audit logs yet.", styles["BodyText"]))
    else:
        table = Table(rows, colWidths=[110, 100, 100, 140])
        table.setStyle(TableStyle(HEADER_STYLE))
        story.append(table)

    doc.build(story)
    buffer.seek(0)
    return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": "inline; filename=audit-report.pdf"})