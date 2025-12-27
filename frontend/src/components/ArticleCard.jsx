export default function ArticleCard({ article }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
      {article.image_url && (
        <img
          src={article.image_url}
          alt={article.headline}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
      )}

      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <span className="font-semibold text-blue-600">{article.source}</span>
        <span>•</span>
        <span>{formatDate(article.published_at)}</span>
      </div>

      <h3 className="text-xl font-bold mb-2 line-clamp-2">
        {article.headline}
      </h3>

      {article.summary && (
        <p className="text-gray-600 mb-4 line-clamp-3">
          {article.summary}
        </p>
      )}

      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
      >
        Read more →
      </a>
    </div>
  );
}
