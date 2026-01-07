import React, { useState } from "react";
import { Link } from "react-router-dom";
import VenderReg from "./VenderReg";
import VenderLogo from "../assets/VenderLogo.jpg"
import "./VenderMainpage.css";


export default function VenderMainPage(){
     
    let [isRegister,setIsregister]=useState(false);



    return(
        <>
        <header className="vender_header_container">
            <img src={VenderLogo} alt="Vender" className="vender-header-logo"></img>
            <h2>Create Your Own Bussiness World </h2>
            <p className="vender_header_login"> Already User Click here
            <Link to="/VenderLogin">Login</Link>
            </p>

        </header>
        <div className="vender_body_container">
            <h3> You Can Start the  With us by one click </h3>
            <p>Register here to sell your Product with Us </p>
            {isRegister?(<>
            Click Here
            <Link to="/VenderLogin">Login</Link>

            <button className="vender_back_btn" onClick={()=> setIsregister(false)}>Back</button></>

            ):(
            <span>Click Here<button className="vender_main_regbtn" onClick={()=>setIsregister(true)}>SignUp</button> For Registration</span>

            )}
            {isRegister && < VenderReg/> }

           

        </div>
        </>
    )

}