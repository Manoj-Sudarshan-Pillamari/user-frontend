import { useState, useEffect } from "react";
import "./App.css";
import BrandCarousel from "./component/BrandCarousel.jsx";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const PREMIUM_LIVE_URL = `${API_URL}/live/now`;
const POPULAR_LIVE_URL = `${
  import.meta.env.VITE_API_BASE_URL
}/popular-brands/live/now`;

function App() {
  const [premiumData, setPremiumData] = useState([]);
  const [popularData, setPopularData] = useState([]);
  const [premiumTileCount, setPremiumTileCount] = useState(7);
  const [popularTileCount, setPopularTileCount] = useState(8);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [premiumRes, popularRes] = await Promise.all([
        axios.get(PREMIUM_LIVE_URL),
        axios.get(POPULAR_LIVE_URL),
      ]);

      setPremiumData(premiumRes?.data?.data || []);
      setPremiumTileCount(premiumRes?.data?.tileCount || 7);

      setPopularData(popularRes?.data?.data || []);
      setPopularTileCount(popularRes?.data?.tileCount || 8);
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button className="retry-button" onClick={fetchData}>
          Retry
        </button>
      </div>
    );
  }

  if (premiumData?.length === 0 && popularData?.length === 0) {
    return (
      <div className="page-container">
        <div className="main-container">
          <h2 className="main-title">Bonc Carousel App</h2>
          <div className="empty-state">
            <p>No active content available at the moment.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {premiumData?.length > 0 && (
        <BrandCarousel
          title="Premium Brands"
          data={premiumData}
          desktopColumns={premiumTileCount}
        />
      )}

      {popularData?.length > 0 && (
        <BrandCarousel
          title="Popular Brands"
          data={popularData}
          desktopColumns={popularTileCount}
        />
      )}
    </div>
  );
}

export default App;
