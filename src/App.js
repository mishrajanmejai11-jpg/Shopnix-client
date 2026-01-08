
import React, { Activity, useState } from "react";
// import VenderLogin from "./Venderview/Venderlogin";
// import CustomerLogin from "./customer/customerlogin";
import ProductListforMainpage from "./ProductView/ProductlistforMainpage";
import "./App.css";
// import { FaShoppingCart,FaUserEdit } from "react-icons/fa";
// import slider1 from './assets/slider1.png'
import MainSlider from "./slidercomponent/Mainslider";
import OfferBar from "./slidercomponent/Offerbar";




export default function App() {
    // let [isVlogin,setIsVLogin]=useState(false);
    // let [isClogin,setIsClogin]=useState(false);
    let [showproduct,setShowProduct]=useState(true);


  return (
    <div className="app_main_container">
        <>
        <div className="Main-Page">
           <MainSlider/>
                  <p className="marqu">
                  {/* <marquee >Grab upto30% on your First Order USE (CODE-NEW30) %% </marquee> */}
                  </p>
                  <OfferBar/>
            {/* <h1> WELCOME, To Your Shoping World!</h1> */}
            {/* <img src={slider1} className="Main_page_slider"></img> */}
            {/* <p>
               <button className="home-shop-btn" onClick={()=>{
                setShowProduct(true);
                setIsClogin(false);
                setIsVLogin(false);
              }}><FaShoppingCart/>Shop Now</button>
              <button className="home-cutomer-btn" onClick={()=>{
                setIsClogin(true);
                setShowProduct(false);
                setIsVLogin(false);
              }}><FaUserEdit/>Customer</button>
              <button className="home-vender-btn" onClick={()=>{
                setIsClogin(false);
                setShowProduct(false);
                setIsVLogin(true);
              }}><FaUserEdit/>Vender</button>
             
            </p> */}
            <p>
              {showproduct && <ProductListforMainpage/>}
              {/* {isClogin && <CustomerLogin/>}
              {isVlogin && <VenderLogin/>} */}
            </p>
        </div>
      
    </>
    </div>
  );
}


