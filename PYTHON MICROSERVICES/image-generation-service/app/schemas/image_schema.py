from pydantic import BaseModel, HttpUrl
from typing import Optional


class ImageGenerationRequest(BaseModel):
    prompt: str
    image_type: str
    platform: str
    source_url: Optional[HttpUrl] = None
    category: Optional[str] = None

    viral_score: float = 0.0
    priority_level: str = "low"


class ImageGenerationResponse(BaseModel):
    image_path: str
    optimized_prompt: str
    platform: str
    image_type: str