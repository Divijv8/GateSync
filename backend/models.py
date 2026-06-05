from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from database import Base


def utcnow() -> datetime:
    return datetime.utcnow()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="employee")
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    entry_logs = relationship("EntryLog", back_populates="gate_operator")
    audit_logs = relationship("AuditLog", back_populates="user")


class Visitor(Base):
    __tablename__ = "visitors"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(150), nullable=True)
    phone = Column(String(50), nullable=True)
    company = Column(String(150), nullable=True)
    purpose = Column(String(255), nullable=False)
    host_name = Column(String(150), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    passes = relationship("Pass", back_populates="visitor", cascade="all, delete-orphan")
    blacklist_entry = relationship("Blacklist", back_populates="visitor", uselist=False)


class Pass(Base):
    __tablename__ = "passes"

    id = Column(Integer, primary_key=True, index=True)
    visitor_id = Column(Integer, ForeignKey("visitors.id"), nullable=False, index=True)
    pass_code = Column(String(120), unique=True, nullable=False, index=True)
    status = Column(String(50), default="active", nullable=False)
    qr_code_path = Column(String(255), nullable=True)
    issued_at = Column(DateTime, default=utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=True)

    visitor = relationship("Visitor", back_populates="passes")
    entry_logs = relationship("EntryLog", back_populates="access_pass")


class EntryLog(Base):
    __tablename__ = "entry_logs"

    id = Column(Integer, primary_key=True, index=True)
    pass_id = Column(Integer, ForeignKey("passes.id"), nullable=False, index=True)
    gate_operator_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(20), nullable=False)
    notes = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=utcnow, nullable=False)

    access_pass = relationship("Pass", back_populates="entry_logs")
    gate_operator = relationship("User", back_populates="entry_logs")


class Blacklist(Base):
    __tablename__ = "blacklist"

    id = Column(Integer, primary_key=True, index=True)
    visitor_id = Column(Integer, ForeignKey("visitors.id"), nullable=True, index=True)
    full_name = Column(String(200), nullable=False)
    reason = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    added_at = Column(DateTime, default=utcnow, nullable=False)

    visitor = relationship("Visitor", back_populates="blacklist_entry")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(150), nullable=False)
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=utcnow, nullable=False)

    user = relationship("User", back_populates="audit_logs")
