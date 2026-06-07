def calculate_memeability_score(
        title: str,
        summary: str,
        category: str,
        viral_score: float,
        emotion_label: str
):

    text = f"{title} {summary}".lower()

    score = 0.0

    # Viral content contributes
    score += viral_score * 0.35

    # Emotional amplification
    if emotion_label in [
        "anger",
        "shock",
        "curiosity",
        "urgency"
    ]:
        score += 0.25

    # Memeable internet/news themes
    meme_keywords = [
        "salary",
        "petrol",
        "diesel",
        "inflation",
        "middle class",
        "emi",
        "maggi",
        "viral",
        "social media",
        "ipl",
        "cricket",
        "actor",
        "movie",
        "ott",
        "celebrity",
        "traffic",
        "startup",
        "layoff",
        "expensive",
        "luxury"
    ]

    for keyword in meme_keywords:
        if keyword in text:
            score += 0.08

    # Entertainment + sports naturally meme better
    if category in [
        "sports",
        "entertainment"
    ]:
        score += 0.15

    # Sensitive categories should reduce memeability
    sensitive_keywords = [
        "death",
        "murder",
        "rape",
        "suicide",
        "terror",
        "bomb blast"
    ]

    for keyword in sensitive_keywords:
        if keyword in text:
            score -= 0.35

    score = max(min(round(score, 2), 1.0), 0.0)

    is_meme_candidate = score >= 0.35

    return {
        "memeability_score": score,
        "is_meme_candidate": is_meme_candidate
    }