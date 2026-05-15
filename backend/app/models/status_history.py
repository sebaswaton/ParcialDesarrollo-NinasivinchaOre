import uuid
from datetime import datetime, UTC
from sqlalchemy import Column, DateTime, Enum as SAEnum, ForeignKey, Text, Uuid
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.incident import IncidentStatus


class StatusHistory(Base):
    __tablename__ = "status_history"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    incident_id = Column(Uuid(as_uuid=True), ForeignKey("incidents.id"), nullable=False)
    old_status = Column(SAEnum(IncidentStatus), nullable=False)
    new_status = Column(SAEnum(IncidentStatus), nullable=False)
    operator_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False)
    note = Column(Text, nullable=True, default="")
    changed_at = Column(DateTime, default=lambda: datetime.now(UTC))

    incident = relationship("Incident", back_populates="status_history")
    operator = relationship("User", back_populates="status_changes")
