from typing import List
from fastapi import FastAPI, APIRouter, Depends, HTTPException
from fastapi_sqlalchemy import DBSessionMiddleware, db
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth
from app.models import User, Message
from app.schemas import UserRead, MessageRead, MessageBase, UsernameRequest
from app.utils import get_current_user
from app.config import Config, get_config

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

config: Config = get_config()


app = FastAPI()
api_router = APIRouter()
api_router.include_router(auth.router)

app.include_router(api_router)

app.add_middleware(DBSessionMiddleware, config.DATABASE_URL)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origins=origins
)

# get my chats
@app.get("/me", response_model=List[UserRead])
def get_my_chats(
    current_user: User = Depends(get_current_user)
):
    user = db.session.query(User).filter(User.user_name == current_user.user_name).first()
    if not user:
        return []

    partner_ids = (db.session.query(Message.receiver_id)
                    .filter(Message.sender_id == user.id)
                    .union(
                        db.session.query(Message.sender_id)
                        .filter(Message.receiver_id == user.id)
                            ).subquery())

    partners = db.session.query(User).filter(User.id.in_(partner_ids)).all()
    return partners

# get chats me+username
@app.get("/me/{username}", response_model=List[MessageRead])
def get_chat_with_user(
    username: str,
    current_user: User = Depends(get_current_user)
):
    user1 = db.session.query(User).filter(User.user_name == current_user.user_name).first()
    user2 = db.session.query(User).filter(User.user_name == username).first()
    if not user1 or not user2:
        return []

    return db.session.query(Message).filter(
        ((Message.sender_id == user1.id) & (Message.receiver_id == user2.id)) |
        ((Message.sender_id == user2.id) & (Message.receiver_id == user1.id))
    ).order_by(Message.created_at).all()

# send message to username
@app.post("/me/{username}", response_model=MessageRead)
def send_message_to_user(
    username: str,
    msg_in: MessageBase,
    current_user: User = Depends(get_current_user)
):
    try:
        sender = db.session.query(User).filter(User.user_name == current_user.user_name).first()
        receiver = db.session.query(User).filter(User.user_name == username).first()
        if not sender or not receiver:
            raise ValueError("Sender or receiver not found")

        msg = Message(
            text=msg_in.text,
            links=msg_in.links,
            sender_id=sender.id,
            receiver_id=receiver.id
        )
        db.session.add(msg)
        db.session.commit()
        db.session.refresh(msg)
        return msg
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# find users
@app.post("/search", response_model=List[UserRead])
async def find_user(request: UsernameRequest):
    users = db.session.query(User).filter(User.user_name.ilike(f"%{request.username}%")).all()
    
    return users #returns User[] or []