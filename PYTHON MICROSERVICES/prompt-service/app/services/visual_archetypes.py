ARCHETYPES = {

    "finance": """
Luxury absurdity, middle-class frustration,
money pressure, emotional chaos,
cinematic social satire
""",

    "sports": """
Emotional crowd reactions, dramatic victory or defeat,
fan chaos, exaggerated celebration or heartbreak,
high-energy sports atmosphere
""",

    "politics": """
Power theatre, dramatic public reactions,
symbolic political tension,
cinematic leadership visuals
""",

    "entertainment": """
Celebrity chaos, paparazzi madness,
internet outrage, glamorous absurdity,
viral social media energy
""",

    "education": """
Exam pressure, student anxiety,
family expectations, emotional stress,
competitive academic atmosphere
""",

    "meme-news": """
Internet humor, exaggerated middle-class struggles,
viral absurdity, relatable emotional comedy,
social media meme energy
""",

    "international": """
Global tension, diplomacy drama,
world-event atmosphere,
cinematic geopolitical storytelling
"""
}


def get_visual_archetype(category: str):

    return ARCHETYPES.get(
        category,
        "cinematic viral news storytelling"
    )