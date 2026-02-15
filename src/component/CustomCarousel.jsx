import { Carousel } from "antd";
import { memo, useRef, useEffect, useState, useCallback } from "react";
import "./CustomCarousel.css";

const CustomCarousel = memo(({ data }) => {
  const ref = useRef(null);
  const carouselRef = useRef(null);
  const timerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const goToNext = useCallback(() => {
    if (!data || data?.length <= 1) return;
    const nextSlide = (currentSlide + 1) % data?.length;
    carouselRef?.current?.goTo(nextSlide);
    setCurrentSlide(nextSlide);
  }, [currentSlide, data]);

  useEffect(() => {
    if (timerRef?.current) {
      clearTimeout(timerRef?.current);
      timerRef.current = null;
    }

    if (!isVisible || isHovered || !data || data?.length <= 1) return;

    const currentSpeed = data[currentSlide]?.autoplaySpeed || 3000;

    timerRef.current = setTimeout(() => {
      goToNext();
    }, currentSpeed);

    return () => {
      if (timerRef?.current) {
        clearTimeout(timerRef?.current);
      }
    };
  }, [isVisible, isHovered, currentSlide, data, goToNext]);

  const handleClick = (item) => {
    const url = item?.link || item?.media?.url;
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      ref={ref}
      className="custom-carousel-wrapper"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Carousel
        ref={carouselRef}
        autoplay={false}
        dots={false}
        beforeChange={(_, next) => setCurrentSlide(next)}
      >
        {data?.map((item, index) => (
          <div key={index}>
            <div
              className="carousel-slide"
              onClick={() => handleClick(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e?.key === "Enter" || e?.key === " ") {
                  handleClick(item);
                }
              }}
            >
              <div className="img-wrapper">
                <img
                  src={item?.media?.url}
                  alt={item?.brandName}
                  loading="lazy"
                />
              </div>
              <h4>{item?.brandName}</h4>
              <p>{item?.description}</p>
            </div>
          </div>
        ))}
      </Carousel>
      {data?.length > 1 && (
        <div className="carousel-dots">
          {data?.map((_, index) => (
            <span
              key={index}
              className={`carousel-dot-item ${
                index === currentSlide ? "active" : ""
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default CustomCarousel;
