from pydantic import BaseModel, HttpUrl
from typing import Optional, List


class HumanizationRequest(BaseModel):
    original_title: str
    original_content: str
    tone: str
    platform: str
    source_url: Optional[HttpUrl] = None
    category: Optional[str] = None


class HumanizationResponse(BaseModel):
    rewritten_content: str
    viral_headline: str
    tone: str
    platform: str

    category: Optional[str] = None
    tags: Optional[List[str]] = None

    translations: Optional[dict] = None