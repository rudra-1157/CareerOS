from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.config import settings
from app.models.user import User, Role

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        email = payload.get("email")
        if user_id is None and email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = None
    if user_id is not None:
        try:
            user = db.query(User).filter(User.id == int(user_id)).first()
        except (ValueError, TypeError):
            pass

    if user is None and (email or user_id):
        lookup_email = str(email or user_id).strip().lower()
        user = db.query(User).filter(func.lower(User.email) == lookup_email).first()

    # If demo accounts were not seeded in a fresh database, auto-seed them
    if user is None and (email or user_id):
        lookup_str = str(email or user_id).strip().lower()
        if lookup_str in ["student@careeros.edu", "faculty@careeros.edu", "admin@careeros.edu", "2", "3", "4"]:
            from app.routers.auth import seed_demo_users_if_needed
            seed_demo_users_if_needed(db)
            if user_id is not None:
                try:
                    user = db.query(User).filter(User.id == int(user_id)).first()
                except (ValueError, TypeError):
                    pass
            if user is None:
                user = db.query(User).filter(func.lower(User.email) == lookup_str).first()

    if user is None:
        raise credentials_exception
    return user

def require_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    return current_user

def require_student(current_user: User = Depends(require_active_user)) -> User:
    if current_user.role != Role.STUDENT.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions. Student role required.")
    return current_user

def require_faculty(current_user: User = Depends(require_active_user)) -> User:
    if current_user.role != Role.FACULTY.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions. Faculty role required.")
    return current_user

def require_admin(current_user: User = Depends(require_active_user)) -> User:
    if current_user.role != Role.ADMINISTRATOR.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions. Administrator role required.")
    return current_user
