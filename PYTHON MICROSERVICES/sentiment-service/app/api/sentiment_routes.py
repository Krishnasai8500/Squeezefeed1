from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.sentiment_schema import (
    SentimentRequest
)
from app.services.memeability_score import calculate_memeability_score
from app.services.sentiment_analyzer import analyze_sentiment
from app.services.emotion_detector import detect_emotion
from app.services.viral_score import calculate_viral_score
from app.services.priority_classifier import classify_priority

from app.db.database import get_db
from app.db.models import SentimentAnalysis
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime

# from app.workers.celery_worker import analyze_sentiment_task

router = APIRouter(
    prefix="/sentiment",
    tags=["Sentiment"]
)


@router.post("/analyze")
def analyze_article(
        request: SentimentRequest,
        db: Session = Depends(get_db)
):

    sentiment = analyze_sentiment(request.article_content)

    emotion = detect_emotion(request.article_content)

    def parse_published_at(date_string: str):

        if not date_string:
            return datetime.now(timezone.utc)

        try:
            dt = datetime.fromisoformat(date_string)

            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)

            return dt

        except ValueError:
            pass

        try:
            dt = parsedate_to_datetime(date_string)

            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)

            return dt

        except Exception:
            pass

        return datetime.now(timezone.utc)

    published_at = parse_published_at(request.published_at)

    now = datetime.now(timezone.utc)

    hours_since_published = (
                                    now - published_at
                            ).total_seconds() / 3600

    viral_score = calculate_viral_score(
        sentiment["polarity_score"],
        emotion,
        len(request.article_content),
        hours_since_published
    )

    priority = classify_priority(
        sentiment["polarity_score"],
        emotion,
        viral_score
    )



    memeability = calculate_memeability_score(
        request.article_title,
        request.article_content,
        request.category,
        viral_score,
        emotion
    )

    db_record = SentimentAnalysis(
        article_title=request.article_title,
        article_content=request.article_content,
        sentiment_label=sentiment["sentiment_label"],
        polarity_score=sentiment["polarity_score"],
        emotion_label=emotion,
        urgency_score=priority["urgency_score"],
        viral_score=viral_score,
        source_url=str(request.source_url) if request.source_url else None,
        category=request.category

    )

    db.add(db_record)
    db.commit()
    db.refresh(db_record)

    return {
        "sentiment_label": sentiment["sentiment_label"],
        "polarity_score": sentiment["polarity_score"],
        "emotion_label": emotion,
        "viral_score": viral_score,
        "urgency_score": priority["urgency_score"],
        "priority_level": priority["priority_level"],
        "detected_category": request.category,
        "generated_tags": request.tags or [],
        "memeability_score": memeability["memeability_score"],
        "is_meme_candidate": memeability["is_meme_candidate"],
        "saved_to_db": True

    }

# @router.post("/analyze-async")
# def analyze_article_async(
#         request: SentimentRequest
# ):
#
#     task = analyze_sentiment_task.delay(
#         request.article_title,
#         request.article_content
#     )
#
#     return {
#         "message": "Sentiment analysis task started",
#         "task_id": task.id
#     }