from uuid import UUID
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.models.incident import IncidentType, IncidentStatus
from app.models.media_file import MediaType
from app.schemas.user import UserOut


class MediaFileOut(BaseModel):
    id: UUID
    url: str
    media_type: MediaType
    filename: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class StatusHistoryOut(BaseModel):
    id: UUID
    incident_id: UUID
    old_status: IncidentStatus
    new_status: IncidentStatus
    operator_id: UUID
    operator: Optional[UserOut] = None
    note: Optional[str] = ""
    changed_at: datetime

    model_config = {"from_attributes": True}


class IncidentOut(BaseModel):
    id: UUID
    type: IncidentType
    description: str
    status: IncidentStatus
    lat: float
    lng: float
    address: str
    user_id: UUID
    user: Optional[UserOut] = None
    media_files: List[MediaFileOut] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PaginatedIncidents(BaseModel):
    data: List[IncidentOut]
    total: int
    page: int
    limit: int


class UpdateStatusRequest(BaseModel):
    status: IncidentStatus
    note: Optional[str] = ""
