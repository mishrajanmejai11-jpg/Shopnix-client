import { useEffect, useState } from "react";
import "./offerbar.css";

const offers = [
  <>🎉 Grab upto <strong>30% OFF</strong> on your First Order — Use Code <strong>NEW30</strong></>,
  <>🚚 <strong>Free Delivery</strong> on Orders Above ₹499</>,
  <>💳 Extra <strong>10% OFF</strong> on Credit Cards</>,
];


const OfferBar = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % offers.length);
    }, 3000); // change every 3 sec

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="offer-bar">
      <span className="offer-text">{offers[index]}</span>
    </div>
  );
};

export default OfferBar;
