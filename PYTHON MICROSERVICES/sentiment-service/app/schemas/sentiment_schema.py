from pydantic import BaseModel, HttpUrl
from typing import Optional, List


class SentimentRequest(BaseModel):

    article_title: str

    article_content: str

    source_url: Optional[HttpUrl] = None

    category: str | None = None

    tags: Optional[List[str]] = []

    published_at: Optional[str] = None


class SentimentResponse(BaseModel):

    sentiment_label: str

    polarity_score: float

    emotion_label: Optional[str] = None

    urgency_score: Optional[float] = None

    viral_score: Optional[float] = None