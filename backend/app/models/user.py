import uuid
from datetime import datetime, UTC
from sqlalchemy import Column, String, DateTime, Enum as SAEnum, Uuid
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class UserRole(str, enum.Enum):
    ciudadano = "ciudadano"
    operador = "operador"


class User(Base):
    __tablename__ = "users"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), nullable=False, default=UserRole.ciudadano)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))

    incidents = relationship("Incident", back_populates="user", foreign_keys="Incident.user_id")
    status_changes = relationship("StatusHistory", back_populates="operator")
