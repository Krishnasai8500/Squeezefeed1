from sqlalchemy import Column, Integer, String, Float, Text, Boolean
from app.db.database import Base


class SentimentAnalysis(Base):
    __tablename__ = "sentiment_analysis"

    id = Column(Integer, primary_key=True, index=True)

    article_title = Column(String, nullable=False)
    article_content = Column(Text, nullable=False)

    sentiment_label = Column(String, nullable=False)
    polarity_score = Column(Float, nullable=False)

    emotion_label = Column(String, nullable=True)

    urgency_score = Column(Float, nullable=True)

    viral_score = Column(Float, nullable=True)

    # NEW
    memeability_score = Column(Float, nullable=True)

    is_meme_candidate = Column(Boolean, default=False)

    source_url = Column(String, nullable=True)

    category = Column(String, nullable=True)