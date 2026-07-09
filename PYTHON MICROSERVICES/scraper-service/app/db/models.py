from sqlalchemy import Column, Integer, String, Text, Boolean, Float
from app.db.database import Base
from sqlalchemy.sql import func
from sqlalchemy import DateTime
from sqlalchemy.dialects.postgresql import ARRAY


class ScrapedArticle(Base):
    __tablename__ = "scraped_articles"

    id = Column(Integer, primary_key=True, index=True)

    source_score = Column(Integer, default=5)

    title = Column(String, nullable=False)

    content = Column(Text, nullable=False)

    summary = Column(Text, nullable=True)

    author = Column(String, nullable=True)

    publish_date = Column(String, nullable=True)

    image_url = Column(String, nullable=True)

    source_url = Column(String, unique=True, nullable=False)

    category = Column(String, nullable=True)
    tags = Column(
        ARRAY(String),
        nullable=True
    )

    source_name = Column(String, nullable=True)

    is_ai_generated = Column(Boolean, default=False)

    viral_score = Column(Float, default=0.0)

    priority_level = Column(String, default="low")

    is_candidate = Column(Boolean, default=False)

    is_processed = Column(Boolean, default=False)

    is_ingested = Column(Boolean, default=False)

    ingested_at = Column(DateTime, nullable=True)

    article_city = Column(String, nullable=True)

    article_state = Column(String, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    language = Column(String, default="ENGLISH")

class RedditMeme(Base):
    __tablename__ = "reddit_memes"

    id = Column(Integer, primary_key=True, index=True)

    reddit_id = Column(
        String,
        unique=True,
        nullable=False
    )

    title = Column(
        Text,
        nullable=False
    )

    image_url = Column(
        Text,
        nullable=True
    )

    subreddit = Column(
        String,
        nullable=False
    )

    upvotes = Column(
        Integer,
        default=0
    )

    comments = Column(
        Integer,
        default=0
    )

    permalink = Column(
        Text,
        nullable=True
    )

    is_used = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
    viral_score = Column(Float, default=0.0)
    content = Column(Text, nullable=True)