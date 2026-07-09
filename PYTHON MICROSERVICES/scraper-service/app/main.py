# from fastapi import FastAPI
# from app.core.config import settings
# from app.core.logging import logger
# from app.api.scrape_routes import router as scrape_router
# from app.db.database import Base, engine
# from app.db import models
# from app.core.scheduler import start_scheduler
# Base.metadata.create_all(bind=engine)
# app = FastAPI(
#     title=settings.APP_NAME,
#     version=settings.APP_VERSION
# )
#
# app.include_router(scrape_router)
#
#
# @app.get("/")
# def root():
#     logger.info("Root endpoint accessed")
#     return {
#         "service": settings.APP_NAME,
#         "version": settings.APP_VERSION,
#         "status": "running"
#     }
#
#
# @app.get("/health")
# def health_check():
#     logger.info("Health check accessed")
#     return {
#         "status": "healthy"
#     }


from fastapi import FastAPI
from app.core.config import settings
from app.core.logging import logger
from app.api.scrape_routes import router as scrape_router
from app.db.database import Base, engine
from app.api.meme_routes import router as meme_router
from app.db import models
# from app.core.scheduler import start_scheduler

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION
)

app.include_router(scrape_router)
app.include_router(meme_router)
#
# @app.on_event("startup")
# async def startup_event():
#
#     start_scheduler()
#
#     logger.info("Scheduler started")


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