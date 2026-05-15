import uuid
from datetime import datetime, UTC
from sqlalchemy import Column, String, DateTime, Enum as SAEnum, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class MediaType(str, enum.Enum):
    image = "image"
    video = "video"
    audio = "audio"


class MediaFile(Base):
    __tablename__ = "media_files"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    incident_id = Column(Uuid(as_uuid=True), ForeignKey("incidents.id"), nullable=False)
    url = Column(String(500), nullable=False)
    public_id = Column(String(255), nullable=True)
    media_type = Column(SAEnum(MediaType), nullable=False)
    filename = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))

    incident = relationship("Incident", back_populates="media_files")
