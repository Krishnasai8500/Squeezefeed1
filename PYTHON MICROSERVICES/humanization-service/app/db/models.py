from sqlalchemy import Column, Integer, String, Text
from app.db.database import Base


class HumanizedContent(Base):
    __tablename__ = "humanized_content"

    id = Column(Integer, primary_key=True, index=True)

    original_title = Column(String, nullable=False)
    original_content = Column(Text, nullable=False)

    rewritten_content = Column(Text, nullable=False)

    tone = Column(String, nullable=False)
    platform = Column(String, nullable=False)

    viral_headline = Column(String, nullable=True)

    source_url = Column(String, nullable=True)
    category = Column(String, nullable=True)