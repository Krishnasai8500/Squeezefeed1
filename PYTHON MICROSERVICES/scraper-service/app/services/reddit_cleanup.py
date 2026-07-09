from datetime import datetime, timedelta

from app.db.database import SessionLocal
from app.db.models import RedditMeme


def cleanup_old_memes():

    db = SessionLocal()

    try:

        cutoff = datetime.utcnow() - timedelta(hours=48)

        db.query(RedditMeme).filter(
            RedditMeme.created_at < cutoff,
            RedditMeme.is_used == False
        ).delete()

        db.commit()

    finally:

        db.close()