import React from "react";
import { Link } from "react-router-dom";
// import bgimg from "../assets/customer_logo.jpg";
import "./customermain.css";
// import HomeSlider from "../slidercomponent/HomeSlider";
// import MainSlider from "../slidercomponent/Mainslider";
import { FaUserEdit } from "react-icons/fa";

export default function Customermain(){
    return(
        <>
          <header className="customer_header_container">
            {/* <span>Not Register <br/></span> */}
            <Link to="/CustomerReg" className="customer-header-logo"> Register</Link>
            {/* <img src="" alt="customer" ></img> */}
            {/* <img className="customer_header_img" src={bgimg}></img> */}
            <h2> {<big className="cstm"> Customer Home</big>}{<br/>}Let,s Start the Shopping !!  </h2>
            <p className="customer_header_login"> Already User Click here
            <Link to="/Customerlogin">Login</Link>
            </p>

        </header>
        {/* <p className="marqu">
        <marquee >Grab 30% on your First Order USE (CODE-NEW30) %% </marquee></p> */}
            {/* <HomeSlider/> */}
            {/* <MainSlider/> */}
        <div className="customermain_body_container">
            <p className="customermain_login_container">
              Welcome! to Your Shopping World <br/>
             
              Click here <FaUserEdit/> <Link to="/Customerlogin">SignIn</Link>  & Shop Now!!
            </p>
            <p className="customermain_register_container">
              Not Registered?, Don`t Worry Click below & Start Shopping!!
              <FaUserEdit/><Link to="/CustomerReg">SignUp</Link>
            </p>
        </div>
        </>
    )
}
