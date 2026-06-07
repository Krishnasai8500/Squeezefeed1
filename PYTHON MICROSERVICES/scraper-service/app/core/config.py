import os
from dotenv import load_dotenv

ENV = os.getenv("ENV", "local")

load_dotenv(f".env.{ENV}")

class Settings:
    APP_NAME = "Scraper Service"
    APP_VERSION = "1.0.0"

    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 8001))

    # DATABASE_URL = os.getenv(
    #     "DATABASE_URL",
    #     "postgresql://postgres:password@localhost:5432/news_scraper_db"
    # )
    #
    # REDIS_URL = os.getenv(
    #     "REDIS_URL",
    #     "redis://localhost:6379/0"
    # )
    #
    # KAFKA_BROKER = os.getenv(
    #     "KAFKA_BROKER",
    #     "localhost:9092"
    # )

    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "postgresql://newsadmin:root@host.docker.internal:5432/news_scraper_db"
    )

    REDIS_URL = os.getenv(
        "REDIS_URL",
        "redis://redis:6379/0"
    )

    KAFKA_BROKER = os.getenv(
        "KAFKA_BROKER",
        "host.docker.internal:9092"
    )
    SCRAPE_TIMEOUT = int(os.getenv("SCRAPE_TIMEOUT", 10))

    USER_AGENT = os.getenv(
        "USER_AGENT",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    )


settings = Settings()