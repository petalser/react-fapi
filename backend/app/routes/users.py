import os
import hashlib
from typing import List
from fastapi import APIRouter, HTTPException, Query
from fastapi_sqlalchemy import db
from app.schemas import UserRead, UserCreate

from app.models import User

router = APIRouter()

@router.get("/users", response_model=List[UserRead])
def read_user(username: str = Query(..., description="Search users by username")):
    users = db.session.query(User).filter(User.user_name.ilike(f"%{username}%")).all()
    
    if not users:
        raise HTTPException(status_code=404, detail="User not found")
    
    return users

@router.post("/users", response_model=UserRead)
def create_user(user_in:UserCreate):
    user_exists = db.session.query(User).filter(User.user_name == user_in.user_name).first()
    if user_exists:
        raise HTTPException(status_code=302, detail="User already exist")
    
    salt = os.urandom(32)
    
    password_hash = hashlib.pbkdf2_hmac('sha256', user_in.password.encode('utf-8'), salt, 100000)
    
    new_user = User(
        user_name=user_in.user_name,
        email=user_in.email,
        hashed_pwd=password_hash
    )

    db.session.add(new_user)
    db.session.commit()
    db.session.refresh(new_user)
    return new_user
