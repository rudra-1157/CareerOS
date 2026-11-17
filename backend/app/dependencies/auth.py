from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
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
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = None
    try:
        user = db.query(User).filter(User.id == int(user_id)).first()
    except (ValueError, TypeError):
        user = db.query(User).filter(User.email == str(user_id).lower()).first()

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
