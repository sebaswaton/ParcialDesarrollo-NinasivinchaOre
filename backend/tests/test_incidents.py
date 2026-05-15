"""Tests para las 3 historias de usuario principales."""
import io


# ───── Helpers ─────────────────────────────────────────────────────────────

def create_incident(client, token, **kwargs):
    data = {
        "type": "bache",
        "description": "Gran bache en la intersección que daña llantas",
        "address": "Av. Arequipa 1234",
        "lat": "-12.0464",
        "lng": "-77.0428",
        **{k: str(v) for k, v in kwargs.items()},
    }
    return client.post(
        "/incidents",
        data=data,
        headers={"Authorization": f"Bearer {token}"},
    )


# ───── US-01: Reportar incidencia ──────────────────────────────────────────

def test_create_incident_success(client, ciudadano_token):
    res = create_incident(client, ciudadano_token)
    assert res.status_code == 201
    data = res.json()
    assert data["type"] == "bache"
    assert data["status"] == "pendiente"
    assert data["address"] == "Av. Arequipa 1234"


def test_create_incident_with_image(client, ciudadano_token):
    fake_image = io.BytesIO(b"fake-png-content")
    res = client.post(
        "/incidents",
        data={
            "type": "alumbrado",
            "description": "Poste de alumbrado apagado hace 3 semanas",
            "address": "Jr. Puno 567",
            "lat": "-12.05",
            "lng": "-77.04",
        },
        files=[("media", ("foto.png", fake_image, "image/png"))],
        headers={"Authorization": f"Bearer {ciudadano_token}"},
    )
    assert res.status_code == 201
    data = res.json()
    assert len(data["media_files"]) == 1
    assert data["media_files"][0]["media_type"] == "image"


def test_create_incident_requires_auth(client):
    res = client.post("/incidents", data={
        "type": "basura",
        "description": "Basura acumulada en la esquina",
        "address": "Calle Los Pinos 100",
        "lat": "-12.05",
        "lng": "-77.04",
    })
    assert res.status_code in (401, 403)  # HTTPBearer devuelve 403 sin header


def test_create_incident_ciudadano_only(client, operador_token):
    res = create_incident(client, operador_token)
    assert res.status_code == 403


# ───── US-02: Seguimiento de estado ────────────────────────────────────────

def test_get_incident_detail(client, ciudadano_token):
    created = create_incident(client, ciudadano_token).json()
    res = client.get(f"/incidents/{created['id']}")
    assert res.status_code == 200
    assert res.json()["id"] == created["id"]


def test_get_incident_history_empty(client, ciudadano_token):
    created = create_incident(client, ciudadano_token).json()
    res = client.get(f"/incidents/{created['id']}/history")
    assert res.status_code == 200
    assert res.json() == []


def test_list_incidents_public(client, ciudadano_token):
    create_incident(client, ciudadano_token)
    create_incident(client, ciudadano_token, type="basura",
                    description="Basura sin recoger en parque central")
    res = client.get("/incidents")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 2


def test_list_incidents_filter_by_type(client, ciudadano_token):
    create_incident(client, ciudadano_token, type="bache",
                    description="Bache profundo en avenida principal")
    create_incident(client, ciudadano_token, type="basura",
                    description="Basura acumulada sin recoger desde días")
    res = client.get("/incidents?type=bache")
    assert res.status_code == 200
    for item in res.json()["data"]:
        assert item["type"] == "bache"


def test_my_incidents(client, ciudadano_token):
    create_incident(client, ciudadano_token)
    res = client.get("/incidents/me", headers={"Authorization": f"Bearer {ciudadano_token}"})
    assert res.status_code == 200
    assert res.json()["total"] >= 1


# ───── US-03: Gestión de incidencias (operador) ────────────────────────────

def test_operator_update_status(client, ciudadano_token, operador_token):
    incident = create_incident(client, ciudadano_token).json()
    res = client.patch(
        f"/incidents/{incident['id']}/status",
        json={"status": "en_progreso", "note": "Cuadrilla asignada al sector"},
        headers={"Authorization": f"Bearer {operador_token}"},
    )
    assert res.status_code == 200
    assert res.json()["status"] == "en_progreso"


def test_operator_update_creates_history(client, ciudadano_token, operador_token):
    incident = create_incident(client, ciudadano_token).json()
    client.patch(
        f"/incidents/{incident['id']}/status",
        json={"status": "resuelto", "note": "Bache reparado"},
        headers={"Authorization": f"Bearer {operador_token}"},
    )
    res = client.get(f"/incidents/{incident['id']}/history")
    assert res.status_code == 200
    history = res.json()
    assert len(history) == 1
    assert history[0]["old_status"] == "pendiente"
    assert history[0]["new_status"] == "resuelto"
    assert history[0]["note"] == "Bache reparado"


def test_ciudadano_cannot_update_status(client, ciudadano_token):
    incident = create_incident(client, ciudadano_token).json()
    res = client.patch(
        f"/incidents/{incident['id']}/status",
        json={"status": "resuelto", "note": ""},
        headers={"Authorization": f"Bearer {ciudadano_token}"},
    )
    assert res.status_code == 403


def test_update_same_status_fails(client, ciudadano_token, operador_token):
    incident = create_incident(client, ciudadano_token).json()
    res = client.patch(
        f"/incidents/{incident['id']}/status",
        json={"status": "pendiente", "note": ""},
        headers={"Authorization": f"Bearer {operador_token}"},
    )
    assert res.status_code == 400


def test_get_nonexistent_incident(client):
    res = client.get("/incidents/00000000-0000-0000-0000-000000000000")
    assert res.status_code == 404
