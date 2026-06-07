def optimize_prompt(
        generated_prompt: str,
        content_type: str
):

    enhancements = {

        "image": (
            "Cinematic realism, dramatic lighting, emotionally expressive atmosphere."
        ),

        "thumbnail": (
            "Bold cinematic framing, emotionally intense visual storytelling."
        ),

        "meme": (
            "Visual satire, exaggerated emotional reactions, internet culture energy, dramatic realism."
        ),

        "editorial": (
            "Premium editorial illustration, cinematic news storytelling."
        ),

        "short_video": (
            "Fast-paced cinematic atmosphere, emotionally gripping visual energy."
        )
    }

    enhancement = enhancements.get(
        content_type.lower(),
        "Cinematic visual storytelling."
    )

    return f"{generated_prompt} {enhancement}"