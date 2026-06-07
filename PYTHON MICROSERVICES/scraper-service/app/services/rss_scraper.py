import feedparser
from app.core.logging import logger
from bs4 import BeautifulSoup
import html


def _extract_image_from_entry(entry) -> str | None:
    """Try multiple RSS fields where image could be."""

    # Method 1: media:content tag
    media_content = entry.get("media_content", [])
    if media_content and isinstance(media_content, list):
        for media in media_content:
            url = media.get("url")
            if url and url.startswith("http"):
                return url

    # Method 2: media:thumbnail tag
    media_thumbnail = entry.get("media_thumbnail", [])
    if media_thumbnail and isinstance(media_thumbnail, list):
        for thumb in media_thumbnail:
            url = thumb.get("url")
            if url and url.startswith("http"):
                return url

    # Method 3: enclosures (podcast/image attachments)
    enclosures = entry.get("enclosures", [])
    if enclosures:
        for enc in enclosures:
            if enc.get("type", "").startswith("image"):
                url = enc.get("href") or enc.get("url")
                if url:
                    return url

    # Method 4: links with image type
    links = entry.get("links", [])
    for link in links:
        if link.get("type", "").startswith("image"):
            return link.get("href")

    # Method 5: parse from summary HTML if img tag exists
    summary = entry.get("summary", "") or ""
    if "<img" in summary:
        try:
            import re
            match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', summary)
            if match:
                return match.group(1)
        except Exception:
            pass

    return None


def scrape_rss_feed(feed_url: str, source_type = "english"):
    logger.info(f"Starting RSS scrape for feed: {feed_url}")

    feed = feedparser.parse(feed_url)
    articles = []

    for entry in feed.entries[:10]:
        image_url = _extract_image_from_entry(entry)
        summary = entry.get("summary", "")

        summary = BeautifulSoup(
            summary,
            "html.parser"
        ).get_text()

        summary = html.unescape(summary)

        articles.append({
            "title": entry.get("title"),
            "link": entry.get("link"),
            "published": entry.get("published", None),
            "summary": summary,
            "image_url": image_url,       # ✅ now extracted
            "author": entry.get("author", None),
            "language": (
                "TELUGU"
                if source_type == "telugu"
                else "ENGLISH"
            ),
        })

    logger.info(f"RSS scrape completed. Articles found: {len(articles)}")
    return articles

