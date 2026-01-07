// import React from "react";
// import { BrowserRouter,Routes,Route,Link } from "react-router-dom";
// import CustomerHome from "./customer/Customerhome";
// import VendorHome from "./Venderview/VenderHome";
// import App from "./App";
// import VenderReg from "./Venderview/VenderReg";
// import CustomerReg from "./customer/customerReg";
// // import AdminHome from "./Adminview/AdminHome";
// import './mainpage.css';

// export default function MainPage(){
//             return(
//                 <div className="header"> 
//                 <BrowserRouter>

//     <div className="logo"> 
//       <img src="./eco_image.png" alt=""/>

//     </div>
//     <div className="logo_name">ShopNix</div>
//     <div> </div>
   
                
//                 <Link to="/home">home</Link><br/>
//                 <Link to="/CustomerReg">Customer Registration</Link><br/>
//                 <Link to="/VenderReg">Vender Registration</Link><br/>
//                 {/* <Link to="/Admin">Admin Home</Link><br/> */}
//                 <Link to="/Customerhome"></Link>
//                 <Routes>
//                     <Route path="/home" element={<App/>}></Route>
//                     <Route path="/CustomerReg" element={<CustomerReg/>}></Route>
//                     <Route path="/VenderReg" element={<VenderReg/>}></Route>
//                     <Route path="/Customerhome" element={<CustomerHome/>}></Route>
//                     {/* <Route path="/Admin" element={<AdminHome/>}></Route> */}
//                     {/* <Route path="/home" element={<Home/>}></Route> */}
//                 </Routes>
//                 </BrowserRouter>
//            </div> )
// }
import React, { useEffect, useState } from "react";
import {  Routes, Route, Link } from "react-router-dom";


import CustomerHome from "./customer/Customerhome";
import VendorHome from "./Venderview/VenderHome";
import App from "./App";
import logo from "./assets/LogoImg.png"

import "./mainpage1.css";
import CustomerLogin from "./customer/customerlogin";
import VenderLogin from "./Venderview/Venderlogin";
import AdminHome from "./Adminview/AdminHome.js";
import VenderMainPage from "./Venderview/VenderMainpage.jsx";
import axios from "axios";
import ProductListbyCatg from "./ProductView/ProductlistbyCatg.js";
import Customermain from "./customer/Customermain.jsx";
import CustomerReg from "./customer/customerReg.js";
import AdminLogin from "./Adminview/AdminLogin.js";
import MainSlider from "./slidercomponent/Mainslider.jsx";
import HomeSlider from "./slidercomponent/HomeSlider.jsx";
import ProductListforMainpage from "./ProductView/ProductlistforMainpage.js";

export default function MainPage() {

  let [catgid,setCatgid]=useState();
  const [productcatg,setProductcatg]=useState([]);
  const [isproduct,setIsproduct]=useState(true);
  useEffect(()=>{
    axios.get("http://localhost:5511/productcatg/showproductcatg").then((res)=>{
            setProductcatg(res.data);})
  },[]);

  // useEffect(()=>{
  //   if (catgid) {
  //     setIsproduct(false);
  //   }
  // },[isproduct])
  // const handleUpdate=()=>{
  //   setIsproduct(false);
  // }

  const handleproduct=(catgid)=>{
    if (catgid) {
      setCatgid(catgid);
      setIsproduct(false);
      
    }
  }
  return (<>
    
    

      <header className="main-header">

        <div className="logo-section">
          <img src={logo} alt="logo" />
          <h6>ShopNix<br></br>
            <span className="logo_subName">One Stop Shopping Shop </span>
          </h6>
        </div>

        <nav className="header-links">
          <Link to="/home">Home</Link>
          <Link to="/CustomerMain">Customer Login</Link>
          <Link to="/VenderMain">Vendor Login</Link>
          <Link to="/adminlogin">Admin Login</Link>
        </nav>

        <div className="header-right">
          <input
            type="text"
            placeholder="Search for products"
            className="search-bar"
          />
          <span className="cart-icon">🛒</span>
        </div>

      </header>
      <div className="hidden"></div>
      {/* <MainSlider/>
        <p className="marqu">
        <marquee >Grab upto30% on your First Order USE (CODE-NEW30) %% </marquee></p> */}
      <Routes>
        <Route path="/home" element={<App />} />
        <Route path="/CustomerMain" element={<Customermain/>} />
        <Route path="/Customerlogin" element={<CustomerLogin/>} />
        <Route path="/CustomerReg" element={<CustomerReg/>} />
        <Route path="/VenderLogin" element={<VenderLogin />} />
        <Route path="/VenderMain" element={<VenderMainPage />} />
        <Route path="/Customerhome" element={<CustomerHome />} />
        <Route path="/Vendorhome" element={<VendorHome />} />
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/adminlogin" element={<AdminLogin />} />
        <Route path="/productlist" element={<ProductListforMainpage />} />
      </Routes>

     {isproduct?( <section className="product_catg_section">
     
      <div className="catprodct">
        
        <h3  >Product By Category</h3>
       
        </div>
        <div className="d">
            {productcatg.map((item)=>(
          <div key={item.pcatgid}  className="catg_product_card">
            <h4>{item.pcatgname}</h4>
            <span value={item.pcatgid}   onClick={()=>handleproduct(item.pcatgid)}>Click here</span>
            <p>Shop Now</p>
          </div>
        ))}

        </div>
        </section>):( <div className="product_list_onrender">
        {/* {isproduct &&<ProductListbyCatg id={catgid} onback={()=> setIsproduct(true)}/> } */}
        <ProductListbyCatg id={catgid} onback={()=> setIsproduct(true)}/>
      </div>)}
      <HomeSlider/>
      <section className=" tranding-section">
        
        <div className="p" ><hr/> <h3 className="t">Trending Products</h3>
        <hr/>
        </div>
       
        {/* <tr/> */}
        <div className=" main_product_grid">
        
          <div className="product-card">
            <h4>Men T-Shirt</h4>
            <p>₹799</p>
          </div>
          <div className="product-card">
            <h4>Women Kurti</h4>
            <p>₹1299</p>
          </div>
          <div className="product-card">
            <h4>Shoes</h4>
            <p>₹1999</p>
          </div>
          <div className="product-card">
            <h4>Watch</h4>
            <p>₹2499</p>
          </div>
        </div>
      </section>

      {/* ================= MAP & FEEDBACK SECTION ================= */}
<section className="map-feedback-section">

  {/* ---- MAP ---- */}
  <div className="map-container">
    <h3>Find Our Store</h3>
    <iframe
  title="ShopNix Store Location"
  src="https://www.google.com/maps?q=Universal Informatics, Indore,India&output=embed"
  width="100%"
  height="300"
  style={{ border: 0, borderRadius: "10px" }}
  allowFullScreen
  loading="lazy"
></iframe>

  </div>

  {/* ---- FEEDBACK FORM ---- */}
  <div className="feedback-container">
    <h3>Customer Feedback</h3>
    <form className="feedback-form">
      <input
        type="text"
        placeholder="Your Name"
        required
      />
      <input
        type="email"
        placeholder="Your Email"
        required
      />
      <textarea
        placeholder="Write your feedback here..."
        rows="4"
        required
      ></textarea>
      <button type="submit">Submit Feedback</button>
    </form>
  </div>

</section>

      
      </>

     

   
  );
}
