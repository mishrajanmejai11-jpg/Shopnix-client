import React, { useState, useEffect } from "react";
import "./HomeSlider.css";


const images = [
  "https://images.unsplash.com/photo-1521334884684-d80222895322?w=1920&h=700&fit=crop",
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1920&h=700&fit=crop",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1920&h=700&fit=crop",
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1920&h=700&fit=crop",
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
