from pydantic import BaseModel, HttpUrl
from typing import Optional


class PromptRequest(BaseModel):
    topic: str
    content_type: str
    platform: str
    source_url: Optional[HttpUrl] = None
    category: Optional[str] = None


class PromptResponse(BaseModel):
    generated_prompt: str
    optimized_prompt: str
    platform: str
    content_type: str