# ViaPública — Sistema de Registro de Incidencias en la Vía Pública

Plataforma web municipal para reportar y gestionar incidencias en la vía pública: baches, alumbrado deficiente, basura, seguridad ciudadana y emergencias.

## Integrante

- Ninasivincha Ore, Sebastian

## Estructura del proyecto

```
├── frontend/          React 18 + TypeScript + Vite + TailwindCSS
├── backend/           FastAPI + PostgreSQL + SQLAlchemy
├── docs/              SRS, Casos de Uso, Casos de Prueba
├── docker-compose.yml Orquestación de contenedores
└── README.md
```

## Levantar el sistema

```bash
docker compose up --build
```

| Servicio | URL |
|---------|-----|
| Frontend | http://localhost:8003 |
| Backend API | http://localhost:8002 |
| Swagger UI | http://localhost:8002/docs |

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS |
| Backend | FastAPI, Python 3.13, Uvicorn |
| Base de datos | PostgreSQL 16, SQLAlchemy 2.0, Alembic |
| Autenticación | JWT (python-jose), bcrypt |
| Almacenamiento | Local / Cloudinary |
| Contenedores | Docker, Docker Compose |
| Mapas | Google Maps JavaScript API |

## Historias de usuario

| ID | Historia |
|----|---------|
| US-01 | Como ciudadano, quiero reportar una incidencia con foto/video/audio |
| US-02 | Como ciudadano, quiero consultar el estado de mi reporte |
| US-03 | Como operador, quiero gestionar y actualizar el estado de incidencias |

## Patrones de diseño

| Patrón | Ubicación |
|--------|-----------|
| Repository | `backend/app/repositories/` |
| Strategy | `backend/app/utils/storage.py` |
| Decorator | `backend/app/middleware/auth.py` |
| Factory | `backend/app/utils/storage.py` |

## Pruebas

```bash
cd backend
venv/bin/pytest tests/ -v
```

10 casos de prueba: autenticación, registro de incidencias y gestión de estados.
