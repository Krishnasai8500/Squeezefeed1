import math

def calculate_viral_score(
        sentiment_score: float,
        emotion_label: str,
        content_length: int,
        hours_since_published: float
):

    score = 0.0

    emotion_weights = {
        "anger": 0.40,
        "fear": 0.38,
        "shock": 0.37,
        "urgency": 0.36,
        "curiosity": 0.34,
        "joy": 0.22,
        "sadness": 0.20,
        "neutral": 0.08
    }

    score += emotion_weights.get(emotion_label, 0.08)

    # Emotional intensity
    score += abs(sentiment_score) * 0.45

    # Content richness
    if content_length > 500:
        score += 0.18
    elif content_length > 250:
        score += 0.14
    elif content_length > 120:
        score += 0.10
    else:
        score += 0.05

    DECAY_LAMBDA = 0.08

    decay_factor = math.exp(
        -DECAY_LAMBDA * hours_since_published
    )

    score *= decay_factor
    print("\n===== DECAY TEST =====")
    print("Hours:", hours_since_published)
    print("Base Score:", round(score / decay_factor, 2))
    print("Decay Factor:", round(decay_factor, 2))
    print("Final Score:", round(score, 2))
    print("======================\n")

    return min(round(score, 2), 1.0)