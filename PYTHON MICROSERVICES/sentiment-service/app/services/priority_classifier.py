def classify_priority(
        sentiment_score: float,
        emotion_label: str,
        viral_score: float
):

    urgency_score = 0.0

    high_impact_emotions = [
        "fear",
        "anger",
        "shock",
        "urgency",
        "curiosity"
    ]

    if emotion_label in high_impact_emotions:
        urgency_score += 0.45

    urgency_score += abs(sentiment_score) * 0.35

    urgency_score += viral_score * 0.20

    urgency_score = min(round(urgency_score, 2), 1.0)

    if urgency_score >= 0.85:
        priority = "breaking"

    elif urgency_score >= 0.65:
        priority = "high"

    elif urgency_score >= 0.45:
        priority = "medium"

    else:
        priority = "low"

    return {
        "urgency_score": urgency_score,
        "priority_level": priority
    }