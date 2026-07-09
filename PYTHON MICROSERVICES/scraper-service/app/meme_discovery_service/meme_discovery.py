from sqlalchemy.orm import Session

from app.db.models import RedditMeme
from app.meme_discovery_service.reddit_scraper import (
    fetch_reddit_memes
)


async def discover_memes(db: Session):

    memes = await fetch_reddit_memes()

    saved_count = 0

    for meme in memes:

        existing = db.query(RedditMeme).filter(
            RedditMeme.reddit_id == meme["reddit_id"]
        ).first()

        if existing:
            continue

        viral_score = (
            meme["upvotes"] * 0.7 +
            meme["comments"] * 2
        )

        db_meme = RedditMeme(
            reddit_id=meme["reddit_id"],
            title=meme["title"],
            image_url=meme["image_url"],
            subreddit=meme["subreddit"],
            upvotes=meme["upvotes"],
            comments=meme["comments"],
            permalink=meme["permalink"],
            viral_score=viral_score
        )

        db.add(db_meme)

        saved_count += 1

    db.commit()

    return {
        "scraped": len(memes),
        "saved": saved_count
    }