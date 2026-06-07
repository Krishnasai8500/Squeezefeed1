from sqlalchemy import Column, Integer, String, Text
from app.db.database import Base


class GeneratedPrompt(Base):
    __tablename__ = "generated_prompts"

    id = Column(Integer, primary_key=True, index=True)

    topic = Column(String, nullable=False)

    content_type = Column(String, nullable=False)
    platform = Column(String, nullable=False)

    generated_prompt = Column(Text, nullable=False)
    optimized_prompt = Column(Text, nullable=True)

    source_url = Column(String, nullable=True)
    category = Column(String, nullable=True)