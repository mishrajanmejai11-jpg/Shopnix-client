import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "./editvenderprofile.css";

export default function EditVenderProfile({vender,onClose,onUpdate}){
    const [formData,setFormData]=useState(vender);
    const [newImage,setNewImage]=useState(null);
    const [previewImage,setPreviewImage]=useState(null);
    const [venderList,setVenderList]=useState([]);

    const apiurl=process.env.REACT_APP_API_URL;
    const url=`${apiurl}/vender/`;

    const fetchVenderList=async ()=>{
        try {
            const res=await axios.get(`${url}getallvender`);
            setVenderList(res.data);
        } catch (error) {
            toast.error("error fetchimg list",error);
        }
    };
    useEffect(()=>{
        setFormData(vender);
        fetchVenderList();
    },[vender]);

    const handleChange=(e)=>{
        setFormData({...formData,[e.target.name]:e.target.value});
    };

    const handleFilechange=(e)=>{
        const file=e.target.files[0];
        setNewImage(file);
        if (file) {
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const checkEmailDuplicate=()=>{
        return venderList.some((v)=> v.Vemail=== formData.Vemail&& v.Vuserid !== formData.Vuserid)
    };

    const handleSubmit= async () => {
        if (checkEmailDuplicate()) {
            toast.warning("This Email is already used another vender");
            return;
        }
        try {
            const form= new FormData();
            form.append("VenderName",formData.VenderName);
            form.append("Vaddress",formData.Vaddress);
            form.append("Vcontact",formData.Vcontact);
            form.append("Vemail",formData.Vemail);
            if (newImage) {
                form.append("file",newImage);
            }

            const res=await axios.put(`${apiurl}update/${formData.Vuserid}`,form,{headers:{"Content-Type":"multipart/form-data"}});
            toast.success(res.data.message);
            onUpdate({...formData,...res.data.updateData});
            setTimeout(() => {
             onClose();
            }, 5000);
        } catch (error) {
            toast.error(error);
        }
    };
    return(
    <div className="vender_editprofile_container">
         <ToastContainer  autoClose={1800}  toastClassName="center-toast" />
         <div>
            <h2>Edit Vender Profile</h2>
            <input type="text" name="VenderName" value={formData.VenderName||""} onChange={handleChange} placeholder="Vender Name"></input>
            <input type="text" name="Vaddress" value={formData.Vaddress||""} onChange={handleChange} placeholder="Address"></input>
            <input type="number" name="Vcontact" value={formData.Vcontact||""} onChange={handleChange} placeholder="Contact"></input>
            <input type="email" name="Vemail" value={formData.Vemail||""} onChange={handleChange} placeholder="E-mail"></input>
            <p>Current Image: {formData.Vpicname}</p>
            {formData.Vpicname&&(<img src={formData.Vpicname} alt="Vender" height={150} width={150}></img>)}
            {previewImage&&(<><p>New Image Preview</p><img src={previewImage} alt="preview" height={150} width={150}></img>
            </>)}
            <input type="file" onChange={handleFilechange}></input>
            <button  onClick={handleSubmit}>Save</button>
            <button  onClick={onClose}>Cancel</button>
         </div>
    </div>
    )
}