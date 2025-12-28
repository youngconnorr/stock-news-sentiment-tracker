import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { newsAPI, stockAPI } from '../services/api';
import ArticleCard from '../components/ArticleCard';
import StockChart from '../components/StockChart';

export default function TickerPage() {
  const { ticker } = useParams();
  const [stockInfo, setStockInfo] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periodChange, setPeriodChange] = useState({ change: 0, changePercent: 0, period: '1M' });

  useEffect(() => {
    fetchData();
  }, [ticker]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [newsData, stockData] = await Promise.all([
        newsAPI.getNews(ticker),
        stockAPI.getStock(ticker).catch(() => null),
      ]);
      setArticles(newsData.articles);
      setStockInfo(stockData);
    } catch (err) {
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatLargeNumber = (num) => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    return num?.toLocaleString() || '0';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-xl text-gray-600">Loading {ticker}...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Back to search
        </Link>

        {/* Stock Header */}
        <div className="mb-6">
          <div className="flex items-baseline gap-4 mb-2">
            <h1 className="text-4xl font-bold text-gray-900">{ticker}</h1>
            {stockInfo && (
              <span className="text-xl text-gray-500">{stockInfo.name}</span>
            )}
          </div>

          {stockInfo && (
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-semibold text-gray-900">
                {formatPrice(stockInfo.price)}
              </span>
              <span
                className={`text-lg font-medium ${
                  periodChange.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {periodChange.change >= 0 ? '+' : ''}
                {periodChange.change?.toFixed(2)} (
                {periodChange.changePercent?.toFixed(2)}%)
              </span>
            </div>
          )}

          {stockInfo && (
            <div className="flex gap-6 mt-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">High:</span> {formatPrice(stockInfo.high)}
              </div>
              <div>
                <span className="font-medium">Low:</span> {formatPrice(stockInfo.low)}
              </div>
              <div>
                <span className="font-medium">Volume:</span> {formatLargeNumber(stockInfo.volume)}
              </div>
              <div>
                <span className="font-medium">Market Cap:</span> {formatLargeNumber(stockInfo.market_cap)}
              </div>
            </div>
          )}
        </div>

        {/* Stock Chart */}
        <div className="mb-8">
          <StockChart ticker={ticker} onPeriodChange={setPeriodChange} />
        </div>

        {/* News Section */}
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Latest News</h2>

        {articles.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            No news found for {ticker}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
