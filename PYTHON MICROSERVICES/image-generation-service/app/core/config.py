import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    APP_NAME = "Image Generation Service"
    APP_VERSION = "1.0.0"

    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 8005))

    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "postgresql://newsadmin:root@localhost:5432/news_image_db"
    )

    REDIS_URL = os.getenv(
        "REDIS_URL",
        "redis://localhost:6379/0"
    )

    KAFKA_BROKER = os.getenv(
        "KAFKA_BROKER",
        "localhost:9092"
    )

    IMAGE_MODEL = os.getenv(
        "IMAGE_MODEL",
        "stabilityai/stable-diffusion-xl-base-1.0"
    )

    OUTPUT_DIR = os.getenv(
        "OUTPUT_DIR",
        "generated_images"
    )


settings = Settings()