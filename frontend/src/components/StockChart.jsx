import { useEffect, useRef, useState } from 'react';
import { createChart, AreaSeries } from 'lightweight-charts';
import { stockAPI } from '../services/api';

const PERIOD_OPTIONS = [
  { label: '1D', period: '1d', interval: '1m' },
  { label: '5D', period: '5d', interval: '5m' },
  { label: '1M', period: '1mo', interval: '30m' },
  { label: '3M', period: '3mo', interval: '1h' },
  { label: '6M', period: '6mo', interval: '1d' },
  { label: '1Y', period: '1y', interval: '1d' },
  { label: '5Y', period: '5y', interval: '1wk' },
];

export default function StockChart({ ticker, onPeriodChange }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const [selectedPeriod, setSelectedPeriod] = useState(PERIOD_OPTIONS[2]); // Default 1M
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create chart on mount
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: '#ffffff' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 1,
      },
      handleScroll: false,
      handleScale: false,
    });

    // v5 API: use addSeries with AreaSeries type as first argument
    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: '#2563eb',
      topColor: 'rgba(37, 99, 235, 0.4)',
      bottomColor: 'rgba(37, 99, 235, 0.0)',
      lineWidth: 2,
    });

    chartRef.current = chart;
    seriesRef.current = areaSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Fetch data when ticker or period changes
  useEffect(() => {
    const fetchData = async () => {
      if (!seriesRef.current) return;

      setLoading(true);
      setError(null);

      try {
        const data = await stockAPI.getHistory(
          ticker,
          selectedPeriod.period,
          selectedPeriod.interval
        );

        // Transform data for Lightweight Charts
        // Use Unix timestamp for intraday data, date string for daily+
        const isIntraday = ['1m', '5m', '15m', '30m', '1h', '60m', '90m'].includes(
          selectedPeriod.interval
        );

        const chartData = data.data.map((item) => ({
          time: isIntraday
            ? Math.floor(new Date(item.date).getTime() / 1000) // Unix timestamp
            : item.date.split(' ')[0], // Date string for daily data
          value: item.close,
        }));

        seriesRef.current.setData(chartData);
        chartRef.current.timeScale().fitContent();

        // Calculate period change and notify parent
        if (data.data.length >= 2) {
          const firstPrice = data.data[0].close;
          const lastPrice = data.data[data.data.length - 1].close;
          const change = lastPrice - firstPrice;
          const changePercent = (change / firstPrice) * 100;
          onPeriodChange?.({ change, changePercent, period: selectedPeriod.label });
        }
      } catch (err) {
        console.error('Failed to fetch chart data:', err);
        setError('Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker, selectedPeriod, onPeriodChange]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* Period selector */}
      <div className="flex gap-2 mb-4">
        {PERIOD_OPTIONS.map((option) => (
          <button
            key={option.label}
            onClick={() => setSelectedPeriod(option)}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              selectedPeriod.label === option.label
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Chart container */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <span className="text-gray-500">Loading chart...</span>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <span className="text-red-500">{error}</span>
          </div>
        )}
        <div ref={chartContainerRef} />
      </div>
    </div>
  );
}
