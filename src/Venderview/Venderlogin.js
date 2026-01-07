import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import VenderHome from "./VenderHome";
import './venderlogin.css';
import VenderForgetpassword from "./VenderForgetpassword";
// import { useNavigate } from "react-router-dom";



export default function VenderLogin(){
    const [vuid,setVuid]=useState('');
    const [vupass,setVupass]=useState('');
    const [rember,setRember]=useState(false);
    const [vender,setVender]=useState(null);
    const [showforgot,setShowforgot]=useState(false);

    // const navigate=useNavigate();

    // load session if exists
    useEffect(()=>{ 
    const savedSession=localStorage.getItem("venderSession");
    if (!savedSession) {
        setVender(JSON.parse(savedSession));
    }
    const savedUid=localStorage.getItem("venderUID");
    const SavedPass=localStorage.getItem("venderPass");
    if (savedUid&&SavedPass) {
        setVuid(savedUid);
        setVupass(SavedPass);
        setRember(true);
    }
    },[]);
    
    const handleLogin=async () => {
        try {
           // console.log("vuid",vuid);
            const res=await axios.post("http://localhost:5511/vender/login",{vuid,vupass});
            // toast.warning("response",res.data);
          //  console.log('data',res);
        //   alert("status"+res.data.Status)
            if (res.data && res.data.Vuserid) {
            if (res.data.Status===false) {
                toast.warning('User not active.please wait for admin activation');
                return;
            }
            console.log("data",res.data)
            setVender(res.data);
           // alert('login');
            localStorage.setItem("venderSession",JSON.stringify(res.data));
            if (rember) {
                localStorage.setItem("venderUID",vuid);
                localStorage.setItem("venderPass",vupass);
            }else{
                localStorage.removeItem("venderUID");
                localStorage.removeItem("venderPass")
            }
        }else{
            toast.warning('Invalid Login');
        }
        } catch (error) {
            toast.error(error);

        }
    };
    const handleLogout=()=>{
        setVender(null);
        localStorage.removeItem("venderSession");
    };

    if (showforgot) {
    //    return alert('showforrget')
      return <VenderForgetpassword data={vuid} onBack={()=>setShowforgot(false)}/>
    }
    if (vender) {
    //  alert('welcome'+vender.Vuserid)
    // navigate("/Venderhome")
      return <VenderHome vender={vender} onLogout={handleLogout}></VenderHome>
     // return <Welcome />
    }
    return(
        <div className="vender-login-page">
             <ToastContainer  autoClose={1800}  toastClassName="center-toast" />
            <div className="vender-login-form">
                <h3>Vender Login</h3>
                <input type="text" placeholder="Vender User ID" value={vuid} onChange={(e)=>setVuid(e.target.value)}></input>
                <input type="password" placeholder="Password" value={vupass} onChange={(e)=>setVupass(e.target.value)}></input>
                <div className="vender-btn-box">
                    <input type="checkbox" checked={rember} onChange={(e)=>setRember(e.target.checked)}></input>
                    <label>Remember Me</label>
                    <button className="vender-btn-register" onClick={handleLogin}>Login</button>
                    <button className="vender-btn-register" onClick={(e)=>setShowforgot(true)}>Forget Password ?</button>
                </div>
            </div>
        </div>
    )
}