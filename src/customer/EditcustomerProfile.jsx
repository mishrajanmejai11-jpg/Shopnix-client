import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "./editcustomerprofile.css";

export default function EditCustomerProfile({user,onClose,onUpdate}){
    const [formData,setFormData]=useState(null);
    const [newImage,setNewImage]=useState(null);
    const [previewImage,setPreviewImage]=useState(null);
    const [stList,setStList]=useState([]);
    const [ctList,setCtList]=useState([]);
    const [error,setError]=useState({});

    const apiurl=process.env.REACT_APP_API_URL;
    const url=`${apiurl}/customer/`

    useEffect(()=>{
        axios.get(`${url}getcustomerdetails/${user.Cid}`).then((res)=>{
            setFormData(res.data);
            if (res.data.Stid) {
                axios.get(`${apiurl}/city/showcitybystate/${res.data.Stid}`).then((ct)=>{
                    setCtList(ct.data)
                }).catch((err)=>toast.error(err));
            }
        }).catch(err=>toast.error(err));

        axios.get(`${apiurl}/state/show`).then((res)=>{
            setStList(res.data);
        }).catch(err=>toast.error(err));
    },[user.Cid]);

    if (!formData) {
        return <div>Loading...</div>;
    }

    // const fetchVenderList=async ()=>{
    //     try {
    //         const res=await axios.get(`${url}getallvender`);
    //         setVenderList(res.data);
    //     } catch (error) {
    //         toast.error("error fetchimg list",error);
    //     }
    // };
    // useEffect(()=>{
    //     setFormData(vender);
    //     fetchVenderList();
    // },[vender]);

    const handleChange=(e)=>{
        setFormData({...formData,[e.target.name]:e.target.value});
    //    console.log('name of evt',e.target.name);
        // console.log('value of evt',e.target.value);
    };

    const handleFilechange=(e)=>{
        const file=e.target.files[0];
        setNewImage(file);
        if (file) {
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleStatechange=(e)=>{
        const stid=Number(e.target.value);
        console.log(stid);
        setFormData({...formData,Stid:stid,Ctid:""});
        axios.get(`${apiurl}/city/showcitybystate/${stid}`).then((res)=>{setCtList(res.data); console.log(res.data)}).catch(err=> toast.error(err));

    };

    //validate form
    const validateForm=()=>{
        const errs={};
        if(!formData.Customername?.trim()) errs.Customername="FullName is required";
        if(!formData.Stid) errs.Stid="State is required";
        if(!formData.Ctid) errs.Ctid="City is required";
        if(!formData.Caddress?.trim()) errs.Caddress="Address is required";
        if(!formData.Cemail?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.Cemail="Valid Email is required";
        setError(errs);
        return Object.keys(errs).length===0;
    }

    // const checkEmailDuplicate=()=>{
    //     return venderList.some((v)=> v.Vemail=== formData.Vemail&& v.Vuserid !== formData.Vuserid)
    // };

    const handleSubmit= async () => {
        if (!validateForm()) return;
        // if (checkEmailDuplicate()) {
        //     toast.warning("This Email is already used another vender");
        //     return;
        // }
        try {
            const form= new FormData();
            form.append("Customername",formData.Customername);
            form.append("Caddress",formData.Caddress);
            form.append("Ccontact",formData.Ccontact);
            form.append("Cemail",formData.Cemail);
            form.append("Cuserid",formData.Cuserid);
            form.append("Stid",formData.Stid);
            form.append("Ctid",formData.Ctid);
            if (newImage) {
                form.append("file",newImage);
            }
                // console.log(form.get("Customername"));
            const res=await axios.put(`${url}update/${user.Cid}`,form,{headers:{"Content-Type":"multipart/form-data"}});
            toast.success(res.data.message);
            const updateUser=res.data.customer;
            // update info in localstorage 
            const storage=localStorage.getItem("Usersession")!==null?localStorage:sessionStorage;
            storage.setItem("Usersession", JSON.stringify(updateUser));
            onUpdate(updateUser);
            onClose();
        } catch (error) {
            toast.error(error);
        }
    };
    return(
    <div className="customer_editprofile_container">
         <ToastContainer  autoClose={1800}  toastClassName="center-toast" />
         <div className="editprfoilr_form_container">
            <h2>Edit Customer Profile</h2>
            <label>Customer Name: </label><input type="text" name="Customername" value={formData.Customername||""} onChange={handleChange} placeholder="Customer Name"></input>{error.Customername&& <p>{error.Customername}</p>}<br/>
           <label>State: </label> <select name="stid" value={formData.Stid||""} onChange={handleStatechange}>
                <option value="">---Select State---</option>
                {stList.map((item)=>(
                    <option key={item.stid} value={item.stid}>{item.stname}</option>
                ))}
            </select>{error.Stid&&<p>{error.Stid}</p>}<br/>
            <label>City: </label><select name="ctid" value={formData.Ctid||""} onChange={(e)=>setFormData({...formData,Ctid:e.target.value})}>
                <option value="">---Select City---</option>
                {ctList.map((c)=>(
                    <option key={c.ctid} value={c.ctid}>{c.ctname}</option>
                ))}
            </select>{error.ctid&&<p>{error.ctid}</p>}<br/>
            <label>Customer Address: </label><input type="text" name="Caddress" value={formData.Caddress||""} onChange={handleChange} placeholder="Address"></input>{error.Caddress&&<p>{error.Caddress}</p>}<br/>
           <label>Contact: </label> <input type="number" name="Ccontact" value={formData.Ccontact||""} onChange={handleChange} placeholder="Contact"></input>{error.Ccontact&&<p>{error.Ccontact}</p>}<br/>
           <label> E-Mail: </label> <input type="email" name="Cemail" value={formData.Cemail||""} onChange={handleChange} placeholder="E-mail"></input>{error.Cemail&&<p>{error.Cemail}</p>}<br/>
            <p>Current Image: {formData.Cpicname}</p>
            {formData.Cpicname&&(<img src={formData.Cpicname}alt="Customer" height={150} width={150}></img>)}
            {previewImage&&(<><p>New Image Preview</p><img src={previewImage} alt="preview" height={150} width={150}></img>
            </>)}
            <input type="file" onChange={handleFilechange}></input>
            <button  onClick={handleSubmit}>Save</button>
            <button  onClick={onClose}>Cancel</button>
         </div>
    </div>
    )
}