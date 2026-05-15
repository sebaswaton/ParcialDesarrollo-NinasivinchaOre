# Especificación de Casos de Uso e Historias de Usuario
## Sistema ViaPública

**Versión:** 1.0  
**Fecha:** Mayo 2026  
**Metodología:** Scrum / User Stories

---

## 1. Actores del Sistema

| Actor | Descripción |
|-------|------------|
| Ciudadano | Usuario registrado que reporta y hace seguimiento de incidencias |
| Operador | Personal municipal que gestiona el ciclo de vida de los reportes |
| Anónimo | Usuario sin sesión, solo puede consultar el listado público |

---

## 2. Escenario

La Municipalidad de Lima Metropolitana implementa ViaPública como canal digital para que sus ciudadanos reporten problemas en la vía pública. Los ciudadanos acceden desde el navegador, reportan una incidencia adjuntando evidencia fotográfica, de video o audio, y hacen seguimiento hasta que el problema sea resuelto. Los operadores municipales revisan el panel de control y actualizan el estado de cada reporte.

---

## 3. Historias de Usuario

### US-01: Reporte de Incidencia

> **Como** ciudadano registrado,  
> **quiero** reportar una incidencia en la vía pública adjuntando foto, video o audio,  
> **para que** el municipio tome acción y resuelva el problema en mi zona.

**Criterios de aceptación:**
1. El ciudadano debe estar autenticado para crear un reporte
2. El formulario solicita: tipo de incidencia, descripción (mín. 10 caracteres), dirección y ubicación en mapa
3. Se pueden adjuntar hasta 5 archivos (imagen, video o audio)
4. La incidencia se crea automáticamente con estado `pendiente`
5. El ciudadano es redirigido al detalle de la incidencia creada

**Prioridad:** Alta | **Estimación:** 5 puntos

---

### US-02: Seguimiento de Estado

> **Como** ciudadano,  
> **quiero** consultar el estado actual de mi reporte y ver el historial de cambios,  
> **para que** pueda saber si mi incidencia está siendo atendida por el municipio.

**Criterios de aceptación:**
1. Cualquier usuario puede ver el detalle de una incidencia (acceso público)
2. El detalle muestra: tipo, descripción, dirección, estado actual, fecha y mapa de ubicación
3. El estado se distingue visualmente por colores según su valor
4. El historial muestra cada cambio con la nota del operador, fecha y nombre del operador
5. Las fotografías se pueden ver en pantalla completa al hacer clic

**Prioridad:** Alta | **Estimación:** 3 puntos

---

### US-03: Gestión de Incidencias (Operador)

> **Como** operador municipal,  
> **quiero** ver el panel de incidencias y actualizar su estado con una nota,  
> **para que** pueda gestionar eficientemente el trabajo de campo de mi equipo.

**Criterios de aceptación:**
1. Solo usuarios con rol `operador` acceden al panel
2. El panel muestra incidencias en tabla con columnas: tipo, descripción, dirección, estado, fecha
3. El operador puede filtrar por estado
4. El cambio de estado se realiza desde un modal sin salir del panel
5. No se puede asignar el mismo estado que ya tiene la incidencia
6. Cada cambio queda registrado en el historial de estado

**Prioridad:** Alta | **Estimación:** 5 puntos

---

## 4. Casos de Uso Detallados

### CU-01: Reportar Incidencia

| Atributo | Descripción |
|----------|-------------|
| ID | CU-01 |
| Actor principal | Ciudadano |
| Precondición | Ciudadano autenticado con JWT válido |
| Postcondición | Incidencia creada con estado `pendiente` y archivos multimedia asociados |

**Flujo normal:**
1. El ciudadano accede a "Reportar incidencia"
2. Selecciona el tipo de incidencia
3. Ingresa la descripción del problema
4. Ingresa la dirección referencial
5. Marca la ubicación exacta en el mapa (Google Maps)
6. Adjunta archivos de evidencia (opcional)
7. Hace clic en "Enviar reporte"
8. El sistema valida los campos
9. El sistema guarda los archivos multimedia
10. El sistema crea la incidencia y redirige al detalle

**Flujos alternativos:**
- FA-01: El ciudadano usa "Usar mi ubicación" para autodetectar coordenadas GPS
- FA-02: El ciudadano no adjunta archivos; la incidencia se crea sin multimedia

**Flujos de excepción:**
- FE-01: Token expirado → HTTP 401, redirige al login
- FE-02: Descripción muy corta → mensaje de error en el campo
- FE-03: Tipo de archivo inválido → HTTP 400, operación cancelada

---

### CU-02: Consultar Estado de Incidencia

| Atributo | Descripción |
|----------|-------------|
| ID | CU-02 |
| Actor principal | Ciudadano / Anónimo |
| Precondición | Ninguna (acceso público) |
| Postcondición | El usuario visualiza el detalle completo de la incidencia |

**Flujo normal:**
1. El usuario accede al listado de incidencias
2. Aplica filtros opcionales (tipo, estado)
3. Hace clic en una tarjeta de incidencia
4. El sistema carga el detalle y el historial de cambios
5. El usuario visualiza información general, evidencias multimedia y mapa

**Flujos alternativos:**
- FA-01: El ciudadano autenticado accede a "Mis Reportes" para ver solo sus incidencias

**Flujos de excepción:**
- FE-01: ID no existe → HTTP 404, muestra "Incidencia no encontrada"

---

### CU-03: Actualizar Estado de Incidencia

| Atributo | Descripción |
|----------|-------------|
| ID | CU-03 |
| Actor principal | Operador Municipal |
| Precondición | JWT válido con rol `operador` |
| Postcondición | Estado actualizado y entrada registrada en historial |

**Flujo normal:**
1. El operador accede al panel de operador
2. Filtra las incidencias por estado
3. Hace clic en "Actualizar" en la fila correspondiente
4. Selecciona el nuevo estado en el modal
5. Escribe una nota explicativa (opcional)
6. Hace clic en "Guardar"
7. El sistema valida que el estado sea diferente al actual
8. El sistema actualiza la incidencia y registra el cambio en el historial

**Flujos alternativos:**
- FA-01: El operador hace clic en "Ver" para revisar el detalle antes de actualizar

**Flujos de excepción:**
- FE-01: Rol ciudadano intenta acceder → HTTP 403
- FE-02: Mismo estado asignado → HTTP 400, mensaje de error
- FE-03: Token expirado → redirige al login

---

## 5. Flujo GitFlow

| Rama | Propósito |
|------|-----------|
| `main` | Código en producción estable |
| `develop` | Integración de funcionalidades |
| `feature/us01-report-incident` | Implementación US-01 |
| `feature/us02-track-status` | Implementación US-02 |
| `feature/us03-operator-management` | Implementación US-03 |
| `feature/media-upload` | Upload de archivos multimedia |
| `release/v1.0` | Preparación del release |
