from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, Form, File, UploadFile, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.incident import IncidentType, IncidentStatus
from app.models.user import User
from app.middleware.auth import get_current_user, require_ciudadano, require_operador
from app.services.incident_service import IncidentService
from app.schemas.incident import IncidentOut, PaginatedIncidents, UpdateStatusRequest, StatusHistoryOut

router = APIRouter(prefix="/incidents", tags=["Incidents"])


@router.get("", response_model=PaginatedIncidents)
def list_incidents(
    type: Optional[IncidentType] = Query(None),
    status: Optional[IncidentStatus] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return IncidentService(db).list_incidents(type, status, None, page, limit)


@router.get("/me", response_model=PaginatedIncidents)
def my_incidents(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_ciudadano),
    db: Session = Depends(get_db),
):
    return IncidentService(db).list_incidents(None, None, current_user.id, page, limit)


@router.get("/{id}", response_model=IncidentOut)
def get_incident(id: UUID, db: Session = Depends(get_db)):
    return IncidentService(db).get_incident(id)


@router.post("", response_model=IncidentOut, status_code=201)
def create_incident(
    type: IncidentType = Form(...),
    description: str = Form(..., min_length=10),
    address: str = Form(..., min_length=3),
    lat: float = Form(...),
    lng: float = Form(...),
    media: List[UploadFile] = File(default=[]),
    current_user: User = Depends(require_ciudadano),
    db: Session = Depends(get_db),
):
    return IncidentService(db).create_incident(
        type, description, address, lat, lng, current_user, media
    )


@router.patch("/{id}/status", response_model=IncidentOut)
def update_status(
    id: UUID,
    body: UpdateStatusRequest,
    current_user: User = Depends(require_operador),
    db: Session = Depends(get_db),
):
    return IncidentService(db).update_status(id, body.status, body.note or "", current_user)


@router.get("/{id}/history", response_model=List[StatusHistoryOut])
def get_history(id: UUID, db: Session = Depends(get_db)):
    return IncidentService(db).get_history(id)
