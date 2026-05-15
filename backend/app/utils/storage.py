"""
Strategy Pattern: selección de backend de almacenamiento (local vs Cloudinary).
"""
import os
import uuid
import shutil
from pathlib import Path
from fastapi import UploadFile
from app.config import settings
from app.models.media_file import MediaType


ALLOWED_MIME_TYPES: dict[MediaType, list[str]] = {
    MediaType.image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    MediaType.video: ["video/mp4", "video/quicktime", "video/x-msvideo"],
    MediaType.audio: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/x-m4a"],
}


def detect_media_type(content_type: str) -> MediaType:
    """Strategy: detecta el tipo de medio por su MIME type."""
    if content_type.startswith("image/"):
        return MediaType.image
    if content_type.startswith("video/"):
        return MediaType.video
    if content_type.startswith("audio/"):
        return MediaType.audio
    raise ValueError(f"Tipo de archivo no permitido: {content_type}")


def validate_file(file: UploadFile) -> MediaType:
    media_type = detect_media_type(file.content_type or "")
    allowed = ALLOWED_MIME_TYPES.get(media_type, [])
    if file.content_type not in allowed:
        raise ValueError(f"Tipo MIME no permitido: {file.content_type}")
    return media_type


class LocalStorageStrategy:
    def __init__(self, upload_dir: str):
        self.upload_dir = Path(upload_dir)
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def save(self, file: UploadFile) -> tuple[str, str]:
        ext = Path(file.filename or "file").suffix
        filename = f"{uuid.uuid4()}{ext}"
        dest = self.upload_dir / filename
        with dest.open("wb") as buf:
            shutil.copyfileobj(file.file, buf)
        url = f"/uploads/{filename}"
        return url, filename

    def delete(self, public_id: str):
        path = self.upload_dir / public_id
        if path.exists():
            path.unlink()


class CloudinaryStorageStrategy:
    def save(self, file: UploadFile) -> tuple[str, str]:
        import cloudinary.uploader
        result = cloudinary.uploader.upload(
            file.file,
            resource_type="auto",
            folder="viapublica",
        )
        return result["secure_url"], result["public_id"]

    def delete(self, public_id: str):
        import cloudinary.uploader
        cloudinary.uploader.destroy(public_id, resource_type="auto")


def get_storage():
    """Factory: devuelve la estrategia de almacenamiento configurada."""
    if settings.USE_LOCAL_STORAGE:
        return LocalStorageStrategy(settings.UPLOAD_DIR)
    import cloudinary
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
    )
    return CloudinaryStorageStrategy()
