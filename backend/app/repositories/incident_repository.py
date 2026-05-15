from typing import Optional, List, Tuple
from uuid import UUID
from sqlalchemy.orm import Session, joinedload
from app.models.incident import Incident, IncidentType, IncidentStatus
from app.models.status_history import StatusHistory
from app.repositories.base import BaseRepository


class IncidentRepository(BaseRepository[Incident]):
    def __init__(self, db: Session):
        super().__init__(Incident, db)

    def _base_query(self):
        return self.db.query(Incident).options(
            joinedload(Incident.user),
            joinedload(Incident.media_files),
        )

    def get_with_relations(self, id: UUID) -> Optional[Incident]:
        return self._base_query().filter(Incident.id == id).first()

    def get_filtered(
        self,
        type: Optional[IncidentType] = None,
        status: Optional[IncidentStatus] = None,
        user_id: Optional[UUID] = None,
        page: int = 1,
        limit: int = 20,
    ) -> Tuple[List[Incident], int]:
        q = self._base_query()
        if type:
            q = q.filter(Incident.type == type)
        if status:
            q = q.filter(Incident.status == status)
        if user_id:
            q = q.filter(Incident.user_id == user_id)
        total = q.count()
        items = q.order_by(Incident.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
        return items, total

    def get_history(self, incident_id: UUID) -> List[StatusHistory]:
        return (
            self.db.query(StatusHistory)
            .options(joinedload(StatusHistory.operator))
            .filter(StatusHistory.incident_id == incident_id)
            .order_by(StatusHistory.changed_at.asc())
            .all()
        )
