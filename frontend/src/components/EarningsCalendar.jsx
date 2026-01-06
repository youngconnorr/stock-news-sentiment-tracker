import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { newsAPI } from '../services/api';

export default function EarningsCalendar() {
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const data = await newsAPI.getEarnings(7);
        setEarnings(data.earnings);
      } catch (err) {
        console.error('Failed to fetch earnings:', err);
        setError('Failed to load earnings calendar');
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  // Group earnings by date
  const groupedEarnings = earnings.reduce((acc, e) => {
    const date = e.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(e);
    return acc;
  }, {});

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatHour = (hour) => {
    if (hour === 'bmo') return 'Before Open';
    if (hour === 'amc') return 'After Close';
    return 'TBD';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Upcoming Earnings</h2>
        <div className="text-gray-500">Loading earnings calendar...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Upcoming Earnings</h2>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Upcoming Earnings This Week</h2>

      {Object.keys(groupedEarnings).length === 0 ? (
        <div className="text-gray-500">No earnings scheduled this week</div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedEarnings)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, companies]) => (
              <div key={date}>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">
                  {formatDate(date)}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {companies.map((company, idx) => (
                    <Link
                      key={`${company.symbol}-${idx}`}
                      to={`/stock/${company.symbol}`}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-blue-100 rounded-full text-sm transition"
                    >
                      <span className="font-medium">{company.symbol}</span>
                      <span className="text-xs text-gray-500">
                        {formatHour(company.hour)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
