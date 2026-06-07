def validate_tone(tone: str):

    supported_tones = [
        "aggressive",
        "professional",
        "meme",
        "emotional",
        "editorial"
    ]

    if tone.lower() not in supported_tones:
        return "professional"

    return tone.lower()