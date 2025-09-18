from datetime import datetime, timedelta, timezone
from jwt.exceptions import InvalidTokenError
from typing import Annotated
from fastapi import Depends, HTTPException, status, UploadFile
from fastapi.security import OAuth2PasswordBearer
from botocore.exceptions import BotoCoreError, ClientError
from fastapi_sqlalchemy import db
from pydantic import BaseModel
import os, jwt, hashlib, uuid, boto3

from app.config import Config, get_config

from app.models import User

class TokenData(BaseModel):
    username: str | None = None

config: Config = get_config()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

s3 = boto3.client(
    "s3",
    region_name=config.AWS_REGION,
    aws_access_key_id=config.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=config.AWS_SECRET_ACCESS_KEY,
)

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


def upload_file_and_get_key(file: UploadFile) -> str:
    try:
        # Generate unique key for the file
        name, ext = os.path.splitext(file.filename)
        key = f"{uuid.uuid4()}.{name}{ext}"

        # Upload the file to S3
        s3.upload_fileobj(file.file, config.BUCKET_NAME, key)

        return key  # only return the key (filename on S3)
    
    except (BotoCoreError, ClientError) as e:
        raise HTTPException(status_code=500, detail=str(e))


def get_file_link(file_key):
    url = s3.generate_presigned_url(
            ClientMethod="get_object",
            Params={"Bucket": config.BUCKET_NAME, "Key": file_key},
            ExpiresIn=3600,  # URL expires in 1 hour
        )
    return url