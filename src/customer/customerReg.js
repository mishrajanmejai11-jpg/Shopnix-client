import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
// import ReactDom from "react-dom/client";
import { Link } from "react-router-dom";
import "./customerReg.css";



export default function CustomerReg(){
    const [cuserid,setCUserId] = useState(""); 
    const [cuserpass, setCUserpass] =useState("");
    const [customername,setCustomerName] =useState("");
    const [stid,setStId] = useState('');
    const [ctid,setctId]= useState("");
    const [caddress,setCAddress]= useState('');
    const [ccontact,setCContact] = useState("");
    const [cemail,setCEmail] = useState("");
    const [cpicname,setCPicName]= useState();
    const [cid, setCId]= useState("");
    const [image, setImage]= useState ( {preview:'' ,data: ''});
    const [status, setstatus] = useState();
    const [stlist,setstList] =useState([]); 
    const [ctlist,setCtList] = useState([]);
    const [errors,setErrors] = useState({});
    const [customerList,setCustomer]=useState([]);
    const url=process.env.REACT_APP_API_URL;
    const Apiurl=`${url}/customer/`;

    useEffect(()=>{
        axios.get(`${Apiurl}getcustomer`).then((res)=>{
            setCustomer(res.data);
                 setCId(res.data.length+1);

        }).catch((err)=> toast.error(err));

        axios.get(`${url}/state/show`).then((res)=> setstList(res.data)).catch((err)=> toast.error(err));
    },[]);
        const handleClearform=()=>{
            setCUserId('');
            setCUserpass('');
            setCustomerName('');
            setStId('');
            setctId('');
            setCAddress('');
            setCEmail('');
            setCContact('');
            setCPicName('');
        }
    const handleIdselect=(e)=>{
        setStId(e.target.value);
        let stid=e.target.value;
        console.log('stid',stid)
        axios.get(`${url}/city/showcitybystate/`+stid).then((res)=>setCtList(res.data)).catch(err=> toast.error(err));
    }

     const Validateform=()=>{
        let temp={};
        let valid=true;
        if(!cuserid|| cuserid.length<5){
            temp.cuserid="User ID Must ba at least 5 character";
            valid=false;
        }else if (customerList.some((v)=>v.Cuserid===cuserid)) {
          temp.cuserid='User ID already exists';
          valid=false;
        } 
        if (!cuserpass||cuserpass.length<6) {
            temp.cuserpass="Password must be atleast 6 characters";
            valid=false;
        }
        if (!customername.match(/^[A-Za-z ]+$/)) {
            temp.customername='Customer Name must contaoins only letter';
            valid=false;
        
        }
        if (!caddress) {
            temp.caddress="address is required";
            valid=false;
        }if (!/^\d{10}$/.test(ccontact)) {
            temp.ccontact="Mobile Number must be 10 digits ";
            valid=false;
        }
        // if (!/^\5+@\5+\.\5+/.test(vemail)) {
        //     temp.vemail="Enter Valid E-mail address";
        //     valid=false;
        // }
        if (!/^\S+@\S+\.\S+$/.test(cemail)) {
    temp.cemail = "Enter Valid E-mail address";
    valid = false;
    }else if (customerList.some(v=>v.Cemail===cemail)) {
            temp.cemail="Email already exists";
            valid=false;
        }console.log("valid",valid);
        // if (!cpicname) {
        //     temp.cpicname="Please upload a profile photo";
        //     valid=false;
        // }
        if (!image.data) {
  temp.cpicname = "Please upload a profile photo";
  valid = false;
}

       
        setErrors(temp);
        return valid;
    };

    const handleRegisterBtn=async (e) => {
    e.preventDefault();
    if(!Validateform())return ;
    
    // let obj={
    //     Cuserid:cuserid,
    //     Cuserpass:cuserpass,
    //     Customername:customername,
    //     Stid:stid,
    //     Ctid:ctid,
    //     Caddress:caddress,
    //     Ccontact:ccontact,
    //     Cemail:cemail,
    //     Cpicname:cpicname,
    //     Cid:cid,
    //     Status:false,
    // };

    // let formData= new FormData();
    // formData.append('file',image.data);
    // const res= await fetch(`${Apiurl}saveimage`,{method:"POST",body:formData,});
    // if (res.ok) {
    //     toast.success("file uploaded successfully");
    //     setstatus("file uploaded successfully")
    // }else{
    //     toast.warning("File Uploading Error");
    //     setstatus("File Uploading Error");
    // }

    let formData = new FormData();

formData.append("Cuserid", cuserid);
formData.append("Cuserpass", cuserpass);
formData.append("Customername", customername);
formData.append("Stid", stid);
formData.append("Ctid", ctid);
formData.append("Caddress", caddress);
formData.append("Ccontact", ccontact);
formData.append("Cemail", cemail);
formData.append("Cid", cid);
formData.append("Status", false);

// 🔥 MOST IMPORTANT
formData.append("file", image.data);

axios.post(`${Apiurl}register`, formData, {
  headers: { "Content-Type": "multipart/form-data" }
})
.then(res => toast.success(res.data.message)).catch(err => {
  console.log("AXIOS ERROR 👉", err.response?.data);
  toast.error(err.response?.data?.message || "Registration failed");
});

// .catch(err => toast.error("Registration failed"));


    // axios.post(`${Apiurl}register`,obj).then((res)=>{toast.success(res.data.message)}).catch((err)=>{
    //     if (err.response && err.response.data && err.response.data.message) {
    //         toast.warning(err.response.data.mesaage);
    //     }else{
    //         toast.error("something went wrong");
    //     }

    // });
    handleClearform();
    }

    // const handleFilechange=(e)=>{
    //     const img={
    //         preview:URL.createObjectURL(e.target.files[0]),
    //         data:e.target.files[0]
    //     };
    //     setImage(img);
    //     setCPicName(e.target.files[0].name);
    // }

    const handleFilechange = (e) => {
  const file = e.target.files[0];
  setImage({
    preview: URL.createObjectURL(file),
    data: file
  });
};


    return(
        <div className="customer-register">
                    <ToastContainer  autoClose={1800}  toastClassName="center-toast" />
            <div className="customer-register-page">
                <div className="customer-register-container">
                    <h2> Customer Registration Form</h2>
                    <p id="status">{status}</p>
                    <form className="customer-registr-form" onSubmit={handleRegisterBtn}>
                        <label>Customer ID <span>{cid}</span></label>
                        <label>User ID <input type="text" onChange={(e)=> setCUserId(e.target.value)} placeholder="User Id Must be more than 5 character"></input>{errors.cuserid}</label>
                        <label>Password <input type="password" onChange={(e)=> setCUserpass(e.target.value)} placeholder="User password Must be more than 6 character"></input>{errors.cuserpass}</label>
                        <label>Customer Name <input type="text" onChange={(e)=> setCustomerName(e.target.value)} placeholder="Customer Name Must be text only"></input>{errors.customername}</label>
                        <label>State <select onChange={handleIdselect}>
                            <option>-----Select State----</option>
                            {stlist.map((item)=>(
                                <option key={item.stid} value={item.stid}>{item.stname}</option>
                            ))}
                            </select>{errors.stid}</label>
                            <label>City <select onChange={(e)=> setctId(e.target.value)}>
                                <option>----Select City----</option>
                                {ctlist.map((item)=>(
                                    <option key={item.ctid} value={item.ctid}>{item.ctname}</option>
                                ))}
                                </select>{errors.ctid}</label>
                        <label>Address <input type="text" onChange={(e)=> setCAddress(e.target.value)} placeholder="Address Must be filled "></input>{errors.caddress}</label>
                        <label>Contact <input type="number" onChange={(e)=> setCContact(e.target.value)} placeholder="Contact Number Should With Country Code"></input>{errors.ccontact}</label>
                        <label>Email <input type="email" onChange={(e)=> setCEmail(e.target.value)} placeholder="Email Should be Valid Email Address"></input>{errors.cemail}</label>
                        <label>Select photo <input type="file" onChange={handleFilechange} ></input>{image.preview&&<img alt="images" src={image.preview} height={150} width={150}></img>}{errors.cpicname}</label>
                        <button type="submit" className="btn-register">Register</button>
                        <p>Already User?<Link to="/Customerlogin">SignIn</Link></p>
                    </form>
                </div>
            </div>
        </div>
    )
}