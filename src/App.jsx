import { useMemo, useState, useEffect, useCallback } from "react";
import "./App.css";
import CustomCarousel from "./component/CustomCarousel";
import data from "./data/data.json";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [contentList, setContentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [columns, setColumns] = useState(8);
  const [slideDirection, setSlideDirection] = useState("right");

  const calculateColumns = useCallback(() => {
    const width = window.innerWidth;
    if (width < 640) return 2;
    else if (width < 768) return 3;
    else if (width < 1024) return 4;
    else return 7;
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
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
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [calculateColumns]);

  const itemsPerPage = columns * 2;

  const groupedData = useMemo(() => {
    const grouped = contentList?.reduce((acc, item) => {
      acc[item.type] = acc[item.type] || [];
      acc[item.type].push(item);
      return acc;
    }, {});

    Object.keys(grouped)?.forEach((type) => {
      grouped[type]?.sort((a, b) => {
        const aPriority = a.priority === true;
        const bPriority = b.priority === true;

        if (aPriority && !bPriority) return -1;
        if (!aPriority && bPriority) return 1;

        if (aPriority && bPriority) {
          return parseInt(a.rank) - parseInt(b.rank);
        }

        return 0;
      });
    });

    return grouped;
  }, [contentList]);

  const groupedEntries = useMemo(() => {
    return Object?.entries(groupedData);
  }, [groupedData]);

  const totalPages = useMemo(() => {
    return Math.ceil(groupedEntries?.length / itemsPerPage);
  }, [groupedEntries.length, itemsPerPage]);

  const currentItems = useMemo(() => {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    return groupedEntries?.slice(start, end);
  }, [groupedEntries, currentPage, itemsPerPage]);

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
  }, [totalPages, currentPage]);

  const gridStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
    }),
    [columns]
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

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
          <div className="content-area">
            <div
              className={`tiles-grid slide-${slideDirection}`}
              style={gridStyle}
              key={currentPage}
            >
              {currentItems?.map(([type, items]) => (
                <div className="tile" key={type}>
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
            {Array?.from({ length: totalPages }, (_, i) => (
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
