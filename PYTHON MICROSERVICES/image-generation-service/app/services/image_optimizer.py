def optimize_image_prompt(
        prompt: str,
        image_type: str
):

    enhancements = {
        "thumbnail": (
            "cinematic composition, high CTR, bold visual hierarchy, dramatic lighting"
        ),

        "meme": (
            "viral humor, expressive visuals, internet trend optimized"
        ),

        "news": (
            "realistic journalism visual, professional editorial quality"
        ),

        "social": (
            "vibrant, engaging, scroll-stopping design"
        )
    }

    enhancement = enhancements.get(
        image_type.lower(),
        "high quality, visually engaging"
    )

    return f"{prompt}, {enhancement}"