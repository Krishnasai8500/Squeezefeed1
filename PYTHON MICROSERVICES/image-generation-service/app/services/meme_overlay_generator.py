from PIL import Image, ImageDraw, ImageFont


def add_meme_overlay(
        image_path: str,
        top_text: str,
        bottom_text: str
):

    image = Image.open(image_path)
    draw = ImageDraw.Draw(image)

    font = ImageFont.load_default()

    # Top text
    draw.text(
        (20, 20),
        top_text,
        fill="white",
        font=font
    )

    # Bottom text
    draw.text(
        (20, image.height - 40),
        bottom_text,
        fill="white",
        font=font
    )

    output_path = image_path.replace(".png", "_overlay.png")

    image.save(output_path)

    return output_path