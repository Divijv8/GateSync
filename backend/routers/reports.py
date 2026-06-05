from io import BytesIO

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Blacklist, EntryLog, Pass, Visitor


router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/summary.pdf")
def summary_report(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    buffer = BytesIO()
    document = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = [Paragraph("Visitor & Access Pass Summary", styles["Title"]), Spacer(1, 12)]

    metrics = [
        ["Visitors", str(db.query(Visitor).count())],
        ["Passes", str(db.query(Pass).count())],
        ["Entry Logs", str(db.query(EntryLog).count())],
        ["Blacklist Entries", str(db.query(Blacklist).count())],
    ]
    table = Table(metrics, colWidths=[180, 120])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f2937")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.whitesmoke, colors.lightgrey]),
                ("PADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.append(table)
    story.append(Spacer(1, 12))
    story.append(Paragraph("TODO: Add charts, filtering, and export presets here.", styles["BodyText"]))

    document.build(story)
    buffer.seek(0)
    return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": "inline; filename=summary-report.pdf"})
