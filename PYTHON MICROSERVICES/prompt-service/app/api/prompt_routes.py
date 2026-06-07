from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.prompt_schema import PromptRequest
from app.services.prompt_engine import generate_prompt
from app.services.prompt_optimizer import optimize_prompt
from app.services.platform_prompt_adapter import adapt_prompt_for_platform
from app.services.viral_prompt_enhancer import enhance_prompt_virality

from app.db.database import get_db
from app.db.models import GeneratedPrompt

router = APIRouter(
    prefix="/prompt",
    tags=["Prompt Generation"]
)


@router.post("/")
def create_prompt(
        request: PromptRequest,
        db: Session = Depends(get_db)
):

    generated = generate_prompt(
        request.topic,
        request.content_type,
        request.platform
    )

    optimized = optimize_prompt(
        generated,
        request.content_type
    )

    platform_ready = adapt_prompt_for_platform(
        optimized,
        request.platform
    )

    final_prompt = enhance_prompt_virality(
        platform_ready
    )

    db_record = GeneratedPrompt(
        topic=request.topic,
        content_type=request.content_type,
        platform=request.platform,
        generated_prompt=generated,
        optimized_prompt=final_prompt,
        source_url=str(request.source_url) if request.source_url else None,
        category=request.category
    )

    db.add(db_record)
    db.commit()
    db.refresh(db_record)

    return {
        "generated_prompt": generated,
        "optimized_prompt": final_prompt,
        "platform": request.platform,
        "content_type": request.content_type,
        "saved_to_db": True
    }