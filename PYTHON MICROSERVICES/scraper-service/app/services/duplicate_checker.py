from sqlalchemy.orm import Session
from app.db.models import ScrapedArticle


def is_duplicate(db: Session, source_url: str):
    return db.query(ScrapedArticle).filter(
        ScrapedArticle.source_url == source_url
    ).first() is not None