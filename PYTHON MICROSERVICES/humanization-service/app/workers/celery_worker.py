from celery import Celery

from app.core.config import settings

from app.services.rewrite_engine import rewrite_content
from app.services.tone_selector import validate_tone
from app.services.viral_headline import generate_viral_headline
from app.services.platform_adapter import adapt_for_platform


celery_app = Celery(
    "humanization_worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)


@celery_app.task
def humanize_content_task(
        original_title: str,
        original_content: str,
        tone: str,
        platform: str
):

    validated_tone = validate_tone(tone)

    rewritten = rewrite_content(
        original_title,
        original_content,
        validated_tone
    )

    BAD_SUMMARY_STARTS = [
        "however",
        "but",
        "also",
        "meanwhile",
        "this",
        "these"
    ]

    if (
            rewritten is None
            or len(rewritten.strip()) < 50
            or any(
        rewritten.lower().startswith(word)
        for word in BAD_SUMMARY_STARTS
    )
    ):
        rewritten = original_content[:500]

    adapted_content = adapt_for_platform(
        rewritten,
        platform
    )

    viral_headline = generate_viral_headline(
        original_title,
        validated_tone
    )

    return {
        "rewritten_content": adapted_content,
        "viral_headline": viral_headline,
        "tone": validated_tone,
        "platform": platform
    }