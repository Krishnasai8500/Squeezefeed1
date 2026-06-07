import os
import requests
import replicate

from app.core.config import settings

os.makedirs(
    settings.OUTPUT_DIR,
    exist_ok=True
)

MAX_IMAGES_PER_DAY = 20


def count_generated_images_today():

    files = os.listdir(settings.OUTPUT_DIR)

    return len(files)


def generate_image(
        prompt: str,
        image_type: str
):

    # HARD DAILY LIMIT
    if count_generated_images_today() >= MAX_IMAGES_PER_DAY:
        raise Exception(
            "Daily image generation limit reached"
        )

    final_prompt = (
        f"{prompt}, cinematic editorial illustration, "
        f"dramatic emotional storytelling, "
        f"viral social media composition, "
        f"ultra detailed"
    )

    output = replicate.run(
        "black-forest-labs/flux-schnell",
        input={
            "prompt": final_prompt
        }
    )

    image_url = output[0]

    filename = (
        f"{image_type}_{abs(hash(prompt))}.png"
    )

    image_path = os.path.join(
        settings.OUTPUT_DIR,
        filename
    )

    image_data = requests.get(image_url).content

    with open(image_path, "wb") as f:
        f.write(image_data)

    return image_path