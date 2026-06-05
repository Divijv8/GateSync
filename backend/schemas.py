from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ORMBaseModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None


class UserBase(ORMBaseModel):
    username: str
    full_name: str
    email: str
    role: str = "employee"
    is_active: bool = True


class UserCreate(UserBase):
    password: str = Field(min_length=4)


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = Field(default=None, min_length=4)


class UserRead(UserBase):
    id: int
    created_at: datetime


class VisitorBase(ORMBaseModel):
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    purpose: str
    host_name: Optional[str] = None
    is_active: bool = True


class VisitorCreate(VisitorBase):
    pass


class VisitorUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    purpose: Optional[str] = None
    host_name: Optional[str] = None
    is_active: Optional[bool] = None


class VisitorRead(VisitorBase):
    id: int
    created_at: datetime


class PassBase(ORMBaseModel):
    visitor_id: int
    pass_code: str
    status: str = "active"
    qr_code_path: Optional[str] = None


class PassCreate(BaseModel):
    expires_at: Optional[datetime] = None


class PassRead(PassBase):
    id: int
    issued_at: datetime
    expires_at: Optional[datetime] = None
    visitor: Optional[VisitorRead] = None


class PassIssueResponse(BaseModel):
    message: str
    access_pass: PassRead
    qr_code_url: Optional[str] = None


class EntryLogBase(ORMBaseModel):
    pass_id: int
    action: str
    notes: Optional[str] = None


class EntryLogCreate(BaseModel):
    pass_code: Optional[str] = None
    pass_id: Optional[int] = None
    notes: Optional[str] = None


class EntryLogRead(EntryLogBase):
    id: int
    gate_operator_id: Optional[int] = None
    timestamp: datetime


class BlacklistBase(ORMBaseModel):
    visitor_id: Optional[int] = None
    full_name: str
    reason: str
    is_active: bool = True


class BlacklistCreate(BlacklistBase):
    pass


class BlacklistUpdate(BaseModel):
    reason: Optional[str] = None
    is_active: Optional[bool] = None


class BlacklistRead(BlacklistBase):
    id: int
    added_at: datetime


class AuditLogBase(ORMBaseModel):
    user_id: Optional[int] = None
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    details: Optional[str] = None


class AuditLogRead(AuditLogBase):
    id: int
    timestamp: datetime


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead
