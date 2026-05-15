from typing import Optional, List
from uuid import UUID
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from app.models.incident import Incident, IncidentType, IncidentStatus
from app.models.media_file import MediaFile
from app.models.status_history import StatusHistory
from app.models.user import User
from app.repositories.incident_repository import IncidentRepository
from app.schemas.incident import PaginatedIncidents, IncidentOut, StatusHistoryOut
from app.utils.storage import get_storage, validate_file


class IncidentService:
    def __init__(self, db: Session):
        self.repo = IncidentRepository(db)
        self.db = db

    def list_incidents(
        self,
        type: Optional[IncidentType],
        status: Optional[IncidentStatus],
        user_id: Optional[UUID],
        page: int,
        limit: int,
    ) -> PaginatedIncidents:
        items, total = self.repo.get_filtered(type, status, user_id, page, limit)
        return PaginatedIncidents(
            data=[IncidentOut.model_validate(i) for i in items],
            total=total,
            page=page,
            limit=limit,
        )

    def get_incident(self, id: UUID) -> IncidentOut:
        incident = self.repo.get_with_relations(id)
        if not incident:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incidencia no encontrada")
        return IncidentOut.model_validate(incident)

    def create_incident(
        self,
        type: IncidentType,
        description: str,
        address: str,
        lat: float,
        lng: float,
        user: User,
        files: List[UploadFile],
    ) -> IncidentOut:
        # Factory: creación de la incidencia según tipo
        incident = Incident(
            type=type,
            description=description,
            address=address,
            lat=lat,
            lng=lng,
            user_id=user.id,
            status=IncidentStatus.pendiente,
        )
        self.db.add(incident)
        self.db.flush()  # obtener ID antes de subir archivos

        storage = get_storage()
        for file in files:
            try:
                media_type = validate_file(file)
                url, public_id = storage.save(file)
                media = MediaFile(
                    incident_id=incident.id,
                    url=url,
                    public_id=public_id,
                    media_type=media_type,
                    filename=file.filename,
                )
                self.db.add(media)
            except ValueError as e:
                self.db.rollback()
                raise HTTPException(status_code=400, detail=str(e))

        self.db.commit()
        self.db.refresh(incident)
        return IncidentOut.model_validate(self.repo.get_with_relations(incident.id))

    def update_status(
        self,
        id: UUID,
        new_status: IncidentStatus,
        note: str,
        operator: User,
    ) -> IncidentOut:
        incident = self.repo.get_with_relations(id)
        if not incident:
            raise HTTPException(status_code=404, detail="Incidencia no encontrada")
        if incident.status == new_status:
            raise HTTPException(status_code=400, detail="El estado es igual al actual")

        history = StatusHistory(
            incident_id=incident.id,
            old_status=incident.status,
            new_status=new_status,
            operator_id=operator.id,
            note=note or "",
        )
        self.db.add(history)
        incident.status = new_status
        self.db.commit()
        self.db.refresh(incident)
        return IncidentOut.model_validate(self.repo.get_with_relations(incident.id))

    def get_history(self, id: UUID) -> List[StatusHistoryOut]:
        incident = self.repo.get(id)
        if not incident:
            raise HTTPException(status_code=404, detail="Incidencia no encontrada")
        records = self.repo.get_history(id)
        return [StatusHistoryOut.model_validate(r) for r in records]
