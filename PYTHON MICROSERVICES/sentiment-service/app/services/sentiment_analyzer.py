from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

analyzer = SentimentIntensityAnalyzer()


HIGH_IMPACT_KEYWORDS = [
    "war", "crisis", "death", "collapse", "disaster",
    "emergency", "shortage", "conflict", "threat",
    "inflation", "food crisis", "terror", "attack"
]


def analyze_sentiment(text: str):
    scores = analyzer.polarity_scores(text)

    compound = scores["compound"]

    # Premium urgency boost
    keyword_boost = 0

    lower_text = text.lower()

    for keyword in HIGH_IMPACT_KEYWORDS:
        if keyword in lower_text:
            keyword_boost += 0.08

    adjusted_score = compound - keyword_boost

    adjusted_score = max(min(adjusted_score, 1.0), -1.0)

    if adjusted_score >= 0.05:
        label = "positive"
    elif adjusted_score <= -0.05:
        label = "negative"
    else:
        label = "neutral"

    return {
        "sentiment_label": label,
        "polarity_score": round(adjusted_score, 4)
    }