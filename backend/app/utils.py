from datetime import datetime, timedelta, timezone
from jwt.exceptions import InvalidTokenError
from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi_sqlalchemy import db
from pydantic import BaseModel
import os
import jwt
import hashlib

from app.models import User

class TokenData(BaseModel):
    username: str | None = None

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

ACCESS_TOKEN_SEC = os.getenv("ACCESS_TOKEN_SEC")

def hash_password(password: str) -> str:
    """Hash password with sha256."""
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def create_token(username: str, secret: str, expires_mins: int) -> str:
    payload = {
        "sub": username,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=expires_mins),
    }
    
    return jwt.encode(payload, secret, algorithm="HS256")


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials1",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        print(">>>>>")
        payload = jwt.decode(token, ACCESS_TOKEN_SEC, algorithms=["HS256"])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except InvalidTokenError:
        raise credentials_exception
    user = db.session.query(User).filter(User.user_name == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user