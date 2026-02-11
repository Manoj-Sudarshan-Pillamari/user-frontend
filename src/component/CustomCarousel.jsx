import { Carousel } from "antd";
import { memo, useRef, useEffect, useState } from "react";
import "./CustomCarousel.css";

const CustomCarousel = memo(({ data }) => {
  const ref = useRef(null);
  const [play, setPlay] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setPlay(entry.isIntersecting),
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClick = (url) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      ref={ref}
      className="custom-carousel-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Carousel autoplay={play && !isHovered} dots={false} autoplaySpeed={3000}>
        {data?.map((item, index) => (
          <div key={index}>
            <div
              className="carousel-slide"
              onClick={() => handleClick(item?.media?.url)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleClick(item?.media?.url);
                }
              }}
            >
              <img src={item?.media?.url} alt={item?.text} loading="lazy" />
              <h4>{item?.brandName}</h4>
              <p>{item?.description}</p>
            </div>
          </div>
        ))}
      </Carousel>
      {data?.length > 1 && (
        <div className="carousel-dots">
          {data?.map((_, index) => (
            <span key={index} className="carousel-dot-item" />
          ))}
        </div>
      )}
    </div>
  );
});

export default CustomCarousel;
