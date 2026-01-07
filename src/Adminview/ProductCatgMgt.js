import axios from "axios";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./productcatg.css";

// import './admin.css'

export default function ProductCatgMgt(){
    const [pcatgid,setPcatgid]=useState(0);
    const [pcatgname,setPcatgname]=useState('');
    const [pcatgList,setPcatgList]=useState([]);
    const [isEditMode,setIsEditMode]=useState(false);

        const url=process.env.REACT_APP_API_URL;

    // useEffect(()=>{
    //     fetchCategoryList();
    // },[]);
    const fetchCategoryList=()=>{
        axios.get(`${url}/productcatg/showproductcatg`).then((res)=>{
            setPcatgList(res.data);
            if (!isEditMode) {
                setPcatgid(res.data.length+1);
            }
        }).catch((err)=>{alert(err)})
    };
    useEffect(()=>{
        fetchCategoryList();
    },[]);
    const handleSaveBtn=()=>{
        if (!pcatgname.trim()) {
            toast.info('Category Name Cannot be Empty');
            return;
        }
        axios.post(`${url}/productcatg/addproductcatg/${pcatgid}/${pcatgname}`).then((res)=>{
            toast.success(res.data);
            setPcatgname('');
            setIsEditMode(false);
            fetchCategoryList();
        }).catch((err)=>{alert(err)});
    }

    const handleUpdateBtn=()=>{
        if (!pcatgname.trim()) {
            toast.warning('category name cannot be empty');
            return;
        }
        axios.put(`${url}/productcatg/updateproductcatg/${pcatgid}/${pcatgname}`).then((res)=>{
            toast.success(res.data);
            setPcatgname('');
            setIsEditMode(false);
            fetchCategoryList();
        }).catch((err)=>{alert(err)});
    }

    const handleEditBtn=(item)=>{
        setPcatgid(item.pcatgid);
        setPcatgname(item.pcatgname);
        setIsEditMode(true);
    };
    return(
        <div className="product-container">
             <ToastContainer  autoClose={1800}  toastClassName="center-toast" />
            <div className="productform">
            <h2>Product Category Form</h2>
            <span>Product Id {pcatgid}</span><br/>
            <span> Category Name <input className="productform12" type="text" required value={pcatgname} onChange={(e)=>setPcatgname(e.target.value)}></input></span> 
           
            <div className="btn-box-1">
                <p>{ isEditMode ? (<button className="btn-box-dev" onClick={handleUpdateBtn}>Update</button>):(<button className="btn-box-dev" onClick={handleSaveBtn}>Save</button>)}</p>
                <button className="btn-box-dev" onClick={fetchCategoryList}>Show</button>
            </div>
            <h3>Product Category List</h3>
            {/* <div className="product-list"> */}
            <center>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Category Name</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pcatgList.map((item)=>(
                            <tr key={item.pcatgid}>
                                <td>{item.pcatgid}</td>
                                <td>{item.pcatgname}</td>
                                <td><button className="jai_ram" onClick={()=>handleEditBtn(item)}>Edit</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </center>
            {/* </div> */}
             </div>
        </div>
    )
}