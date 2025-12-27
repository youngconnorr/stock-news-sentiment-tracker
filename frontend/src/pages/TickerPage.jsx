import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { newsAPI } from '../services/api';
import ArticleCard from '../components/ArticleCard';

export default function TickerPage() {
  const { ticker } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNews();
  }, [ticker]);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await newsAPI.getNews(ticker);
      setArticles(data.articles);
    } catch (err) {
      setError('Failed to load news. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-xl text-gray-600">Loading news for {ticker}...</div>
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

        <h1 className="text-4xl font-bold mb-8 text-gray-900">{ticker} News</h1>

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
