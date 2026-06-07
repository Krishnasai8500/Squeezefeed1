from sqlalchemy import Column, Integer, String, Text
from app.db.database import Base


class GeneratedImage(Base):
    __tablename__ = "generated_images"

    id = Column(Integer, primary_key=True, index=True)

    prompt = Column(Text, nullable=False)
    optimized_prompt = Column(Text, nullable=True)

    image_type = Column(String, nullable=False)
    platform = Column(String, nullable=False)

    image_path = Column(String, nullable=False)

    source_url = Column(String, nullable=True)
    category = Column(String, nullable=True)