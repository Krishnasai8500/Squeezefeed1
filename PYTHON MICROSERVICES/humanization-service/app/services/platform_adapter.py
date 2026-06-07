def adapt_for_platform(
        content: str,
        platform: str
):

    platform = platform.lower()

    if platform == "youtube":
        return content[:500]

    elif platform == "instagram":
        return content[:300]

    elif platform == "twitter":
        return content[:280]

    elif platform == "news":
        return content

    return content