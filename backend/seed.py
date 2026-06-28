from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from auth import hash_password
from models import AuditLog, Blacklist, EntryLog, Pass, PassType, User, Visitor


def seed_database(db: Session) -> None:
    if db.query(User).count() > 0:
        return

    pass_types = [
        PassType(abbreviation="TV", label="Temporary Visitor"),
        PassType(abbreviation="PE", label="Permanent Employee"),
        PassType(abbreviation="CT", label="Contractor"),
        PassType(abbreviation="DL", label="Daily Labourer"),
        PassType(abbreviation="OG", label="Official Guest"),
        PassType(abbreviation="VD", label="Vendor/Supplier"),
        PassType(abbreviation="MT", label="Maintenance Staff"),
        PassType(abbreviation="IN", label="Intern"),
        PassType(abbreviation="SR", label="Senior Research Staff"),
        PassType(abbreviation="SC", label="Security Personnel"),
    ]
    db.add_all(pass_types)
    db.flush()

    admin = User(
        username="admin",
        full_name="System Admin",
        email="admin@gatesync.local",
        password_hash=hash_password("admin123"),
        role="admin",
    )
    employee = User(
        username="employee",
        full_name="Front Office Employee",
        email="employee@gatesync.local",
        password_hash=hash_password("employee123"),
        role="employee",
    )
    operator = User(
        username="gate",
        full_name="Gate Operator",
        email="gate@gatesync.local",
        password_hash=hash_password("gate123"),
        role="gate_operator",
    )

    visitor = Visitor(
        first_name="Ava",
        last_name="Johnson",
        email="ava@example.com",
        phone="555-0101",
        company="Northwind Labs",
        purpose="Project meeting",
        host_name="Morgan Lee",
    )

    db.add_all([admin, employee, operator, visitor])
    db.flush()

    access_pass = Pass(
        visitor_id=visitor.id,
        pass_code=f"TV-0001",
        status="active",
        issued_at=datetime.utcnow(),
        expires_at=datetime.utcnow() + timedelta(hours=8),
    )
    
    blacklist_entry = Blacklist(
        visitor_id=None,
        full_name="Blocked Visitor",
        reason="Sample blacklist entry for testing",
        is_active=True,
    )

    db.add_all([access_pass, blacklist_entry])
    db.flush()

    entry_log = EntryLog(pass_id=access_pass.id, gate_operator_id=None, action="entry", notes="Seeded log")
    audit_log = AuditLog(
        user_id=None,
        action="seed_complete",
        entity_type="system",
        entity_id="seed",
        details="Demo users and sample data created",
    )

    db.add_all([entry_log, audit_log])
    db.commit()
