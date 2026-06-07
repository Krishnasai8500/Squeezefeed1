import trafilatura
import requests
from bs4 import BeautifulSoup
from app.core.logging import logger


def fallback_extract(url: str):
    logger.info(f"Fallback extraction started for URL: {url}")

    try:
        downloaded = trafilatura.fetch_url(url)

        if downloaded:
            content = trafilatura.extract(downloaded)

            if content:
                return {
                    "content": content,
                    "source_url": url
                }

        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")

        paragraphs = soup.find_all("p")
        content = " ".join([p.get_text() for p in paragraphs])

        return {
            "content": content.strip(),
            "source_url": url
        }

    except Exception as e:
        logger.error(f"Fallback extraction failed: {str(e)}")
        return None