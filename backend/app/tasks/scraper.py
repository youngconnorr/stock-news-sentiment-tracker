from celery_app import celery_app
from app.database import SessionLocal
from app.models.article import Article
from app.services.news_api import news_api

TRENDING_TICKERS = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA',
    'NVDA', 'META', 'NFLX', 'AMD', 'INTC'
]


@celery_app.task(name='app.tasks.scraper.scrape_trending_news')
def scrape_trending_news():
    """Periodically scrape news for trending tickers"""
    db = SessionLocal()

    try:
        for ticker in TRENDING_TICKERS:
            articles_data = news_api.get_company_news(ticker, days=1)

            for data in articles_data[:5]:  # Limit to 5 per ticker
                # Check if article already exists
                existing = db.query(Article).filter(
                    Article.url == data["url"]
                ).first()

                if not existing:
                    article = Article(**data)
                    db.add(article)

            db.commit()

        return f"Scraped news for {len(TRENDING_TICKERS)} tickers"

    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()
