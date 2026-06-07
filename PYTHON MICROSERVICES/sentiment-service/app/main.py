from fastapi import FastAPI

from app.core.config import settings
from app.core.logging import logger

from app.db.database import Base, engine
from app.db import models

from app.api.sentiment_routes import router as sentiment_router

# Auto-create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION
)

app.include_router(sentiment_router)


@app.get("/")
def root():
    logger.info("Root endpoint accessed")

    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running"
    }


@app.get("/health")
def health_check():
    logger.info("Health check accessed")

    return {
        "status": "healthy"
    }