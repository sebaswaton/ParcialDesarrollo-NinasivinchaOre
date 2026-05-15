"""Tests para US: Autenticación y registro de usuarios."""


def test_register_success(client):
    res = client.post("/auth/register", json={
        "name": "Ana García",
        "email": "ana@test.com",
        "password": "securepass",
    })
    assert res.status_code == 201
    data = res.json()
    assert "token" in data
    assert data["user"]["email"] == "ana@test.com"
    assert data["user"]["role"] == "ciudadano"


def test_register_duplicate_email(client):
    payload = {"name": "Ana", "email": "ana@test.com", "password": "pass123"}
    client.post("/auth/register", json=payload)
    res = client.post("/auth/register", json=payload)
    assert res.status_code == 409


def test_login_success(client):
    client.post("/auth/register", json={
        "name": "Luis",
        "email": "luis@test.com",
        "password": "mypassword",
    })
    res = client.post("/auth/login", json={"email": "luis@test.com", "password": "mypassword"})
    assert res.status_code == 200
    assert "token" in res.json()


def test_login_wrong_password(client):
    client.post("/auth/register", json={
        "name": "Luis",
        "email": "luis@test.com",
        "password": "mypassword",
    })
    res = client.post("/auth/login", json={"email": "luis@test.com", "password": "wrongpass"})
    assert res.status_code == 401


def test_me_requires_auth(client):
    res = client.get("/auth/me")
    assert res.status_code in (401, 403)  # HTTPBearer devuelve 403 sin header


def test_me_returns_user(client, ciudadano_token):
    res = client.get("/auth/me", headers={"Authorization": f"Bearer {ciudadano_token}"})
    assert res.status_code == 200
    assert res.json()["email"] == "juan@test.com"
