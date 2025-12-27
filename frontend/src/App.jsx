import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TickerPage from './pages/TickerPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/stock/:ticker" element={<TickerPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
