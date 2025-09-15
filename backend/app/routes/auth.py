import os
from typing import Annotated
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from fastapi_sqlalchemy import db
from fastapi.security import OAuth2PasswordRequestForm

from app.models import User
from app.schemas import UserRead, UserCreate
from app.utils import hash_password, create_token

class Token(BaseModel):
    access_token: str
    token_type: str


router = APIRouter()

ACCESS_TOKEN_SEC = os.getenv("ACCESS_TOKEN_SEC")

@router.post("/token")
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    if not form_data.username or not form_data.password:
        raise HTTPException(status_code=400, detail="Insufficient data")

    found_user = db.session.query(User).filter(User.user_name == form_data.username).first()
    
    if not found_user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    hashed_pwd = hash_password(form_data.password)

    if hashed_pwd != found_user.hashed_pwd:
        raise HTTPException(status_code=401, detail="Unauthorized")

    user_name = str(found_user.user_name)

    id = int(found_user.id)

    access_token = create_token(user_name, ACCESS_TOKEN_SEC, 10*60) #10hrs

    return {
        "access_token": access_token,
        "username": user_name,
        "ID": id,
        "token_type": "bearer"
    }

@router.post("/register", response_model=UserRead)
def create_user(user_in:UserCreate):
    user_exists = db.session.query(User).filter(User.user_name == user_in.user_name).first()
    if user_exists:
        raise HTTPException(status_code=302, detail="User already exist")
    
    password_hash = hash_password(user_in.password)
    
    new_user = User(
        user_name=user_in.user_name,
        email=user_in.email,
        hashed_pwd=password_hash
    )

    db.session.add(new_user)
    db.session.commit()
    db.session.refresh(new_user)
    return new_user
