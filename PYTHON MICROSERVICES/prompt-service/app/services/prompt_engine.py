import os

from groq import Groq

from app.services.visual_archetypes import (
    get_visual_archetype
)

client = Groq(
    api_key=os.environ.get("GROQ_API_KEY")
)

SYSTEM_PROMPT = """
You are an elite cinematic meme-news director and viral visual storyteller.

Your job is to transform news topics into emotionally engaging,
internet-shareable image generation prompts.

STRICT RULES:
- Focus on visual storytelling
- Create emotionally exaggerated scenes
- Prioritize relatable internet culture
- Use cinematic realism
- Create visual absurdity when appropriate
- Describe atmosphere, facial expressions, environment and emotional chaos
- Avoid generic marketing language
- Avoid corporate tone
- NO text overlays
- NO typography
- NO captions
- Generate highly visual scene descriptions only
- Keep prompts under 120 words.
- Use compact cinematic descriptions.
- Avoid long storytelling paragraphs.
- Do NOT write headings like "Scene Description".
"""


def generate_prompt(
        topic: str,
        content_type: str,
        platform: str
):

    visual_style = get_visual_archetype(
        content_type
    )

    user_prompt = f"""
Topic:
{topic}

Visual Archetype:
{visual_style}

Platform:
{platform}

Create a highly visual, emotionally engaging,
viral meme-news image generation prompt.
"""

    try:

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",

            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": user_prompt
                }
            ],

            temperature=0.8,

            max_tokens=180,
        )

        generated_prompt = (
            response
            .choices[0]
            .message
            .content
            .strip()
        )

        return generated_prompt

    except Exception as e:

        print(
            f"[prompt_engine] Groq error: {e}"
        )

        return (
            f"{topic}, cinematic emotional storytelling, "
            f"viral meme-news atmosphere, dramatic realism"
        )