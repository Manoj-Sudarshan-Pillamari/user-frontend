import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import "./App.css";
import CustomCarousel from "./component/CustomCarousel";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const LIVE_URL = `${API_URL}/live/now`;
const ROWS = 2;

function App() {
  const [contentList, setContentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [columns, setColumns] = useState(7);
  const [slideDirection, setSlideDirection] = useState("right");
  const [gridHeight, setGridHeight] = useState(null);
  const gridRef = useRef(null);

  const calculateColumns = useCallback(() => {
    const width = window.innerWidth;
    if (width < 640) return 2;
    else if (width < 768) return 3;
    else if (width < 1024) return 4;
    else return 7;
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(LIVE_URL);
      setContentList(res?.data?.data);
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const newColumns = calculateColumns();
      setColumns(newColumns);
      setCurrentPage(0);
      setGridHeight(null);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [calculateColumns]);

  useEffect(() => {
    if (!gridRef.current || gridHeight) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height;
        if (height > 0) {
          setGridHeight(height);
          observer.disconnect();
        }
      }
    });

    observer.observe(gridRef.current);

    return () => observer.disconnect();
  }, [currentPage, gridHeight, contentList]);

  const itemsPerPage = columns * ROWS;

  const groupedData = useMemo(() => {
    const grouped = {};

    contentList?.forEach((item) => {
      const tileKey = item?.tile || 1;
      if (!grouped[tileKey]) {
        grouped[tileKey] = [];
      }
      grouped[tileKey]?.push(item);
    });

    Object.keys(grouped)?.forEach((tile) => {
      grouped[tile]?.sort((a, b) => {
        const aPriority = a?.priority === true;
        const bPriority = b?.priority === true;

        if (aPriority && !bPriority) return -1;
        if (!aPriority && bPriority) return 1;

        if (aPriority && bPriority) {
          return parseInt(a?.rank) - parseInt(b?.rank);
        }

        return 0;
      });
    });

    return grouped;
  }, [contentList]);

  const sortedTiles = useMemo(() => {
    return Object.entries(groupedData).sort(
      ([a], [b]) => Number(a) - Number(b)
    );
  }, [groupedData]);

  const totalPages = useMemo(() => {
    return Math.ceil(sortedTiles?.length / itemsPerPage);
  }, [sortedTiles.length, itemsPerPage]);

  const currentItems = useMemo(() => {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    return sortedTiles?.slice(start, end);
  }, [sortedTiles, currentPage, itemsPerPage]);

  const canScrollLeft = currentPage > 0;
  const canScrollRight = currentPage < totalPages - 1;

  const scroll = useCallback(
    (dir) => {
      setSlideDirection(dir);
      if (dir === "left" && currentPage > 0) {
        setCurrentPage((prev) => prev - 1);
      } else if (dir === "right" && currentPage < totalPages - 1) {
        setCurrentPage((prev) => prev + 1);
      }
    },
    [currentPage, totalPages]
  );

  const handleDotClick = useCallback(
    (index) => {
      setSlideDirection(index > currentPage ? "right" : "left");
      setCurrentPage(index);
    },
    [currentPage]
  );

  useEffect(() => {
    if (totalPages <= 1) return;

    const interval = setInterval(() => {
      setSlideDirection("right");
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 15000);

    return () => clearInterval(interval);
  }, [totalPages]);

  const gridStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
    }),
    [columns]
  );

  if (loading) return <p>Loading...</p>;

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button className="retry-button" onClick={fetchBrands}>
          Retry
        </button>
      </div>
    );
  }

  if (contentList?.length === 0) {
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
      <div className="main-container">
        <h2 className="main-title">Bonc Carousel App</h2>
        <div className="scroll-wrapper">
          <button
            className={`arrow left ${!canScrollLeft ? "disabled" : ""}`}
            disabled={!canScrollLeft}
            onClick={() => scroll("left")}
            aria-label="Previous page"
          >
            ‹
          </button>
          <div
            className="content-area"
            style={{
              minHeight: gridHeight ? `${gridHeight}px` : "auto",
            }}
          >
            <div
              ref={gridRef}
              className={`tiles-grid slide-${slideDirection}`}
              style={gridStyle}
              key={currentPage}
            >
              {currentItems?.map(([tile, items]) => (
                <div className="tile" key={tile}>
                  <CustomCarousel data={items} />
                </div>
              ))}
            </div>
          </div>
          <button
            className={`arrow right ${!canScrollRight ? "disabled" : ""}`}
            disabled={!canScrollRight}
            onClick={() => scroll("right")}
            aria-label="Next page"
          >
            ›
          </button>
        </div>
        {totalPages > 1 && (
          <div className="page-indicators">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => handleDotClick(i)}
                className={`page-dot ${i === currentPage ? "active" : ""}`}
                aria-label={`Go to page ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
