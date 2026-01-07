import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./venderchangepass.css";


export default function Venderchangepass({data, onClose})
{
    const [Vuserid,setVuserid]=useState(data);
    const [oldpassword,setOldpassword]=useState('');
    const [newpassword,setNewpassword]=useState('');
    const [confirmpassword,setConfirmpassword]=useState('');
    const [loading,setLoading]=useState(false);
    const [message,setMessage]=useState(null);
    const [error,setError]=useState(null);
    const [showpassword,setShowpassword]=useState({old:false,new:false,confirm:false});

    //auto clear message after 4s
    useEffect(()=>{
        if (message||error) {
            const timer=setTimeout(() => {
                setMessage(null);
                setError(null);
            }, 4000);
            return ()=> clearTimeout(timer);
        }
    },[message,error]);
    //password
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
        if (!Vuserid||!oldpassword||!newpassword||!confirmpassword) {
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
        try {
            const res=await axios.post("http://localhost:5511/vender/changepassword",{Vuserid,Oldpassword:oldpassword,Newpassword:newpassword});
            setMessage(res.data?.message||"Password Change Successfully!");
            setOldpassword('');
            setNewpassword('');
            setConfirmpassword('');
        } catch (error) {
            const msg=error?.response?.data?.message|| error.message||"Failed to change password";
            setError(msg);
        }finally{
            setLoading(false);
        }
    };
    const strength=passwordStrength(newpassword);
    return(
        <div className="vender_changepassword_container">
            <div>
                <div className="form-container">
                    <h3>Change Password</h3>
                    {message&& <div className="alert success">{message}</div>}
                    {error && <div className="alert-error">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <label>User ID: <input type="text" value={Vuserid} onChange={(e)=> setVuserid(e.target.value)} disabled={true} placeholder="Enter your User ID"></input></label>
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
                        <button onClick={onClose} >Back</button>
                    </form>
                    <p className="hint">
                        tip:Use a Strong password (8+ character,uppercase,number,symbols).
                    </p>
                </div>
            </div>
        </div>
    );

}