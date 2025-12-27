import os
import sys

# Add the backend directory to the path so 'app' module can be found
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from celery import Celery
from celery.schedules import crontab
from dotenv import load_dotenv

load_dotenv()

redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "stock_news_aggregator",
    broker=redis_url,
    backend=redis_url
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)

# Schedule tasks
celery_app.conf.beat_schedule = {
    'scrape-trending-news': {
        'task': 'app.tasks.scraper.scrape_trending_news',
        'schedule': crontab(minute=0),  # Every hour
    },
}

# Import tasks directly to register them
import app.tasks.scraper  # noqa
