import requests


SENTIMENT_SERVICE_URL = "http://localhost:8002/sentiment/analyze"


def analyze_article_sentiment(
    title: str,
    content: str,
    source_url: str,
    category: str,
    published_at: str
):
    payload = {
        "article_title": title,
        "article_content": content[:1500],
        "source_url": source_url,
        "category": category,
        "published_at": published_at
    }

    try:
        response = requests.post(
            SENTIMENT_SERVICE_URL,
            json=payload,
            timeout=15
        )

        if response.status_code == 200:
            return response.json()

    except Exception as e:
        print(f"[sentiment_client] Error: {e}")

    return None