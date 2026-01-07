import axios from "axios";
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";

export default function VenderForgetpassword({data,onBack}){
    const [Vuserid,setVuserid]=useState(data);
    const [otp,setOtp]=useState('');
    const [Newpassword,setNewpassword]=useState('');
    const [step,setStep]=useState(1);
    const [visible,setVisible]=useState(false);

    // if (data) {
    //     setVisible(true);
    // }else{
    //     setVisible(false);
    // }
    const handleEdit=()=>{
        if (data) {
            return true;
        }else return false;
    }

    const sendOtp=async () => {
        try {
            const res=await axios.post("http://localhost:5511/vender/sendotp",{Vuserid});
            toast.success(res.data.message);
            if(res.data.success) setStep(2);
            
        } catch (error) {
            toast.error(error);
        }
    };
    

    const resetPassword= async () => {
        try {
            const res= await axios.post("http://localhost:5511/vender/resetpassword",{Vuserid,otp,Newpassword});
            alert("reset");
            toast.success(res.data.message);
            toast.success("Password is Reset successfully");
            if(res.data.success) onBack();
        } catch (error) {
            toast.error(error);
        }
    };
    console.log(handleEdit());
    return(
        <div>
         <ToastContainer  autoClose={1800}  toastClassName="center-toast" />
            <div>
                <h3>Vender Forget Password</h3>
                {step===1&&(<><input type="text" value={Vuserid} disabled={handleEdit()} placeholder="Enter Vender User ID" onChange={(e)=> setVuserid(e.target.value)}></input><button onClick={sendOtp}>Send Otp</button></>)}
                {step===2&&(<><input type="text" placeholder="Enter OTP" value={otp} onChange={(e)=> setOtp(e.target.value)}></input><br/><input type="password" placeholder="Enter New Password" value={Newpassword} onChange={(e)=> setNewpassword(e.target.value)}></input><br/><button onClick={resetPassword}>Reset Password</button></>)}
                <button onClick={onBack}>Back to Login</button>
            </div>
        </div>
    )
}