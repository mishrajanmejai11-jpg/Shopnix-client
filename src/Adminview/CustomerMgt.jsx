import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField, Avatar, Box, Typography, MenuItem, Select,
    InputLabel, FormControl, CircularProgress,} from "@mui/material";

export default function CustomerMgt(){
    const [customerList,setCustomerList]=useState([]);
    const [selectedCustomer, setSelectefCustomer]=useState(null);
    const [openProfile,setOpenProfile]=useState(false);
    const [formData,setFormData]=useState({});
    const [previewImage,setPreviewImage]=useState(null);
    const [states,setStates]=useState([]);
    const [cities,setCities]=useState([]);
    const [confirmDialog,setConfirmDialog]=useState({open:false,cid:null,currentStatus:""});
    const [loading,setLoading]=useState(false);

        const url=process.env.REACT_APP_API_URL;


    //fetch customer and status
    useEffect(()=>{
        axios.get(`${url}/customer/getcustomer`).then((res)=>setCustomerList(res.data)).catch((err)=>toast.error(err));
        axios.get(`${url}/state/show`).then((res)=>setStates(res.data)).catch(err=>toast.error(err));
    },[customerList]);

    //open profile model
    const handleViewProfile=(cid)=>{
        axios.get(`${url}/customer/getcustomerdetails/${cid}`).then((res)=>{
            setSelectefCustomer(res.data);
            setFormData(res.data);
            setPreviewImage(res.data.Cpicname);
            if (res.data.Stid) {
                fetchCitiesByState(res.data.Stid);
                setOpenProfile(true);
            }
        }).catch(err=> toast.error(err));
    };

    const fetchCitiesByState=(stid)=>{
        axios.get(`${url}/city/showcitybystate/${stid}`).then((res)=>setCities(res.data)).catch(err=> toast.error(err));
    };
    //handle form input change

    const handleChange=(e)=>{
        const {name,value}=e.target;
        setFormData((prev)=>({...prev,[name]:value}));
        if (name==="Stid") {
            setFormData((prev)=>({...prev, Ctid:""}));
            fetchCitiesByState(value);
        }
    };

    // handle file input
    const handleFileChange=(e)=>{
        const file=e.target.files[0];
        setFormData((pre)=>({...pre,Cpicfile:file}));
        if (file) {
            const reader= new FileReader();
            reader.onload=()=>setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    // save profile with spinner
    const handleSaveProfile=async () => {
        const data=new FormData();
        data.append("Customername", formData.Customername);
        data.append("Caddress",formData.Caddress);
        data.append("Ccontact",formData.Ccontact);
        data.append("Cemail",formData.Cemail);
        data.append("Cuserid",formData.Cuserid);
        data.append("Stid",formData.Stid);
        data.append("Ctid",formData.Ctid);
        if (formData.Cpicfile) {
            data.append("Cpicfile",formData.Cpicfile);
        }
        try {
            setLoading(true);//start spinner
            const res=await axios.put(`${url}/customer/update/${selectedCustomer.Cid}`,data,{headers:{"Content-Type":"multipart/form-data"}});
            toast.success("Profile updated Successfully");
            setCustomerList((prev)=> prev.map((c)=> c.Cid===selectedCustomer.Cid?res.data.customer:c));
            setOpenProfile(false);
        } catch (error) {
            toast.error(error);
            const msg=error.response?.data?.message || (typeof error.response?.data==="string"?error.response.data:"Server error");
            toast.warning(`${msg}`);
        }finally{
            setLoading(false)
        }
    };

    const handleToggleStatusClick=(cid,currentStatus)=>{
        setConfirmDialog({open:true,cid,currentStatus});
    };

    const handleConfirmToggle=()=>{
        const {cid,currentStatus}=confirmDialog;
        const newStatus=currentStatus===true?false:true;
        setCustomerList((prev)=> prev.map((c)=>(c.Cid===cid?{...c,status:newStatus}:c)));

        axios.get(`${url}/customer/getcustomerdetails/${cid}`).then((res)=>{ 
            // const email=res.data.Cemail;
        axios.put(`${url}/customer/customermanage/${cid}/${newStatus}`).then((res)=>{
            // const subject=newStatus===true?"Login Activation":"Login Deactivation";
            // const message=newStatus===true?"Your ID is Activated by Admin. You can login Now": "Your ID is Inactivated by Admin. You Cannot Login";
        // axios.post(`${url}/emailactivation/sendemails/${email}/${subject}/${message}`); 
            
        }).catch(err=> toast.error(err));
            
        }).catch(err=> toast.error(err));
        setConfirmDialog({open:false,cid:null,currentStatus:""});
    };
     return(
            <Box sx={{padding:3, position:"relative"}}>
                <Typography variant="h4" gutterBottom>Customer Management</Typography>
    
                {/* Spinner OverLay */}
                {loading && (
                    <Box sx={{position:"absolute", top:0, left:0, width:"100%", height:"100%",
                        background:"rgba(255,255,255,0.6)", zIndex:1000, display:"flex", 
                        justifyContent:"center", alignContent:"center",
                    }}>
                        <CircularProgress size={60}/>
                    </Box>
                )}
    
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Customer Id</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Profile</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {customerList.map((cust)=>(
                                <TableRow key={cust.Cid}>
                                    <TableCell>{cust.Cid}</TableCell>
                                    <TableCell>{cust.Customername}</TableCell>
                                    <TableCell>
                                        <Button variant={cust.Status===true ? "contained":"outlined"}
                                        color={cust.Status===true ? "success":"error"}
                                        onClick={()=> handleToggleStatusClick(cust.Cid, cust.Status)}>
                                            {cust.Status===true?"Active":"InActive"}
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="outlined" onClick={()=> handleViewProfile(cust.Cid)}>
                                            View/Edit
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
    
                {/* Profile Modal */}
                <Dialog open={openProfile} onClose={()=> setOpenProfile(false)}>
                    <DialogTitle>Customer Profile</DialogTitle>
                    <DialogContent>
                        <TextField label="Name" name="CustomerName" value={formData.Customername || ""}
                        onChange={handleChange} fullWidth margin="normal"/>
                        <TextField label="Email" name="CEmail" value={formData.Cemail || ""}
                        onChange={handleChange} fullWidth margin="normal"/>
                        <TextField label="Address" name="CAddress" value={formData.Caddress || ""}
                        onChange={handleChange} fullWidth margin="normal"/>
                        <TextField label="Contact" name="CContact" value={formData.Ccontact || ""}
                        onChange={handleChange} fullWidth margin="normal"/>
    
                        {/* State Dropdown */}
                        <FormControl fullWidth margin="normal">
                            <InputLabel>State</InputLabel>
                            <Select name="StId" value={formData.Stid || ""} onChange={handleChange}
                            label="State">
                                {states.map((st)=>(
                                    <MenuItem key={st.stid} value={st.stid}>{st.stname}</MenuItem>
                                ))}</Select>
                        </FormControl>
    
                        {/* City Dropdown */}
                        <FormControl fullWidth margin="normal">
                            <InputLabel>City</InputLabel>
                            <Select name="Ctid" value={formData.Ctid || ""} onChange={handleChange}
                            label="City">
                                {cities.map((ct)=>(
                                    <MenuItem key={ct.ctid} value={ct.ctid}>{ct.ctname}</MenuItem>
                                ))}</Select>
                        </FormControl>
    
                        {/* Profile Image */}
                        <Box sx={{mt:2, mb:2, display:"flex", alignItems:"center", gap:2}}>
                            {previewImage && <Avatar src={previewImage} sx={{width:80, height:80}}/>}
                            <input type="file" onChange={handleFileChange}/>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={()=> setOpenProfile(false)}>Cancel</Button>
                        <Button onClick={handleSaveProfile} variant="contained">Save</Button>
                    </DialogActions>
                </Dialog>
    
                {/* Confirm Dialog */}
                <Dialog open={confirmDialog.open} onClose={()=>
                    setConfirmDialog({open:false, cid:null, currentStatus:""})
                }>
                    <DialogTitle>Confirm Status Change</DialogTitle>
                    <DialogContent>Are you sure you want to{" "}
                        {confirmDialog.currentStatus==="Active" ? "deactive":"active"}{" "} this customer?
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={()=> setConfirmDialog({open:false, cid:null, currentStatus:""})}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmToggle} variant="contained">Yes</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        );
}