# Casos de Prueba
## Sistema ViaPública

**Versión:** 1.0  
**Fecha:** Mayo 2026  
**Framework:** pytest + Starlette TestClient  
**Base de datos de prueba:** SQLite (en memoria)  
**Total de pruebas:** 10  
**Resultado:** 10 PASS / 0 FAIL

---

## Entorno de Prueba

| Componente | Detalle |
|-----------|---------|
| Framework | pytest 9.0.3 |
| Cliente HTTP | Starlette TestClient (httpx) |
| Base de datos | SQLite temporal (`test.db`) |
| Comando | `venv/bin/pytest tests/ -v` |

---

## Casos de Prueba

---

### CP-01: Registro exitoso de ciudadano

| Campo | Detalle |
|-------|---------|
| **Historia de usuario** | US-01 (prerequisito) |
| **Tipo** | Integración |
| **Endpoint** | POST /auth/register |
| **Precondición** | No existe usuario con el email dado |
| **Datos de entrada** | `{"name": "Ana García", "email": "ana@test.com", "password": "securepass"}` |
| **Resultado esperado** | HTTP 201, body contiene `token` y `user.role == "ciudadano"` |
| **Resultado obtenido** | HTTP 201 |
| **Estado** | PASS |

---

### CP-02: Rechazo de email duplicado

| Campo | Detalle |
|-------|---------|
| **Historia de usuario** | US-01 (prerequisito) |
| **Tipo** | Integración |
| **Endpoint** | POST /auth/register |
| **Precondición** | Usuario con `ana@test.com` ya existe en BD |
| **Datos de entrada** | Mismo payload que CP-01 |
| **Resultado esperado** | HTTP 409 Conflict |
| **Resultado obtenido** | HTTP 409 |
| **Estado** | PASS |

---

### CP-03: Login con credenciales correctas

| Campo | Detalle |
|-------|---------|
| **Historia de usuario** | US-02 (prerequisito) |
| **Tipo** | Integración |
| **Endpoint** | POST /auth/login |
| **Precondición** | Usuario registrado en BD |
| **Datos de entrada** | `{"email": "luis@test.com", "password": "mypassword"}` |
| **Resultado esperado** | HTTP 200, body contiene clave `token` |
| **Resultado obtenido** | HTTP 200 |
| **Estado** | PASS |

---

### CP-04: Login con contraseña incorrecta

| Campo | Detalle |
|-------|---------|
| **Historia de usuario** | US-02 (prerequisito) |
| **Tipo** | Seguridad |
| **Endpoint** | POST /auth/login |
| **Precondición** | Usuario registrado en BD |
| **Datos de entrada** | `{"email": "luis@test.com", "password": "wrongpass"}` |
| **Resultado esperado** | HTTP 401 Unauthorized |
| **Resultado obtenido** | HTTP 401 |
| **Estado** | PASS |

---

### CP-05: Registro de incidencia exitoso

| Campo | Detalle |
|-------|---------|
| **Historia de usuario** | US-01 |
| **Tipo** | Integración |
| **Endpoint** | POST /incidents (multipart/form-data) |
| **Precondición** | JWT válido de ciudadano |
| **Datos de entrada** | `type=bache, description="Gran bache en la intersección...", address="Av. Arequipa 1234", lat=-12.0464, lng=-77.0428` |
| **Resultado esperado** | HTTP 201, `status == "pendiente"`, `type == "bache"` |
| **Resultado obtenido** | HTTP 201 |
| **Estado** | PASS |

---

### CP-06: Registro de incidencia con imagen adjunta

| Campo | Detalle |
|-------|---------|
| **Historia de usuario** | US-01 |
| **Tipo** | Integración |
| **Endpoint** | POST /incidents (multipart/form-data) |
| **Precondición** | JWT válido de ciudadano |
| **Datos de entrada** | Datos de incidencia + archivo `foto.png` (image/png) |
| **Resultado esperado** | HTTP 201, `len(media_files) == 1`, `media_type == "image"` |
| **Resultado obtenido** | HTTP 201 |
| **Estado** | PASS |

---

### CP-07: Creación de incidencia sin autenticación

| Campo | Detalle |
|-------|---------|
| **Historia de usuario** | US-01 |
| **Tipo** | Seguridad |
| **Endpoint** | POST /incidents |
| **Precondición** | Sin cabecera Authorization |
| **Datos de entrada** | Datos válidos de incidencia |
| **Resultado esperado** | HTTP 401 o 403 |
| **Resultado obtenido** | HTTP 403 |
| **Estado** | PASS |

---

### CP-08: Consulta de detalle de incidencia

| Campo | Detalle |
|-------|---------|
| **Historia de usuario** | US-02 |
| **Tipo** | Integración |
| **Endpoint** | GET /incidents/{id} |
| **Precondición** | Incidencia creada previamente |
| **Datos de entrada** | UUID de la incidencia en la URL |
| **Resultado esperado** | HTTP 200, `id` coincide con el solicitado |
| **Resultado obtenido** | HTTP 200 |
| **Estado** | PASS |

---

### CP-09: Actualización de estado por operador

| Campo | Detalle |
|-------|---------|
| **Historia de usuario** | US-03 |
| **Tipo** | Integración |
| **Endpoint** | PATCH /incidents/{id}/status |
| **Precondición** | Incidencia en estado `pendiente`, JWT de operador |
| **Datos de entrada** | `{"status": "en_progreso", "note": "Cuadrilla asignada"}` |
| **Resultado esperado** | HTTP 200, `status == "en_progreso"` |
| **Resultado obtenido** | HTTP 200 |
| **Estado** | PASS |

---

### CP-10: Ciudadano no puede cambiar estado de incidencia

| Campo | Detalle |
|-------|---------|
| **Historia de usuario** | US-03 |
| **Tipo** | Seguridad |
| **Endpoint** | PATCH /incidents/{id}/status |
| **Precondición** | JWT válido con rol `ciudadano` |
| **Datos de entrada** | `{"status": "resuelto", "note": ""}` |
| **Resultado esperado** | HTTP 403 Forbidden |
| **Resultado obtenido** | HTTP 403 |
| **Estado** | PASS |

---

## Resumen de Resultados

| Historia | Pruebas | PASS | FAIL |
|----------|---------|------|------|
| Autenticación | CP-01, CP-02, CP-03, CP-04 | 4 | 0 |
| US-01 Reporte | CP-05, CP-06, CP-07 | 3 | 0 |
| US-02 Seguimiento | CP-08 | 1 | 0 |
| US-03 Gestión | CP-09, CP-10 | 2 | 0 |
| **Total** | **10** | **10** | **0** |

---

## Salida de Consola

```
============================= test session starts ==============================
platform darwin -- Python 3.13.12, pytest-9.0.3
collected 10 items

tests/test_auth.py::test_register_success              PASSED  [ 10%]
tests/test_auth.py::test_register_duplicate_email      PASSED  [ 20%]
tests/test_auth.py::test_login_success                 PASSED  [ 30%]
tests/test_auth.py::test_login_wrong_password          PASSED  [ 40%]
tests/test_incidents.py::test_create_incident_success  PASSED  [ 50%]
tests/test_incidents.py::test_create_incident_with_image PASSED [ 60%]
tests/test_incidents.py::test_create_incident_requires_auth PASSED [ 70%]
tests/test_incidents.py::test_get_incident_detail      PASSED  [ 80%]
tests/test_incidents.py::test_operator_update_status   PASSED  [ 90%]
tests/test_incidents.py::test_ciudadano_cannot_update_status PASSED [100%]

======================== 10 passed in 7.91s ================================
```
