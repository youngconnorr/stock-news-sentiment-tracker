import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const newsAPI = {
  getNews: async (ticker, limit = 20, days = 7) => {
    const response = await api.get(`/api/news/${ticker}`, {
      params: { limit, days }
    });
    return response.data;
  },

  getTrending: async (limit = 10) => {
    const response = await api.get('/api/trending', {
      params: { limit }
    });
    return response.data;
  },

  getTickers: async () => {
    const response = await api.get('/api/tickers');
    return response.data;
  },
};

export const stockAPI = {
  getStock: async (ticker) => {
    const response = await api.get(`/api/stock/${ticker}`);
    return response.data;
  },

  getHistory: async (ticker, period = '1mo', interval = '1d') => {
    const response = await api.get(`/api/stock/${ticker}/history`, {
      params: { period, interval }
    });
    return response.data;
  },
};

export default api;
