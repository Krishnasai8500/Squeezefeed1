def detect_emotion(text: str):

    emotion_keywords = {
        "fear": [
            "war", "attack", "death", "crisis", "terror", "disaster",
            "shortage", "collapse", "threat", "emergency"
        ],

        "anger": [
            "outrage", "corruption", "protest", "violence",
            "fraud", "scandal", "abuse"
        ],

        "joy": [
            "success", "victory", "celebration",
            "achievement", "growth", "record"
        ],

        "sadness": [
            "loss", "tragedy", "mourning",
            "suffering", "displacement"
        ],

        "shock": [
            "shocking", "unbelievable", "massive",
            "explosive", "unexpected", "historic"
        ],

        "curiosity": [
            "revealed", "secret", "why", "how",
            "discovered", "inside"
        ],

        "urgency": [
            "breaking", "urgent", "immediate",
            "alert", "critical", "warning"
        ]
    }

    text_lower = text.lower()

    scores = {
        emotion: sum(
            keyword in text_lower
            for keyword in keywords
        )
        for emotion, keywords in emotion_keywords.items()
    }

    max_emotion = max(scores, key=scores.get)

    if scores[max_emotion] == 0:
        return "neutral"

    return max_emotion