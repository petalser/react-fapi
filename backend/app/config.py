from fastapi import Depends
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    def __init__(self):
        self.AWS_ACCESS_KEY_ID = os.environ["AWS_ACCESS_KEY_ID"]
        self.AWS_SECRET_ACCESS_KEY = os.environ["AWS_SECRET_ACCESS_KEY"]
        self.AWS_REGION = os.environ["AWS_S3_REGION_NAME"]
        self.BUCKET_NAME = os.environ["AWS_STORAGE_BUCKET_NAME"]

        self.DATABASE_URL = os.environ['DATABASE_URL']

        if not all([self.AWS_ACCESS_KEY_ID, self.AWS_SECRET_ACCESS_KEY, self.AWS_REGION, self.BUCKET_NAME]):
            raise ValueError("Missing required environment variables for AWS configuration.")
        
        if not self.DATABASE_URL:
            raise ValueError("DB environment variable is missing")

def get_config() -> Config:
    return Config()
