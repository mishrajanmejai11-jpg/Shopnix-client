import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import './product.css';


export default function Product({data}){
    const venderid=data;
    const [pid,setPid]=useState();
    const [pname,setPname]=useState();
    const [pprice,setPrice]=useState();
    const [oprice,setOprice]=useState();
    const [ppicname,setPpicname]=useState();
    const [pcatgid,setPcatgid]=useState();
    const [pcatglist,setPcatglist]=useState([]);
    const [image,setImage]=useState({preview:"",data:""});
    const [plist,setPlist]=useState([]);
    const [isEditing,setEditing]=useState(false);
    const [status,setStatus]=useState(true);
    const [discount,setDiscount]=useState("");
    const [stock,setPstock]=useState('');

    //---fetch categories and next product id
    const url="http://localhost:5511/product";
    useEffect(()=>{
        getNewpid();
        axios.get("http://localhost:5511/productcatg/showproductcatg").then(res=> setPcatglist(res.data)).catch(err=> toast.error(err));
    },[]);
    useEffect(()=>{
        fetchProduct();
    },[]);
    //fetch vender product
    var fetchProduct=()=>{
        if (venderid) {
            axios.get(`${url}/showproductbyvender/${venderid}`).then((res)=> setPlist(res.data)).catch((err)=>{toast.error(err)});
         }
    }

    
    //getnew product
    var getNewpid=()=>{
        axios.get(`${url}/getmaxpid`).then(res=> setPid(res.data.length+1)).catch(err=> toast.error(err));
    }
    // image selection
    const handleFilechange=(e)=>{
        const file=e.target.files[0];
        if (file) {
            setImage({preview:URL.createObjectURL(file),data:file});
            setPpicname(file.name);
        }
    };
    // calculate the discount price
    const handleDiscount=()=>{
        const dis=discount;
        const price=pprice;
        let amount=parseFloat(dis/100)*price;
        let final=price-amount;
        setOprice(final);
    }
    //upload image
    const uploadImage=async (e) => {
        e.preventDefault();
        if (!image.data) {
            toast.warning("Select a file first");
            return;
        }
        const formData=new FormData();
        formData.append('file',image.data);
        try {
            const res=await fetch(`${url}/saveimages`,{method:"POST",body:formData});
            toast.success(res.ok?"file Ulpoaded Successfully":"upload failed please try again");
        } catch (error) {
            toast.error(error);
        }
    };
    //reset form
    const handleNewBtn=()=>{
        getNewpid(); setPname(''); setPrice(''); setOprice(''); setPpicname('');setPcatgid('');
        setImage({preview:"",data:""}); setEditing(false);
    }
    //create inventory func
    const Createinventory=()=>{
        let obj1={pid:pid,vid:venderid,stock}
                axios.post("http://localhost:5511/inventory/createinventory",obj1).then(res=> {toast.success(res.message);
                    console.log("inventory Api",res.message);
                }).catch(err=> console.log(err))
    }
    //save product and update product
    const handleSaveBtn=async()=>{
        const obj={pid,pname,pprice,oprice,ppicname,pcatgid,discount,vid:venderid,status:true};
        if (isEditing) {
            console.log('obj',obj);
            axios.put(`${url}/updateproduct/${pid}`,obj).then(()=>{toast.success("Product Updated")
                console.log('update api call')
                fetchProduct();
                handleNewBtn();
            }).catch((err)=>toast.error('Error',err));
        }else{
            // let obj1={pid:pid,vid:venderid}
            //     axios.post("http://localhost:5511/inventory/createinventory",obj1).then(res=>toast.success(res.message));
             const Obj={pid,pname,pprice,oprice,ppicname,pcatgid,discount,vid:venderid,status:false};
             const formData=new FormData();
             formData.append("pid",pid);
             formData.append("pname",pname);
             formData.append("pprice",pprice);
             formData.append("oprice",oprice);
             formData.append("pcatgid",pcatgid);
             formData.append("discount",discount);
             formData.append("vid",venderid);
             formData.append("status",false);
             formData.append("file",image.data);
            console.log("save api call ")
            axios.post(`${url}/saveproduct`,formData,{ headers: { "Content-Type": "multipart/form-data" }}).then(()=>{
                toast.success('Product Saved');
                fetchProduct();
                handleNewBtn();
                Createinventory();
                toast.success("Inventory created")
            }).catch((err)=>toast.error(err));
        }
    };
    //edit product

    const handleEditBtn=(item)=>{
        setPid(item.pid); setPname(item.pname); setPrice(item.pprice); setOprice(item.oprice);
        setPpicname(item.ppicname); setPcatgid(item.pcatgid);
        setImage({preview:`${url}/getimage/${item.ppicname}`,data:""});
        setEditing(true);
    };

    // soft delete product
    const handleDelete=(pid)=>{
        setStatus(false);
        if (!window.confirm("Are you want to inactive")) return;
        axios.put(`${url}/updateproductstatus/${pid}/${status}`).then((res)=>toast.info("Product is Inactive"+res.data)).catch(err=> toast.error(err));
    }

    return(
        <div className="Product-page">
        <ToastContainer  autoClose={1800}  toastClassName="center-toast" />
            <div className="product-form">
                <h2> Manage Product</h2>
                <div className="product-form-manage">
                    <h3>{isEditing?"Edit Product":"Add New Product"}</h3>
                    <div className="main-form">
                        <label>Product ID: <b>{pid}</b></label>
                        <input placeholder="Product Name" value={pname} type="text" onChange={e=>setPname(e.target.value)}></input>
                        <input placeholder="Product Stock" value={stock} type="number" onChange={e=>setPstock(e.target.value)}></input>
                        <input placeholder="Price" value={pprice} type="number" onChange={e=>setPrice(e.target.value)}></input>
                        <input placeholder="Discount" value={discount} type="number" onChange={e=>setDiscount(e.target.value)} onDoubleClick={handleDiscount}></input>
                        <input placeholder="Offer Price" value={oprice}type="number" ></input>
                        <select value={pcatgid} onChange={e=> setPcatgid(e.target.value)}>
                            <option value="">---Select Category---</option>
                            {pcatglist.map((cat)=>(<option key={cat.pcatgid} value={cat.pcatgid}>{cat.pcatgname}</option>))}
                        </select>
                        <input type="file" onChange={handleFilechange}></input>
                        {image.preview&& <img src={image.preview} alt={ppicname}></img>}
                        <button className="btn-update" onClick={uploadImage}>Upload Image</button>
                        <div>
                            <button className="btn-new" onClick={handleNewBtn}>Add New</button>
                            <button className={isEditing?"btn-update":"btn-save"} onClick={handleSaveBtn}>{isEditing?"Update":"Save"}</button>
                            </div>
                    </div>
                </div>
            </div>
            <div className="product-list">
                <h3>Product List</h3>
                <div className="product-table">
                    <table>
                        <thead>
                            <tr>
                                <th>SNO</th>
                                <th>PID</th>
                                <th>Product Name</th>
                                <th>Actual Price</th>
                                <th>Offer Price</th>
                                <th>Category</th>
                                <th>Discount</th>
                                <th>Photo</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plist.map((item,index)=>(
                                <tr key={item.pid}>
                                    <td>{index+1}</td>
                                    <td>{item.pid}</td>
                                    <td>{item.pname}</td>
                                    <td>{item.pprice}</td>
                                    <td>{item.oprice}</td>
                                    <td>{pcatglist.find(c=> c.pcatgid===item.pcatgid)?.pcatgname||"N/A"}</td>
                                    <td><img src={item.ppicname} alt={pname}></img></td>
                                    <td>{`${item.discount}%`}</td>
                                    <td>{(item.status?"Active":"Inactive")}</td>
                                    <td>
                                        <button className="btn-edit" onClick={()=> handleEditBtn(item)}>Edit</button>
                                        <button className="btn-delete" onClick={()=> handleDelete(item.pid)}>delete</button>
                                        </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}