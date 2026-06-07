from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.image_schema import ImageGenerationRequest

from app.services.image_engine import generate_image
from app.services.image_optimizer import optimize_image_prompt
from app.services.thumbnail_generator import generate_thumbnail_style
from app.services.meme_generator import generate_meme_style
from app.services.overlay_visualizer import generate_overlay_visual
from app.services.meme_overlay_generator import add_meme_overlay

from app.db.database import get_db
from app.db.models import GeneratedImage

router = APIRouter(
    prefix="/image",
    tags=["Image Generation"]
)


@router.post("/")
def create_image(
        request: ImageGenerationRequest,
        db: Session = Depends(get_db)
):

    optimized_prompt = optimize_image_prompt(
        request.prompt,
        request.image_type
    )

    if request.image_type.lower() == "thumbnail":
        final_prompt = generate_thumbnail_style(
            optimized_prompt
        )

    elif request.image_type.lower() == "meme":
        final_prompt = generate_meme_style(
            optimized_prompt
        )

    else:
        final_prompt = optimized_prompt

    # Priority-based generation
    if request.priority_level == "breaking" or request.viral_score >= 0.8:

        image_path = generate_image(
            final_prompt,
            request.image_type
        )

    elif request.priority_level == "high":

        image_path = generate_image(
            final_prompt,
            "thumbnail"
        )

    else:

        image_path = generate_overlay_visual(
            final_prompt
        )

    # Meme overlay system
    if request.image_type.lower() == "meme":
        image_path = add_meme_overlay(
            image_path,
            top_text="BREAKING NEWS",
            bottom_text=request.prompt[:60]
        )

    db_record = GeneratedImage(
        prompt=request.prompt,
        optimized_prompt=final_prompt,
        image_type=request.image_type,
        platform=request.platform,
        image_path=image_path,
        source_url=str(request.source_url) if request.source_url else None,
        category=request.category
    )

    db.add(db_record)
    db.commit()
    db.refresh(db_record)

    return {
        "image_path": image_path,
        "optimized_prompt": final_prompt,
        "platform": request.platform,
        "image_type": request.image_type,
        "saved_to_db": True
    }