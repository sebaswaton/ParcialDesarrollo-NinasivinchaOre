import { api } from './client';
import type { Incident, PaginatedResponse, IncidentStatus, IncidentType } from '../types';

export interface IncidentFilters {
  type?: IncidentType;
  status?: IncidentStatus;
  page?: number;
  limit?: number;
}

export const incidentsApi = {
  getAll: (filters: IncidentFilters = {}) =>
    api.get<PaginatedResponse<Incident>>('/incidents', { params: filters }).then((r) => r.data),

  getById: (id: string) =>
    api.get<Incident>(`/incidents/${id}`).then((r) => r.data),

  getMyIncidents: (filters: IncidentFilters = {}) =>
    api.get<PaginatedResponse<Incident>>('/incidents/me', { params: filters }).then((r) => r.data),

  create: (formData: FormData) =>
    api.post<Incident>('/incidents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  updateStatus: (id: string, status: IncidentStatus, note: string) =>
    api.patch<Incident>(`/incidents/${id}/status`, { status, note }).then((r) => r.data),

  getHistory: (id: string) =>
    api.get(`/incidents/${id}/history`).then((r) => r.data),
};
