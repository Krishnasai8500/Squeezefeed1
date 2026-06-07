def adapt_prompt_for_platform(
        prompt: str,
        platform: str
):

    platform = platform.lower()

    if platform == "youtube":
        return (
            f"{prompt} "
            f"Widescreen cinematic framing, expressive emotional atmosphere."
        )

    elif platform == "instagram":
        return (
            f"{prompt} "
            f"Strong visual composition, emotionally striking imagery."
        )

    elif platform == "twitter":
        return (
            f"{prompt} "
            f"Fast-impact visual storytelling, highly expressive reactions."
        )

    elif platform == "news":
        return (
            f"{prompt} "
            f"Editorial cinematic realism, emotionally grounded atmosphere."
        )

    return prompt