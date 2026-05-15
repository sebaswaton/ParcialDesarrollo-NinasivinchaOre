export type IncidentType = 'bache' | 'alumbrado' | 'basura' | 'seguridad' | 'emergencia';
export type IncidentStatus = 'pendiente' | 'en_progreso' | 'resuelto' | 'rechazado';
export type UserRole = 'ciudadano' | 'operador';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface MediaFile {
  id: string;
  url: string;
  media_type: 'image' | 'video' | 'audio';
  created_at: string;
}

export interface Incident {
  id: string;
  type: IncidentType;
  description: string;
  status: IncidentStatus;
  lat: number;
  lng: number;
  address: string;
  user_id: string;
  user?: User;
  media_files: MediaFile[];
  created_at: string;
  updated_at: string;
}

export interface StatusHistory {
  id: string;
  incident_id: string;
  old_status: IncidentStatus;
  new_status: IncidentStatus;
  operator_id: string;
  operator?: User;
  note: string;
  changed_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}
