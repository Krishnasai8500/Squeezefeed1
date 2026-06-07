import requests
from bs4 import BeautifulSoup

def extract_og_image(url: str):
    try:
        response = requests.get(
            url,
            timeout=10,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        )

        soup = BeautifulSoup(response.text, "html.parser")

        # Try all possible image meta tags in order
        checks = [
            soup.find("meta", property="og:image"),
            soup.find("meta", attrs={"name": "twitter:image"}),
            soup.find("meta", attrs={"name": "twitter:image:src"}),
            soup.find("meta", property="og:image:url"),
        ]

        for tag in checks:
            if tag:
                content = tag.get("content", "").strip()
                if content.startswith("http"):
                    return content

        # Last resort — find first big img tag
        for img in soup.find_all("img"):
            src = img.get("src", "")
            if src.startswith("http") and any(
                ext in src for ext in [".jpg", ".jpeg", ".png", ".webp"]
            ):
                return src

    except Exception as e:
        return None

    return None