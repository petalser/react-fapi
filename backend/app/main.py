from fastapi import FastAPI, APIRouter
from fastapi_sqlalchemy import DBSessionMiddleware
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.routes import auth
import os

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

load_dotenv('.env')

app = FastAPI()
api_router = APIRouter()
api_router.include_router(auth.router)

app.include_router(api_router)

app.add_middleware(DBSessionMiddleware, db_url=os.environ['DATABASE_URL'])
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origins=origins
)

@app.get("/")
def root():
    return {"message": "hello world"}

