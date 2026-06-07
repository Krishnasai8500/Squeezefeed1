from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.db.models import ScrapedArticle


def cleanup_old_candidates(db: Session):

    cutoff = datetime.utcnow() - timedelta(hours=24)

    old_articles = db.query(ScrapedArticle).filter(
        ScrapedArticle.is_ingested == False,
        ScrapedArticle.priority_level.in_(["low", "mid"]),
        ScrapedArticle.ingested_at == None,
        ScrapedArticle.created_at < cutoff
    ).all()

    deleted_count = len(old_articles)

    for article in old_articles:
        db.delete(article)

    db.commit()

    return deleted_count