import uuid
from datetime import datetime, UTC
from sqlalchemy import Column, String, Float, DateTime, Enum as SAEnum, Text, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class IncidentType(str, enum.Enum):
    bache = "bache"
    alumbrado = "alumbrado"
    basura = "basura"
    seguridad = "seguridad"
    emergencia = "emergencia"


class IncidentStatus(str, enum.Enum):
    pendiente = "pendiente"
    en_progreso = "en_progreso"
    resuelto = "resuelto"
    rechazado = "rechazado"


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type = Column(SAEnum(IncidentType), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(SAEnum(IncidentStatus), nullable=False, default=IncidentStatus.pendiente)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    address = Column(String(255), nullable=False)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    updated_at = Column(DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))

    user = relationship("User", back_populates="incidents", foreign_keys=[user_id])
    media_files = relationship("MediaFile", back_populates="incident", cascade="all, delete-orphan")
    status_history = relationship("StatusHistory", back_populates="incident", cascade="all, delete-orphan")
