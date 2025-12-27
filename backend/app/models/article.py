from sqlalchemy import Column, DateTime, Index, Integer, String, Text
from sqlalchemy.sql import func

from app.database import Base


class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String(10), nullable=False, index=True)
    headline = Column(Text, nullable=False)
    summary = Column(Text)
    source = Column(String(100))
    url = Column(Text, unique=True, nullable=False)
    published_at = Column(DateTime, nullable=False)
    image_url = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    __table_args__ = (
        Index('idx_ticker_published', 'ticker', 'published_at'),
    )
