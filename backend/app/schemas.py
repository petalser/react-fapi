from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    user_name: str
    email: EmailStr


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: int

    class Config:
        orm_mode = True


class MessageBase(BaseModel):
    text: str
    links: Optional[List[str]] = None


class MessageCreate(MessageBase):
    receiver_id: int  # sender_id comes from the authenticated user


class MessageRead(MessageBase):
    id: int
    sender: UserBase
    receiver: UserBase
    created_at: datetime

    class Config:
        orm_mode = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UsernameRequest(BaseModel):
    username: str

class UpdateMessageRequest(BaseModel):
    id: int
    text: str

class DeleteMessageRequest(BaseModel):
    id: int 