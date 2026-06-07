from celery import Celery

from app.core.config import settings
from app.services.sentiment_analyzer import analyze_sentiment
from app.services.emotion_detector import detect_emotion
from app.services.viral_score import calculate_viral_score
from app.services.priority_classifier import classify_priority

celery_app = Celery(
    "sentiment_worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)


@celery_app.task
def analyze_sentiment_task(
        article_title: str,
        article_content: str
):

    sentiment = analyze_sentiment(article_content)

    emotion = detect_emotion(article_content)

    viral_score = calculate_viral_score(
        sentiment["polarity_score"],
        emotion,
        len(article_content)
    )

    priority = classify_priority(
        sentiment["polarity_score"],
        emotion,
        viral_score
    )

    return {
        "article_title": article_title,
        "sentiment_label": sentiment["sentiment_label"],
        "polarity_score": sentiment["polarity_score"],
        "emotion_label": emotion,
        "viral_score": viral_score,
        "urgency_score": priority["urgency_score"],
        "priority_level": priority["priority_level"]
    }