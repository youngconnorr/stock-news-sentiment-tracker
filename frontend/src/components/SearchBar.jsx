import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { newsAPI } from '../services/api';

// Cache tickers globally so they persist across component remounts
let tickersCache = null;

export default function SearchBar() {
  const [ticker, setTicker] = useState('');
  const [allTickers, setAllTickers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  // Fetch all tickers once on mount
  useEffect(() => {
    const loadTickers = async () => {
      if (tickersCache) {
        setAllTickers(tickersCache);
        return;
      }

      setLoading(true);
      try {
        const data = await newsAPI.getTickers();
        tickersCache = data.tickers;
        setAllTickers(data.tickers);
      } catch (err) {
        console.error('Failed to load tickers:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTickers();
  }, []);

  // Filter locally when ticker changes
  useEffect(() => {
    if (ticker.trim().length < 1) {
      setSuggestions([]);
      return;
    }

    const searchUpper = ticker.toUpperCase();
    const filtered = allTickers
      .filter(t =>
        t.symbol.startsWith(searchUpper) ||
        t.description.toUpperCase().includes(searchUpper)
      )
      .slice(0, 8);

    setSuggestions(filtered);
  }, [ticker, allTickers]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ticker.trim()) {
      navigate(`/stock/${ticker.toUpperCase()}`);
      setTicker('');
      setShowSuggestions(false);
    }
  };

  const handleSelect = (symbol) => {
    navigate(`/stock/${symbol}`);
    setTicker('');
    setShowSuggestions(false);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[selectedIndex].symbol);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div ref={wrapperRef} className="w-full max-w-2xl mx-auto relative">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <input
            type="text"
            value={ticker}
            onChange={(e) => {
              setTicker(e.target.value);
              setShowSuggestions(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={loading ? "Loading tickers..." : "Search stock ticker (e.g., AAPL, TSLA, NVDA)"}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Search
          </button>
        </div>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {suggestions.map((s, index) => (
            <li
              key={s.symbol}
              onClick={() => handleSelect(s.symbol)}
              className={`px-4 py-3 cursor-pointer flex justify-between items-center ${
                index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <span className="font-semibold text-gray-900">{s.symbol}</span>
              <span className="text-sm text-gray-500 truncate ml-4 max-w-xs">
                {s.description}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
