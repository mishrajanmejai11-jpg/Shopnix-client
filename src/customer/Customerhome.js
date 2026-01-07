import React, { useEffect, useState } from "react";
import { FaBoxOpen, FaKey, FaShoppingCart, FaSignOutAlt, FaTruck, FaUserEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import CustomerChangePass from './Customerchangepass';
import "./customerhome1.css";
import EditCustomerProfile from "./EditcustomerProfile";
import ProductList from "../ProductView/ProductList";
import BillByID from "./BillbyID";
import OrderTracking from "./OrderTracking";





export default function CustomerHome(){
    const [user,setUser]=useState(null);
    const [isloading,setIsloading]=useState(false);
    const [isShowplist,setIsShowplist]=useState(true);
    const [isShowbill,setIsshowbill]=useState(false);
    const [isEditprofile,setIsEditprofile]=useState(false);
    const [isChangePass,setIschangepass]=useState(false);
    const [isshoworder,setIsshoworder]=useState(false);
    
    const navigate=useNavigate();

    useEffect(()=>{
        const localData=localStorage.getItem("Usersession");
        const sessionData=sessionStorage.getItem("Usersession");
        const userData=localData||sessionData;
        setUser(userData);
        if (!userData) {
            toast.warning("Session Expired.Please log in again.");
            // navigate("customer/customerlogin");
        }else{
            setUser(JSON.parse(userData));
        }
    },[]);
   
    const Resetall=()=>{
        setIsShowplist(false);
        setIsshowbill(false);
        setIsEditprofile(false);
        setIschangepass(false);
        setIsshoworder(false);
    };

    const handleViewSwitch=(callback)=>{
        Resetall();
        setIsloading(true);
        setTimeout(()=>{
            callback();
            setIsloading(false);
        },300)// smoth animation delay
    };

    const handleLogout=()=>{
        if (window.confirm("Are you sure want to logout")) {
            localStorage.removeItem("Usersession");
            sessionStorage.removeItem("Usersession");
            localStorage.removeItem("customertoken");
            navigate("/home");
        }
    };
    // console.log("user picname",user.Cpicname);
   //return(<div><h3>Welcome to home</h3></div>)
    if(!user)return null;
    
    return(
        <div>
             <ToastContainer  autoClose={1800}  toastClassName="center-toast" />
            <div className="customer-home">
                {/* --------top bar------- */}
                <header className="customer-topbar">
                    <div className="topbar-1">
                        <div className="customer-info">
                            <img height={150} width={150} src={user.Cpicname} alt="customer" className="customer-img"></img>
                            <span> Welcome ,{user.Cfname}</span>
                        </div>
                    </div>
                    {/* row-2 top bar */}
                    <div className="topbar-2 customer-btn">
                        <button className="customer_home_topbar_btn" onClick={()=> handleViewSwitch(()=>setIsEditprofile(true))}><FaUserEdit/> Edit Profile</button>
                        <button className="customer_home_topbar_btn" onClick={()=> handleViewSwitch(()=>setIsShowplist(true))}><FaShoppingCart/> Shopping</button>
                        <button className="customer_home_topbar_btn" onClick={()=> handleViewSwitch(()=>setIsshowbill(true))}><FaBoxOpen/> View orders</button>
                        <button onClick={()=> handleViewSwitch(()=>setIsshoworder(true))} className={`order-btn-${isshoworder?"active":""}`}><FaTruck/> Tracks orders</button>
                        <button onClick={()=> handleViewSwitch(()=>setIschangepass(true))} className={`password-btn-${isChangePass?"active":""}`}><FaKey/> Change Password</button>
                        <button onClick={handleLogout} className="customer_home_topbar-logout-btn"><FaSignOutAlt/> Logout</button>
                    </div>

                </header>

                {/* loader */}
                {isloading && (
                    <div className="loader-wrap">
                         <div className="loder-box">
                            <p>Loading....</p>
                         </div>
                    </div>
                )}
                {/* content */}
                {!isloading && (
                    <div className="customer-content">
                            {isShowplist && <ProductList data={user.Cid} back={()=>setIsShowplist(false)} ></ProductList>}
                            {isShowbill && <BillByID data={user.Cid}></BillByID>}
                        {isEditprofile && (<EditCustomerProfile user={user} onClose={()=>setIsEditprofile(false)} onUpdate={(update)=>{const updateSession={Cfname:update.CustomerName, cpicname:update.Cpicname,Cid:update.Cid}; setUser(updateSession)
                    if (localStorage.getItem("userSession")) {
                        localStorage.setItem("userSession",JSON.stringify(updateSession))
                    }else{
                        sessionStorage.setItem("userSession",JSON.stringify(updateSession))
                    }}}></EditCustomerProfile>)}
                    {isshoworder && (
                        <div className="customer_order_tracking_box">
                            <OrderTracking Cuserid={user.Cid||user.Cuserid} Onclose={()=>setIsshoworder(false)}></OrderTracking>
                        </div>
                    )}
                     {isChangePass && (
                    <div>
                        <CustomerChangePass customer={user} Onclose={()=> setIschangepass(false)}></CustomerChangePass>
                    </div>
                )}
                    </div>
                )}
               
            </div>
        </div>
    );
 

    }

