from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.humanization_schema import HumanizationRequest

from app.services.rewrite_engine import rewrite_content
from app.services.tone_selector import validate_tone
from app.services.viral_headline import generate_viral_headline
from app.services.platform_adapter import adapt_for_platform


from app.db.database import get_db
from app.db.models import HumanizedContent


router = APIRouter(
    prefix="/humanize",
    tags=["Humanization"]
)


@router.post("/")
def humanize_content(
        request: HumanizationRequest,
        db: Session = Depends(get_db)
):

    validated_tone = validate_tone(request.tone)

    rewritten = rewrite_content(
        request.original_title,
        request.original_content,
        validated_tone
    )

    adapted_content = adapt_for_platform(
        rewritten["summary"],
        request.platform
    )



    viral_headline = generate_viral_headline(
        request.original_title,
        validated_tone
    )

    db_record = HumanizedContent(
        original_title=request.original_title,
        original_content=request.original_content,
        rewritten_content=adapted_content,
        tone=validated_tone,
        platform=request.platform,
        viral_headline=viral_headline,
        source_url=str(request.source_url) if request.source_url else None,
        category=request.category
    )

    db.add(db_record)
    db.commit()
    db.refresh(db_record)

    return {
        "rewritten_content": adapted_content,
        "viral_headline": viral_headline,
        "tone": validated_tone,
        "platform": request.platform,

        "category": rewritten["category"],
        "tags": rewritten["tags"],

        "translations": {
            "title": rewritten["translated_title"],
            "summary": rewritten["translated_summary"]
        },
        "saved_to_db": False
    }