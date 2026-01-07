import React, { useEffect, useState } from "react";
import "./Mainslider.css";
import { useNavigate } from "react-router-dom";

const slides = [
  {
    img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
    title: "Big Festive Sale",
    desc: "Up to 60% OFF on Fashion & Lifestyle",
    btn: "Shop Now"
  },
  {
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    title: "New Arrivals",
    desc: "Trending Shoes Collection 2025",
    btn: "Explore"
  },
  {
    img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    title: "Smart Gadgets",
    desc: "Latest Tech at Best Price",
    btn: "Buy Now"
  }
];

function MainSlider() {
  const [current, setCurrent] = useState(0);
  const navigate=useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);
  const handleProduct=()=>{
navigate("/productlist")
  }

  return (
    <div className="slider-container">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`slide ${index === current ? "active" : ""}`}
        >
          <img src={slide.img} alt="banner" />

          <div className="overlay"></div>

          <div className="slide-content">
            <h1>{slide.title}</h1>
            <p>{slide.desc}</p>
            <button onClick={handleProduct}>{slide.btn}</button>
          </div>
        </div>
      ))}

      <div className="dots">
        {slides.map((_, index) => (
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

export default MainSlider;
