import trafilatura


def trafilatura_extract(url: str):

    downloaded = trafilatura.fetch_url(url)

    if not downloaded:
        return None

    text = trafilatura.extract(downloaded)

    if not text:
        return None

    return {
        "title": None,
        "content": text[:2500],
        "summary": "",
        "author": None,
        "publish_date": None,
        "image_url": None,
        "keywords": [],
        "source_url": url
    }