
 // ADMINVIEWS / ADMINLOGIN.Js

   import React,{useState} from "react";
   import { useNavigate } from "react-router-dom";
   import "./adminlogin.css";
   

    function AdminLogin()
    {
        const [uid,setUid] = useState("");
        const [upass,setUpass] = useState("");
        const navigate = useNavigate();


        const handleLoginButton=()=>{
            if(uid==="admin" && upass === "abc@123")
            {
                localStorage.setItem("adminAuth","true");
                navigate("/adminmain/adminlogin/adminhome");
                localStorage.setItem("admintoken","12345");
                navigate("/admin");
            }
            else
            {
                alert("Invalid credentials");
            }
        };
        
        const handleforget=()=>{
            alert("Contact System Administrator to reset password");
        };

        return(
            <div className="adminlogin-container">
                <div className="adminlogin-form">
                    <h4>Administrator Login</h4>
                    <input type="text" placeholder="Admin ID" value={uid} onChange={(e)=> setUid(e.target.value)}/>
                    
                    <input type="password" placeholder="Password" value={upass} onChange={(e)=> setUpass(e.target.value)}/>
              
              <button className="adminLogin-button" onClick={handleLoginButton}>Login</button>
              <button className="adminLogin-button" onClick={handleforget}>Forget Password</button>
                </div>
            </div>
        )
    }
    export default AdminLogin;