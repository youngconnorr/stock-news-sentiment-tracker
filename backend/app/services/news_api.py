import os
from datetime import datetime, timedelta
from typing import Dict, List

import requests
from dotenv import load_dotenv

load_dotenv()


class NewsAPIService:
    def __init__(self):
        self.api_key = os.getenv("FINNHUB_API_KEY")
        self.base_url = "https://finnhub.io/api/v1"
        self._symbols_cache: List[Dict] = []

    def get_us_symbols(self) -> List[Dict]:
        """Fetch all US stock symbols from Finnhub (cached)"""
        if self._symbols_cache:
            return self._symbols_cache

        url = f"{self.base_url}/stock/symbol"
        params = {
            "exchange": "US",
            "token": self.api_key
        }

        response = requests.get(url, params=params)
        response.raise_for_status()

        symbols = response.json()

        # Filter to common stocks and format for frontend
        self._symbols_cache = [
            {
                "symbol": s.get("symbol", ""),
                "description": s.get("description", ""),
            }
            for s in symbols
            if s.get("type") == "Common Stock" and s.get("symbol")
        ]

        return self._symbols_cache

    def is_valid_ticker(self, ticker: str) -> bool:
        """Check if ticker exists in US symbols"""
        symbols = self.get_us_symbols()
        return any(s["symbol"] == ticker.upper() for s in symbols)

    def get_company_news(self, ticker: str, days: int = 7) -> List[Dict]:
        """Fetch company news from Finnhub"""
        to_date = datetime.now()
        from_date = to_date - timedelta(days=days)

        url = f"{self.base_url}/company-news"
        params = {
            "symbol": ticker,
            "from": from_date.strftime("%Y-%m-%d"),
            "to": to_date.strftime("%Y-%m-%d"),
            "token": self.api_key
        }

        response = requests.get(url, params=params)
        response.raise_for_status()

        articles = response.json()

        # Transform to our format
        return [
            {
                "ticker": ticker,
                "headline": article.get("headline", ""),
                "summary": article.get("summary", ""),
                "source": article.get("source", ""),
                "url": article.get("url", ""),
                "published_at": datetime.fromtimestamp(article.get("datetime", 0)),
                "image_url": article.get("image", "")
            }
            for article in articles
            if article.get("headline") and article.get("url")
        ]


news_api = NewsAPIService()
