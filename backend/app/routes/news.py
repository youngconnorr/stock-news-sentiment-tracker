from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.article import Article
from app.services.news_api import news_api

router = APIRouter(prefix="/api", tags=["news"])


def article_to_dict(article: Article):
    return {
        "id": article.id,
        "ticker": article.ticker,
        "headline": article.headline,
        "summary": article.summary,
        "source": article.source,
        "url": article.url,
        "published_at": article.published_at.isoformat(),
        "image_url": article.image_url
    }


@router.get("/tickers")
async def get_tickers():
    """Get all valid US stock tickers (cached on frontend for autocomplete)"""
    symbols = news_api.get_us_symbols()
    return {
        "tickers": symbols,
        "count": len(symbols)
    }


@router.get("/news/{ticker}")
async def get_news(
    ticker: str,
    limit: int = Query(20, ge=1, le=100),
    days: int = Query(7, ge=1, le=30),
    db: Session = Depends(get_db)
):
    """Get news for a specific ticker"""
    ticker = ticker.upper()

    # Validate ticker
    if not news_api.is_valid_ticker(ticker):
        raise HTTPException(status_code=404, detail=f"Invalid ticker symbol: {ticker}")

    # Check cache first (articles from last 24 hours)
    cache_cutoff = datetime.now() - timedelta(hours=24)
    cached_articles = db.query(Article).filter(
        Article.ticker == ticker,
        Article.created_at >= cache_cutoff
    ).order_by(Article.published_at.desc()).limit(limit).all()

    if cached_articles:
        return {
            "ticker": ticker,
            "articles": [article_to_dict(a) for a in cached_articles],
            "count": len(cached_articles),
            "cached": True
        }

    # Cache miss - fetch from API
    try:
        articles_data = news_api.get_company_news(ticker, days)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch news: {str(e)}")

    # Save to database
    saved_articles = []
    for data in articles_data[:limit]:
        # Check if URL already exists
        existing = db.query(Article).filter(Article.url == data["url"]).first()
        if not existing:
            article = Article(**data)
            db.add(article)
            saved_articles.append(article)

    db.commit()

    # Refresh to get IDs
    for article in saved_articles:
        db.refresh(article)

    return {
        "ticker": ticker,
        "articles": [article_to_dict(a) for a in saved_articles],
        "count": len(saved_articles),
        "cached": False
    }
