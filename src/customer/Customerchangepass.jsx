import axios from "axios";
import React, {  useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import "./customerchangepass.css";

export default function CustomerChangepass({customer,Onclose}){
    const [Cuserid,setCuserid]=useState('');
    const [oldpassword,setOldpassword]=useState('');
    const [newpassword,setNewpassword]=useState('');
    const [confirmpassword,setConfirmpassword]=useState('');
    const [loading,setLoading]=useState(false);
    const [message,setMessage]=useState(null);
    const [error,setError]=useState(null);
    const [showpassword,setShowpassword]=useState({old:false,new:false,confirm:false});
    const url=process.env.REACT_APP_API_URL;
    //auto clear mssage after 4s

    useEffect(()=>{
        if (message||error) {
            const timer=setTimeout(() => {
                setMessage(null);
                setError(null);
            }, 4000);
            return ()=> clearTimeout(timer);
        }
    },[message,error]);

     function passwordStrength(pw){
        if (!pw) return {label:"",score:0};
        let score=0;
        if(pw.length>=8) score++;
        if(/[A-Z]/.test(pw)) score++;
        if(/[0-9]/.test(pw)) score++;
        if(/[^A-Za-z0-9]/.test(pw)) score++;

        const labels=["Very Weak","Weak","Good","Strong"];
        return {label:labels[score-1]||"",score};
    }

    const handleSubmit=async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);
        if (!Cuserid||!oldpassword||!newpassword||!confirmpassword) {
            setError("Please fill all fields");
            return;
        }
        if (newpassword!==confirmpassword) {
            setError("New password and confirm password do not match");
            return;
        }
        if (newpassword.length<6) {
            setError("New Password must be at least 6 character long");
            return;
        }
        setLoading(true);
        if (customer.Cuserid!==Cuserid) {
            setError("UserID does Not match the logged in user");
            setLoading(false);
            return;
        }

        try {
            const res=await axios.post(`${url}/customer/changepassword`,{Cuserid,Oldpassword:oldpassword,Newpassword:newpassword});
            setMessage(res.data?.message||"Password Change Successfully!");
            setOldpassword('');
            setNewpassword('');
            setConfirmpassword('');
            toast.success("Password changed Successfully.Please login again");
            Onclose();
        } catch (error) {
            const msg=error?.response?.data?.message|| error.message||"Failed to change password";
            setError(msg);
        }finally{
            setLoading(false);
        }
    };
    const strength=passwordStrength(newpassword);
    return(
        <div className="customer_changepsswrd_conatiner">
            <div>
                <div className="customer_form-container">
                    <h3>Change Password</h3>
                    {message&& <div className="alert success">{message}</div>}
                    {error && <div className="alert-error">{error}</div>}
                    <form className="customer_changepassword_form" onSubmit={handleSubmit}>
                        <label>User ID: <input type="text" value={customer.Cuserid} disabled={customer.Cuserid} onChange={(e)=> setCuserid(e.target.value)} placeholder="Enter your User ID"></input></label>
                        <div>
                        <label>Old Password: <input type={showpassword.old?"text":"password"}
                        value={oldpassword} onChange={(e)=> setOldpassword(e.target.value)} placeholder="Enter the Current Password"></input></label>
                        <span onClick={()=> setShowpassword({...showpassword,old:!showpassword.old})}>{showpassword.old?<FaEyeSlash></FaEyeSlash>:<FaEye></FaEye>}</span>
                        </div>
                        <label>NEW PASSWORD</label>
                    <div className="password-filed">
                        <input 
                            type={showpassword.new ? "text" : "password"} 
                            value={newpassword} 
                            onChange={(e) => setNewpassword(e.target.value)} 
                            placeholder="Enter New Password"
                        />

                        <span onClick={() => setShowpassword({...showpassword, new: !showpassword.new})}>
                            {showpassword.new ? <FaEyeSlash/> : <FaEye/>}
                        </span>
                    </div>
                        {strength.label && (<div className="strength-bar">
                            <div className={`bar level-${strength.score}`}></div>
                            <span>{strength.label}</span>
                        </div>)}
                        <label>Confirm New Password</label>
                        <div>
                            <input type={showpassword.confirm?"text":'password'}
                            value={confirmpassword}
                            onChange={(e)=> setConfirmpassword(e.target.value)}
                            placeholder="Re-enter new password"></input>
                            <span onClick={()=> setShowpassword({...showpassword,confirm:!showpassword.confirm})}>{showpassword.confirm?<FaEyeSlash></FaEyeSlash>:<FaEye></FaEye>}</span>
                        </div>
                        <button type="submit" disabled={loading}>{loading?"Saving...":"Change Password"}</button>
                    </form>
                    <p className="hint">
                        tip:Use a Strong password (8+ character,uppercase,number,symbols).
                    </p>
                </div>
            </div>
        </div>
    );

}