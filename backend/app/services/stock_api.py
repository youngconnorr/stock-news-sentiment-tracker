from typing import Dict, List, Optional

import yfinance as yf


class StockAPIService:
    def get_stock_info(self, ticker: str) -> Optional[Dict]:
        """Get current stock info (price, change, etc.)"""
        try:
            stock = yf.Ticker(ticker)
            info = stock.info

            return {
                "symbol": ticker.upper(),
                "name": info.get("shortName") or info.get("longName", ""),
                "price": info.get("regularMarketPrice", 0),
                "change": info.get("regularMarketChange", 0),
                "change_percent": info.get("regularMarketChangePercent", 0),
                "high": info.get("regularMarketDayHigh", 0),
                "low": info.get("regularMarketDayLow", 0),
                "volume": info.get("regularMarketVolume", 0),
                "market_cap": info.get("marketCap", 0),
            }
        except Exception:
            return None

    def get_price_history(
        self, ticker: str, period: str = "1mo", interval: str = "1d"
    ) -> List[Dict]:
        """
        Get historical price data for charting.

        period: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max
        interval: 1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo
        """
        try:
            stock = yf.Ticker(ticker)
            hist = stock.history(period=period, interval=interval)

            if hist.empty:
                return []

            # Convert to list of dicts for JSON serialization
            data = []
            for date, row in hist.iterrows():
                data.append({
                    "date": date.strftime("%Y-%m-%d %H:%M:%S"),
                    "open": round(row["Open"], 2),
                    "high": round(row["High"], 2),
                    "low": round(row["Low"], 2),
                    "close": round(row["Close"], 2),
                    "volume": int(row["Volume"]),
                })

            return data
        except Exception:
            return []


stock_api = StockAPIService()
