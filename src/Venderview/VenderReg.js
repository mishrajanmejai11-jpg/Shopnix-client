import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "./VenderReg.css";

export default function VenderReg(){
    const [vuserid,setVuserid]=useState('');
    const [vuserpass,setVuserpass]=useState('');
    const [vendername,setVendername]=useState('');
    const [vaddress,setVaddress]=useState('');
    const [vcontact,setVcontact]=useState('');
    const [vemail,setVEmail]=useState('');
    const [vpicname,setVpicname]=useState('');
    const [vid,setVid]=useState('');
    const [image,setImage]=useState({preview:"",data:""});
    const [status,setStatus]=useState(false);
    const [error,setError]=useState({});
    const [vendorList,setVenderList]=useState([]);
    const [isSuccess,setIsSuccess]=useState(false);
     const [stlist,setstList] =useState([]); 
    const [ctlist,setCtList] = useState([]);
     const [stid,setStId] = useState('');
    const [ctid,setctId]= useState("");
    const [vpincode,setVpincode]=useState('');
    const [vshopname,setVshopname]=useState('');

    useEffect(()=>{
        fetchVenderList();
                axios.get("http://localhost:5511/state/show").then((res)=> setstList(res.data)).catch((err)=> toast.error(err));
        
    },[]);
    const fetchVenderList= async()=>{
        try {
            const res=await axios.get('http://localhost:5511/vender/getallvender/');
            setVenderList(res.data);
            setVid(res.data.length+1);
        } catch (error) {
            toast.error(error);
        }
    }
     const handleIdselect=(e)=>{
        setStId(e.target.value);
        let stid=e.target.value;
        console.log('stid',stid)
        axios.get('http://localhost:5511/city/showcitybystate/'+stid).then((res)=>setCtList(res.data)).catch(err=> toast.error(err));
    }

    const Validateform=()=>{
        let temp={};
        let valid=true;
        if(!vuserid|| vuserid.length<5){
            temp.vuserid="User ID Must ba at least 5 character";
            valid=false;
        }else if (vendorList.some((v)=>v.vuserid===vuserid)) {
          temp.vuserid='User ID already exists';
          valid=false;
        } 
        if (!vuserpass||vuserpass.length<6) {
            temp.vuserpass="Password must be atleast 6 characters";
            valid=false;
        }
        if (!vendername.match(/^[A-Za-z ]+$/)) {
            temp.vendername='Vender Name must contaoins nly letter';
            valid=false;
        
        }
        if (!vaddress) {
            temp.vaddress="address is required";
            valid=false;
        }if (!vshopname) {
            temp.vshopname="Shop is required is required";
            valid=false;
        }
        if (!/^\d{10}$/.test(vcontact)) {
            temp.vcontact="Mobile Number must be 10 digits ";
            valid=false;
        }
        // if (!/^\5+@\5+\.\5+/.test(vemail)) {
        //     temp.vemail="Enter Valid E-mail address";
        //     valid=false;
        // }
        if (!/^\S+@\S+\.\S+$/.test(vemail)) {
    temp.vemail = "Enter Valid E-mail address";
    valid = false;
    }else if (vendorList.some(v=>v.Vemail===vemail)) {
            temp.vemail="Email already exists";
            valid=false;
        }console.log("valid",valid);
        if (!vpicname) {
            temp.vpicname="Please upload a profile photo";
            valid=false;
        }
       
        setError(temp);
        return valid;
    };

    const handleRegisterBtn=()=>{
        // alert('func strt');
        if (!Validateform()) return;
            // console.log("hello")
        const obj={
                Vuserid:vuserid,
                Vuserpass:vuserpass,
                VenderName:vendername,
                Vaddress:vaddress,
                Vcontact:vcontact,
                Vemail:vemail,
                Vpicname:vpicname,
                Vid:vid,
                Vstid:stid,
                Vctid:ctid,
                Vshopname:vshopname,
                Vpincode:vpincode,
                Status:false,
                  };
                  const formData=new FormData();
                  formData.append("Vuserid",vuserid);
                  formData.append("Vuserpass",vuserpass);
                  formData.append("VenderName",vendername);
                  formData.append("Vaddress",vaddress);
                  formData.append("Vcontact",vcontact);
                  formData.append("Vemail",vemail);
                  formData.append("Vid",vid);
                  formData.append("Vstid",stid);
                  formData.append("Vctid",ctid);
                  formData.append("Vshopname",vshopname);
                  formData.append("Vpincode",vpincode);
                  formData.append("Status",false);
                  formData.append("file",image.data)
                //   alert("rgisetr api call")
                  axios.post("http://localhost:5511/vender/register/",formData,{headers:{"Content-Type":"multipart/form-data"}}).then((res)=>{
                    toast.success(res.data);
                    fetchVenderList();
                  }).catch((err)=>{
                    toast.error(err);
                  })
    }
    const handleSubmit=async (e) => {
        e.preventDefault();
        if (!image.data) return;
        let formdata=new FormData();
        formdata.append('file',image.data);
        try {
            const res=await fetch("http://localhost:5511/vender/savevenderimage",{method:"POST",body:formdata,});
            if (res.data.message) {
                setStatus(true);
                toast.success("Image Upload Successfully");
                    setIsSuccess(true);
            }else{
                setStatus(false);
                toast.warning("Failed to upload file")
            }
        } catch (error) {
            toast.error(error);
        }
    };

    const handleFilechange= (e) => {
        const img={
            preview:URL.createObjectURL(e.target.files[0]),
            data:e.target.files[0],
        }
        setImage(img);
        // setVpicname(e.target.files[0].name);
    }

    return(<>
    <div className="vender-registration">
        <ToastContainer  autoClose={1800}  toastClassName="center-toast" />
        <div>
            <div className="vender-registration-form">
           {isSuccess&&<span className="vender_condition_img">{image.preview&&<img className="vender_header_photo" src={image.preview} alt="preview"></img>}</span>}
                    <h3><strong>Vender</strong> Registration Form</h3>
                       <ul className="vender_reg_form">
                         <label>Vender ID : <strong>{vid}</strong></label>
                        <label>User ID: <input required  type="text" onChange={(e)=>setVuserid(e.target.value)}></input><span>{error.vuserid}</span></label>
                        <label>Password: <input required type="password" onChange={(e)=>setVuserpass(e.target.value)}></input><span>{error.vuserpass}</span></label>
                        <label>Vender Name: <input  type="text" onChange={(e)=>setVendername(e.target.value)}></input><span>{error.vendername}</span></label>
                        <label>Shop Name: <input  type="text" onChange={(e)=>setVshopname(e.target.value)}></input><span>{error.vshopname}</span></label>
                        <label>Address: <input  type="text" onChange={(e)=>setVaddress(e.target.value)}></input><span>{error.vaddress}</span></label>
                        <label>Pincode : <input  type="number" onChange={(e)=>setVpincode(e.target.value)}></input></label>
                        <label>Contact Number: <input  type="number" onChange={(e)=>setVcontact(e.target.value)}></input><span>{error.vcontact}</span></label>
                        <label>State <select onChange={handleIdselect}>
                            <option>-----Select State----</option>
                            {stlist.map((item)=>(
                                <option key={item.stid} value={item.stid}>{item.stname}</option>
                            ))}
                            </select></label>
                            <label>City <select onChange={(e)=> setctId(e.target.value)}>
                                <option>----Select City----</option>
                                {ctlist.map((item)=>(
                                    <option key={item.ctid} value={item.ctid}>{item.ctname}</option>
                                ))}
                                </select></label>
                        <label>E-mail: <input required type="email" onChange={(e)=>setVEmail(e.target.value)}></input><span>{error.vcontact}</span></label>
                        <label>Upload Photo: <input name="file"  type="file" onChange={handleFilechange}></input>{image.preview&&<img className="vender_photo" src={image.preview} alt="preview"></img>}<span>{error.vpicname}</span></label>
                        <button className="vender-btn-upload" onClick={handleSubmit}>Upload</button>
                        <button className="vender-btn-register" onClick={handleRegisterBtn} type="submit">Register</button>
                       </ul>
               
            </div>
            <p> Have An Account? <Link to="/VenderLogin">Sign In</Link></p>
        </div>
    </div>
    </>
    )

}