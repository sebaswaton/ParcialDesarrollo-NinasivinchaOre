from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.config import settings
from app.database import Base, engine
from app.routers import auth, incidents


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        # En producción usar Alembic; aquí solo para desarrollo
        Base.metadata.create_all(bind=engine)
    except Exception:
        pass  # Sin BD disponible (modo test con SQLite gestionado por conftest)
    if settings.USE_LOCAL_STORAGE:
        upload_path = Path(settings.UPLOAD_DIR)
        upload_path.mkdir(parents=True, exist_ok=True)
    yield


app = FastAPI(
    title="ViaPública API",
    description="Sistema de registro de incidencias en la vía pública",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir archivos estáticos locales
if settings.USE_LOCAL_STORAGE:
    upload_path = Path(settings.UPLOAD_DIR)
    upload_path.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=str(upload_path)), name="uploads")

app.include_router(auth.router)
app.include_router(incidents.router)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Garantiza que los errores 500 lleven cabeceras CORS."""
    origin = request.headers.get("origin", "")
    headers = {}
    if origin in settings.cors_origins_list:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
        headers=headers,
    )


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "version": "1.0.0"}
