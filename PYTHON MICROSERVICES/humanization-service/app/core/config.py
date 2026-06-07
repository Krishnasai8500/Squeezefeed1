import os
from dotenv import load_dotenv

ENV = os.getenv("ENV", "local")

load_dotenv(f".env.{ENV}")


class Settings:
    APP_NAME = "Humanization Service"
    APP_VERSION = "1.0.0"

    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 8003))

    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "postgresql://newsadmin:root@localhost:5432/news_humanization_db"
    )

    REDIS_URL = os.getenv(
        "REDIS_URL",
        "redis://localhost:6379/0"
    )

    KAFKA_BROKER = os.getenv(
        "KAFKA_BROKER",
        "localhost:9092"
    )

    MODEL_NAME = os.getenv(
        "MODEL_NAME",
        "google/flan-t5-base"
    )


settings = Settings()