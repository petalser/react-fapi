import os
from dotenv import load_dotenv
from alembic import context
from sqlalchemy import create_engine
from app.models import Base  # your declarative base

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

database_url = os.environ.get("DATABASE_URL")
if not database_url:
    raise ValueError("DATABASE_URL not found in .env")

if database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+psycopg2://")

target_metadata = Base.metadata

def run_migrations_online():
    connectable = create_engine(database_url, pool_pre_ping=True)
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    raise NotImplementedError("Offline migrations not implemented")
else:
    run_migrations_online()
