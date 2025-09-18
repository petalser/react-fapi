from typing import List
from fastapi import FastAPI, APIRouter, Depends, HTTPException, Form, File, UploadFile, Response
from fastapi_sqlalchemy import DBSessionMiddleware, db
from fastapi.middleware.cors import CORSMiddleware
from botocore.exceptions import BotoCoreError, ClientError

from app.routes import auth
from app.models import User, Message
from app.schemas import UserRead, MessageRead, UsernameRequest, UpdateMessageRequest, DeleteMessageRequest
from app.utils import get_current_user, upload_file_and_get_key, get_file_link
from app.config import Config, get_config

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

config: Config = get_config()

app = FastAPI()

app.add_middleware(DBSessionMiddleware, db_url=config.DATABASE_URL)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origins=origins
)

api_router = APIRouter()
api_router.include_router(auth.router)

app.include_router(api_router)


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
    text: str = Form(...),
    files: list[UploadFile] | None = File(None),
    current_user: User = Depends(get_current_user),
):
    try:
        sender = db.session.query(User).filter(User.user_name == current_user.user_name).first()
        receiver = db.session.query(User).filter(User.user_name == username).first()
        if not sender or not receiver:
            raise ValueError("Sender or receiver not found")

        uploaded_keys = []
        if files:
            for f in files:
                uploaded_keys.append(upload_file_and_get_key(f))

        msg = Message(
            text=text,
            links=uploaded_keys,  # store only S3 keys (filenames)
            sender_id=sender.id,
            receiver_id=receiver.id
        )
        db.session.add(msg)
        db.session.commit()
        db.session.refresh(msg)
        return msg

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    
# edit message
@app.patch("/me/{username}")
def patch_message_to_user(
    username: str,
    body: UpdateMessageRequest,
    current_user: User = Depends(get_current_user)
):
    found_receiver = db.session.query(User).filter(User.user_name == username).first()

    if not found_receiver:
        raise HTTPException(status_code=404, detail="No such user")

    found_message = db.session.query(Message).filter(Message.id == body.id).first()

    if not found_message:
        raise HTTPException(status_code=404, detail="User not found")
    if not found_message.sender_id == current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    found_message.text = body.text
    db.session.commit()

    return Response(status_code=204)


@app.delete("/me/{username}")
def delete_message(
    username: str,
    body: DeleteMessageRequest,
    current_user: User = Depends(get_current_user)
):
    found_receiver = db.session.query(User).filter(User.user_name == username).first()

    if not found_receiver:
        raise HTTPException(status_code=404, detail="No such user")

    msg = db.session.query(Message).filter(Message.id == body.id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    
    if msg.sender_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    db.session.delete(msg)
    db.session.commit()

    return Response(status_code=204)


# find users
@app.post("/search", response_model=List[UserRead])
def find_user(request: UsernameRequest):
    users = db.session.query(User).filter(User.user_name.ilike(f"%{request.username}%")).all()
    
    return users #returns User[] or []


# create link for file
@app.get("/download/{file_key}")
def download_file(file_key: str):
    try:
        url = get_file_link(file_key)
        return {"download_url": url}
    except (BotoCoreError, ClientError) as e:
        raise HTTPException(status_code=500, detail=str(e))
