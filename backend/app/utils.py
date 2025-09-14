from datetime import datetime, timedelta
import jwt

def create_token(
        data: dict, 
        expires_mins: int, 
        secret: str, 
        expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=expires_mins))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, secret, algorithm="HS256")