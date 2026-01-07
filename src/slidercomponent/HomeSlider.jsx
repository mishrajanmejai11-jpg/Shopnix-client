import React, { useState, useEffect } from "react";
import "./HomeSlider.css";

// const images = [
//   "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1920&h=600&fit=crop",
// "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1920&h=600&fit=crop",
// "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1920&h=600&fit=crop",
// "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1920&h=600&fit=crop",
// ];
const images = [
"https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1920&h=600&fit=crop",
"https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=1920&h=600&fit=crop",
"https://images.unsplash.com/photo-1606813902917-6c57c9b6c8f3?w=1920&h=600&fit=crop",
"https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=1920&h=600&fit=crop",
];

function HomeSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="slider-container">
      {images.map((img, index) => (
        <div
          className={`slide ${index === current ? "active" : ""}`}
          key={index}
        >
          <img src={img} alt={`slide-${index}`} />
        </div>
      ))}

      <div className="dots">
        {images.map((_, index) => (
          <span
            key={index}
            className={index === current ? "dot active-dot" : "dot"}
            onClick={() => setCurrent(index)}
          ></span>
        ))}
      </div>
    </div>
  );
}

export default HomeSlider;
