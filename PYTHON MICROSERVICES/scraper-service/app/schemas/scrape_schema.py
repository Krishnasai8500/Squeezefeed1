from pydantic import BaseModel, HttpUrl
from typing import Optional, List


class ScrapeRequest(BaseModel):
    url: Optional[HttpUrl] = None
    rss_feed_url: Optional[HttpUrl] = None
    category: Optional[str] = None
    source_name: Optional[str] = None


class ArticleResponse(BaseModel):
    title: str
    content: str
    summary: Optional[str] = None
    author: Optional[str] = None
    publish_date: Optional[str] = None
    image_url: Optional[str] = None
    keywords: Optional[List[str]] = None
    source_url: str
    category: Optional[str] = None
    source_name: Optional[str] = None
    source_score: float