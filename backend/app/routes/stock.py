from fastapi import APIRouter, HTTPException, Query

from app.services.stock_api import stock_api

router = APIRouter(prefix="/api", tags=["stock"])


@router.get("/stock/{ticker}")
async def get_stock(ticker: str):
    """Get current stock info"""
    info = stock_api.get_stock_info(ticker.upper())

    if not info or not info.get("price"):
        raise HTTPException(status_code=404, detail=f"Stock not found: {ticker}")

    return info


@router.get("/stock/{ticker}/history")
async def get_stock_history(
    ticker: str,
    period: str = Query("1mo", regex="^(1d|5d|1mo|3mo|6mo|1y|2y|5y|10y|ytd|max)$"),
    interval: str = Query("1d", regex="^(1m|2m|5m|15m|30m|60m|90m|1h|1d|5d|1wk|1mo|3mo)$"),
):
    """Get historical price data for charting"""
    data = stock_api.get_price_history(ticker.upper(), period, interval)

    if not data:
        raise HTTPException(status_code=404, detail=f"No history found for: {ticker}")

    return {
        "ticker": ticker.upper(),
        "period": period,
        "interval": interval,
        "data": data,
        "count": len(data),
    }
