import SearchBar from '../components/SearchBar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">Stock News Aggregator</h1>
          <p className="text-xl text-gray-600">
            Real-time market news for informed investing
          </p>
        </div>

        <SearchBar />

        <div className="mt-16 text-center">
          <p className="text-gray-500">
            Try searching: AAPL, TSLA, NVDA, MSFT, GOOGL
          </p>
        </div>
      </div>
    </div>
  );
}
