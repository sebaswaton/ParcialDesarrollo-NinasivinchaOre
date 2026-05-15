# Especificación de Requisitos de Software (SRS)
## Sistema ViaPública — Registro de Incidencias en la Vía Pública

**Versión:** 1.0  
**Fecha:** Mayo 2026  
**Estándar:** IEEE 830-1998

---

## 1. Introducción

### 1.1 Propósito

Este documento describe los requisitos del sistema **ViaPública**, plataforma web que permite a ciudadanos reportar incidencias en la vía pública (baches, alumbrado, basura, seguridad ciudadana, emergencias) y a operadores municipales gestionar su atención.

### 1.2 Alcance

El sistema permite:
- Registro y autenticación de usuarios
- Reporte de incidencias con ubicación geográfica y evidencia multimedia
- Consulta y seguimiento del estado de reportes
- Gestión de incidencias por operadores municipales

### 1.3 Definiciones

| Término | Definición |
|---------|-----------|
| Ciudadano | Usuario que reporta incidencias |
| Operador | Personal municipal que gestiona reportes |
| JWT | JSON Web Token, mecanismo de autenticación |
| API REST | Interfaz de programación basada en HTTP |

---

## 2. Descripción General

### 2.1 Perspectiva del Producto

ViaPública es un sistema de tres capas:

- **Frontend:** React + Vite, servido por nginx
- **Backend:** FastAPI (Python), API REST con autenticación JWT
- **Base de datos:** PostgreSQL 16 con SQLAlchemy ORM

Los tres componentes se orquestan mediante Docker Compose.

### 2.2 Roles de Usuario

| Rol | Descripción | Acceso |
|-----|------------|--------|
| Ciudadano | Usuario registrado | Crear reportes, consultar estado |
| Operador | Personal municipal | Gestionar y actualizar incidencias |
| Anónimo | Sin sesión | Solo lectura del listado público |

### 2.3 Restricciones

- El backend debe implementarse con **FastAPI**
- La autenticación se realiza con **JWT**
- El sistema se despliega con **Docker y Docker Compose**
- La API soporta carga de archivos **multipart/form-data**

---

## 3. Requisitos Funcionales

### RF-01: Registro de Usuario

- **Descripción:** El sistema permite registrar nuevos usuarios con nombre, email y contraseña.
- **Prioridad:** Alta
- **Entrada:** nombre, email, contraseña
- **Salida:** Token JWT y datos del usuario
- **Restricciones:** Email único. Contraseña mínimo 6 caracteres.

### RF-02: Autenticación

- **Descripción:** Login con email y contraseña, retorna JWT válido por 24 horas.
- **Prioridad:** Alta
- **Entrada:** email, contraseña
- **Salida:** Token JWT
- **Restricciones:** Credenciales incorrectas retornan HTTP 401.

### RF-03: Reporte de Incidencia

- **Descripción:** El ciudadano autenticado reporta una incidencia indicando tipo, descripción, dirección, coordenadas y archivos multimedia opcionales.
- **Prioridad:** Alta
- **Tipos:** bache, alumbrado, basura, seguridad, emergencia
- **Entrada:** tipo, descripción (mín. 10 caracteres), dirección, lat, lng, archivos (hasta 5)
- **Salida:** Incidencia creada con estado `pendiente`

### RF-04: Consulta de Incidencias

- **Descripción:** Cualquier usuario puede listar incidencias con filtros por tipo y estado.
- **Prioridad:** Alta
- **Parámetros:** tipo (opcional), estado (opcional), página, límite
- **Salida:** Lista paginada de incidencias

### RF-05: Seguimiento de Estado

- **Descripción:** El ciudadano consulta el detalle de una incidencia y su historial de cambios.
- **Prioridad:** Alta
- **Entrada:** ID de incidencia
- **Salida:** Detalle con historial ordenado cronológicamente

### RF-06: Gestión de Incidencias por Operador

- **Descripción:** El operador cambia el estado de una incidencia y agrega una nota.
- **Prioridad:** Alta
- **Estados:** pendiente, en_progreso, resuelto, rechazado
- **Restricciones:** Solo rol `operador`. No se puede asignar el mismo estado actual.

### RF-07: Carga de Archivos Multimedia

- **Descripción:** La API acepta imágenes, videos y audios al crear una incidencia.
- **Prioridad:** Alta
- **Formatos permitidos:** JPG, PNG, WebP, MP4, MOV, MP3, WAV, OGG, M4A
- **Límite:** 5 archivos por incidencia

---

## 4. Requisitos No Funcionales

| ID | Requisito | Descripción |
|----|-----------|-------------|
| RNF-01 | Rendimiento | Respuesta menor a 2 segundos para el 95% de solicitudes |
| RNF-02 | Seguridad | Contraseñas con bcrypt, tokens JWT, cabeceras CORS configuradas |
| RNF-03 | Disponibilidad | 99% en horario laboral (lunes a sábado, 8:00-20:00) |
| RNF-04 | Portabilidad | Funciona en cualquier entorno con Docker instalado |
| RNF-05 | Mantenibilidad | Implementa patrones Repository, Strategy, Decorator y Factory |

---

## 5. Modelo de Datos

### Entidades principales

```
users          → id, name, email, password_hash, role, created_at
incidents      → id, type, description, status, lat, lng, address, user_id, created_at, updated_at
media_files    → id, incident_id, url, media_type, filename, created_at
status_history → id, incident_id, old_status, new_status, operator_id, note, changed_at
```

### Patrones de diseño implementados

| Patrón | Ubicación | Propósito |
|--------|-----------|-----------|
| Repository | `app/repositories/` | Abstrae el acceso a BD |
| Strategy | `app/utils/storage.py` | Intercambia entre almacenamiento local y Cloudinary |
| Decorator | `app/middleware/auth.py` | Autenticación y control de roles por ruta |
| Factory | `app/utils/storage.py` | Crea instancia de almacenamiento según configuración |

---

## 6. Stack Tecnológico

| Componente | Tecnología |
|-----------|-----------|
| Backend | FastAPI 0.136, Python 3.13, Uvicorn |
| Frontend | React 18, TypeScript, Vite, TailwindCSS |
| Base de datos | PostgreSQL 16, SQLAlchemy 2.0, Alembic |
| Autenticación | JWT (python-jose), bcrypt (passlib) |
| Contenedores | Docker, Docker Compose |
| Servidor web | nginx (frontend) |
| Mapas | Google Maps JavaScript API |
