from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.repositories.user_repository import UserRepository
from app.utils.security import hash_password, verify_password, create_access_token
from app.schemas.user import UserRegister, TokenResponse, UserOut


class AuthService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)

    def register(self, data: UserRegister) -> TokenResponse:
        if self.repo.email_exists(data.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El email ya está registrado",
            )
        user = User(
            name=data.name,
            email=data.email,
            password_hash=hash_password(data.password),
            role=UserRole.ciudadano,
        )
        user = self.repo.create(user)
        token = create_access_token({"sub": str(user.id), "role": user.role})
        return TokenResponse(token=token, user=UserOut.model_validate(user))

    def login(self, email: str, password: str) -> TokenResponse:
        user = self.repo.get_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales incorrectas",
            )
        token = create_access_token({"sub": str(user.id), "role": user.role})
        return TokenResponse(token=token, user=UserOut.model_validate(user))
