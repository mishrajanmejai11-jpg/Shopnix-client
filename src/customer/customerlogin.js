import axios from "axios";
import React, { useEffect, useState } from "react";
// import ReactDOM from "react-dom/client";
import { Link,  useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import "./customerlogin.css";



export default function CustomerLogin(){
    const [uid,setUid]=useState('');
    const [upass,setUpass]=useState('');
    const [ischecked,setIschecked]=useState(false);
    const [error,setError]=useState({});
    const [authError,setAuthError]=useState('');
    const [showforget,setShowforget]=useState(false);
    const [forgetsetp,setForgetstep]=useState(1);
    const [forgetemail,setForgetemail]=useState('');
    const [otp,setOtp]=useState('');
    const [newPassword,setNewPassword]=useState('');
    const [forgetmessage,setForgetmessage]=useState('');
const url=process.env.REACT_APP_API_URL;
           const navigate=useNavigate();  
    

    useEffect(()=>{
        const myCookies=Cookies.get("auth");
        if (myCookies) {
            const obj=JSON.parse(myCookies);
            setUid(obj.username);
            setUpass(obj.password);
        }
    },[]);

    const Validateform=()=>{
        let temp={};
        let valid=true;

        if (!uid||uid.length<5) {
            temp.cuserid="User ID must be at least 4 character";
            valid=false;
        }
        if (!upass||upass.length<3) {
            temp.cuserpass="Password must be at aleast 3 character";
            valid=false;
        }
        setError(temp);
        return valid;

    }


    const handleLogin=(e)=>{
        e.preventDefault();
        if(!Validateform())return;
        setAuthError(''); // reset previous auth error

        axios.post(`${url}/customer/login`,{Cuserid:uid, Cuserpass:upass}).then((res)=>{
           if (res.data.Cuserid) {
            if (res.data.Status===false) {
                toast.warning("User Not Active By Admin, Please Wait for Verfied");
                return;
            }
            if (ischecked) {
                Cookies.set("auth",JSON.stringify({username:uid,password:upass}),{expires:7});
            }
            const sessionData={
                Cfname:res.data.Customername,
                Cpicname:res.data.Cpicname,
                Cid:res.data.Cid,
                Cuserid:res.data.Cuserid,
            };
            if (ischecked) {
                localStorage.setItem("Usersession",JSON.stringify(sessionData));
            }else{
                sessionStorage.setItem("Usersession",JSON.stringify(sessionData));
            }
            localStorage.setItem("customertoken","sometoken456");

            //  const root=ReactDOM.createRoot(document.getElementById('root'));
            //             root.render(<CustomerHome/>);

           navigate("/Customerhome");
        }else{
            setAuthError("Authentication Failed: Invalid ID or Password");
        }

        }).catch((err)=>{                             
            if (err.response) {
                if (err.response.status===404) {
                    setAuthError("Authentication Failed 404: Invalid ID or Password");
                }else{
                    setAuthError("Authentication Failed:"+err.response.data.message);
                }
            }else{
                setAuthError("server error"+err.message);
            }
        });
    
    }
    //send otp
    const handlesendOtp=(e)=>{
        e.preventDefault();
        if (!forgetemail) {
            setForgetmessage("Please Enter your Customer ID"); return;
        }
        axios.post(`${url}/customer/forgetpass/sendotp`,{Cuserid:forgetemail,}).then((res)=>{
            setForgetmessage(res.data.message||"OTP sent to your email");
            setForgetstep(2);
        }).catch((err)=>{
            setForgetmessage("Error"+err.message);
        });
    }

    // verify otp and reset password

    const handleResetPass=(e)=>{
        e.preventDefault();
        if (!otp &&!newPassword) {
            setForgetmessage("Please Enter OTP and New Password"); return;
        }
        axios.post(`${url}/customer/forgetpass/verifyotp`,{Cuserid:forgetemail,otp:otp,Newpassword:newPassword}).then((res)=>{
            setForgetmessage(res.data.message||"Password reset Successfully");
            setForgetstep(1);
            setShowforget(false);
            setOtp('');
            setNewPassword('');
        }).catch((err)=>{
            setForgetmessage("error"+err.message);
        });
    }

    return(
        <div className="customer-login">
             {/* Bubbles */}
  <div className="bubble"></div>
  <div className="bubble"></div>
  <div className="bubble"></div>
  <div className="bubble"></div>
  <div className="bubble"></div>
  <div className="bubble"></div>
  <div className="bubble"></div>
                    <ToastContainer  autoClose={1800}  toastClassName="center-toast" />
            <div className="main-login-page">
                {!showforget?(
                    <>
                    <div className="customer-login-form">
                        <h4>Customer Login</h4>
                        <input type="text" placeholder="Customer ID" value={uid} onChange={(e)=> setUid(e.target.value)}></input><span>{error.cuserid}</span>
                        <input type="password" placeholder="Password" value={upass} onChange={(e)=> setUpass(e.target.value)}></input><span>{error.cuserpass}</span>
                        {authError&& <p className="auth-error">{authError}</p>}
                        <div className="rember-me">
                                <input type="checkbox" checked={ischecked} onChange={(e)=> setIschecked(e.target.checked)}></input><span>Remember Me</span>
                        </div>
                                <button className="btn-login" onClick={handleLogin}>Login</button>
                                <p className="forget-password" onClick={()=>setShowforget(true)}>Forget Password ?</p>
                                <p>Not Registered? <Link to="/CustomerReg">SignUp</Link></p>
                    </div>
                    </>
                ):(<>
                    <h4>Forget Password</h4>
                    {forgetsetp===1?(
                        <>
                            <input className="forget-input" type="text" placeholder="Enter Customer ID" value={uid} disabled={uid} onChange={(e)=>setForgetemail(e.target.value)}></input>
                            <button className="otp-btn" onClick={handlesendOtp}>Send OTP</button>
                        </>
                    ):(<>
                        <input type="text" placeholder="Enter OTP" value={otp} onChange={(e)=> setOtp(e.target.value)}></input>
                        <input type="password" placeholder="Enter New Password" value={newPassword} onChange={(e)=> setNewPassword(e.target.value)}></input>
                        <button className="resetpassword-btn" onClick={handleResetPass}>Reset Password</button>
                    </>)}
                    {forgetmessage&& <p>{forgetmessage}</p>}
                    <p className="Back-login-btn" onClick={()=>{
                        setShowforget(false);
                        setForgetstep(1);
                        setForgetmessage("");
                        setOtp('');
                        setNewPassword('');
                    }}>Back To Login</p>
                </>)}
            </div>
        </div>
    );
}