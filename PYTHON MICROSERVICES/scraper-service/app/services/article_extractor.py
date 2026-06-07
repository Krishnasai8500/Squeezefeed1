import re

from newspaper import Article
from app.core.logging import logger


def extract_article(url: str):
    logger.info(f"Extracting full article from URL: {url}")

    article = Article(url)

    article.download()
    article.parse()
    article.nlp()
    print("\n===== EXTRACTED TEXT =====")
    print(article.text[:300])
    print("==========================\n")

    # Extract image
    image_url = article.top_image if article.top_image else None

    # Remove bad/logo images
    if image_url and any(bad in image_url.lower() for bad in [
        "logo",
        "icon",
        "favicon",
        "sprite",
        "placeholder",
        "avatar"
    ]):
        image_url = None

    # Clean article text
    cleaned_text = article.text

    # Remove excessive newlines
    cleaned_text = re.sub(r'\n{2,}', '\n', cleaned_text)

    # Remove promotional / garbage content
    bad_patterns = [
        r'Click here.*',
        r'Follow us.*',
        r'Subscribe.*',
        r'For more updates.*',
        r'Download.*app.*',
        r'.*WhatsApp.*',
        r'.*Instagram.*',
        r'.*Facebook.*',
        r'.*Twitter.*',
        r'.*The Indian Express.*',
        r'.*Sign in.*',
        r'.*Login.*',
        r'.*Advertisement.*',
        r'.*Cookie Policy.*',
        r'.*Terms of Use.*',
        r'.*Privacy Policy.*',
    ]

    for pattern in bad_patterns:
        cleaned_text = re.sub(
            pattern,
            '',
            cleaned_text,
            flags=re.IGNORECASE
        )

    # Remove noisy lines
    lines = cleaned_text.split('\n')

    cleaned_lines = []

    bad_starts = [
        "Click here",
        "Follow us",
        "Stay updated",
        "Subscribe",
        "Watch",
        "For more updates",
        "Also Read",
        "Read More"
    ]

    for line in lines:
        line = line.strip()

        if len(line) < 40:
            continue

        if any(
                line.lower().startswith(bad.lower())
                for bad in bad_starts
        ):
            continue

        cleaned_lines.append(line)

    cleaned_text = '\n'.join(cleaned_lines)

    # Hard limit content size
    cleaned_text = cleaned_text[:2500]
    if len(cleaned_text) < 300:
        raise Exception("Weak extraction")

    return {
        "title": article.title,
        "content": cleaned_text,
        "summary": article.summary,
        "author": ", ".join(article.authors) if article.authors else None,
        "publish_date": str(article.publish_date) if article.publish_date else None,
        "image_url": image_url,
        "keywords": article.keywords,
        "source_url": url
    }