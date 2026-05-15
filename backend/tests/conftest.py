import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db

SQLALCHEMY_TEST_URL = "sqlite:///./test.db"

engine_test = create_engine(SQLALCHEMY_TEST_URL, connect_args={"check_same_thread": False})
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)


def override_get_db():
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine_test)
    yield
    Base.metadata.drop_all(bind=engine_test)


@pytest.fixture
def client():
    # use_lifespan=False evita que el lifespan intente conectar a PostgreSQL
    with TestClient(app, raise_server_exceptions=True) as c:
        yield c


@pytest.fixture
def ciudadano_token(client):
    client.post("/auth/register", json={
        "name": "Juan Pérez",
        "email": "juan@test.com",
        "password": "password123",
    })
    res = client.post("/auth/login", json={"email": "juan@test.com", "password": "password123"})
    return res.json()["token"]


@pytest.fixture
def operador_token(client):
    from app.models.user import User, UserRole

    client.post("/auth/register", json={
        "name": "Operador Lima",
        "email": "operador@muni.pe",
        "password": "password123",
    })
    db = TestingSession()
    user = db.query(User).filter(User.email == "operador@muni.pe").first()
    user.role = UserRole.operador
    db.commit()
    db.close()

    res = client.post("/auth/login", json={"email": "operador@muni.pe", "password": "password123"})
    return res.json()["token"]
