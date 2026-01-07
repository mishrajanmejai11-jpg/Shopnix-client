import axios from "axios";
import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import './admin.css'
import "./statemgt.css"

export default function StateMgt(){
    const [stid,setStid]=useState();
    const [stname,setStName]=useState();
    const [status,setStatus]=useState(false);
    const [stlist,setStList]=useState([]);
    // const [isupdatename,setUpdatename]=useState(false);
    // const [isupdatestatus,setUdatestatus]=useState(false);
    const [check,setCheck]=useState("");

    const handleStid=(e)=>{
        setStid(e.target.value);
    }
        const handleStname=(e)=>{
        setStName(e.target.value);
    }
        const handleActive=(e)=>{
         if (e.target.checked) {
          setStatus(true);
          setCheck("Active")
         } else {
         setStatus(false);
         setCheck("Inactive")
    }
    }
    const handleInactive=(e)=>{
          if (e.target.checked) {
          setStatus(false);
          setCheck("Inactive")
         } else {
         setStatus(true);
         setCheck("Active")
    }
  
    }
      const ShowBtn=()=>{
        axios.get("http://localhost:5511/state/getall").then((res)=>{
            setStList(res.data);
        }).catch((err)=>{
            toast.error(err);
        })
    }
      const handleChngeStatus=()=>{
        if(status===true){
            setStatus(false);
            ShowBtn();
        }
        if (status===false) {
            setStatus(true);
            ShowBtn();
        }
    }

    const addNewBtn=()=>{
        axios.get("http://localhost:5511/state/getall").then((res)=>{
            setStid(res.data.length+1);
            setStatus(true);
        }).catch((err)=>{
            alert(err);
        })
    }
    //(stid===""&&undefined||stname===""&&undefined||status===""&&undefined)

    const SaveBtn=()=>{
        const fields = { stid, stname, status };
        let fvalue=true;
        for (let key in fields) {
            if (!fields[key]) {
                toast.info(`${key} is required!`);
                fvalue=false
                return;
            }
        }
        if (fvalue===true) {
            axios.get("http://localhost:5511/state/searchbyname/"+stname).then((res)=>{
                if (res.data.stname!==undefined) {
                    toast.warning("State Name Already Exist");
                }else{
                    var obj={
                        stid:stid,
                        stname:stname,
                        status:status,
                    }
                    axios.post("http://localhost:5511/state/save/",obj).then((res)=>{
                        toast.success(res.data);
                        setStid('');
                        setStName('');
                        setStatus('');
                        ShowBtn();
                    }).catch((err)=>{
                        toast.error(err);
                    });
                }
            }).catch((err)=>{
                toast.error(err);
            });
        }

    }
  
    const SearchedBtn=()=>{
        if (stid!==undefined&& stid!=="") {
            axios.get("http://localhost:5511/state/search/"+stid).then((res)=>{
                if (res.data.stid!==undefined) {
                    setStid(res.data.stid);
                    setStName(res.data.stname);
                    setStatus(res.data.status);
                }else{
                    toast.warning("data not found");
                }
            }).catch((err)=>{toast.error(err)});
        }

        if (stname!==undefined&&stname!=='') {
            axios.get("http://localhost:5511/state/searchbyname/"+stname).then((res)=>{
                if (res.data.stid!==undefined) {
                    setStid(res.data.stid);
                    setStName(res.data.stname);
                    setStatus(res.data.status);
                }else{
                    toast.warning('Data not found');
                }
            }).catch((err)=>{
                toast.error(err);
            });
        }
    }

    const UpdateBtn=()=>{
          const fields = { stid, stname };
            let fvalue=true;
        for (let key in fields) {
            if (!fields[key]) {
                toast.info(`${key} is required!`);
                fvalue=false
                return;
            }
        }
        if (fvalue===true) {
            let obj={
                        stid:stid,
                        stname:stname,
                        status:status,
                    }
            axios.put('http://localhost:5511/state/update',obj).then((res)=>{
                toast.success(res.data);
                setStid('');
                setStName('');
                setStatus('');
                ShowBtn();
            }).catch((err)=>{
                toast.error(err);
            })
        }
    }

    const DeleteBtn=()=>{
        if (stid!==undefined&&stid!=="") {
            axios.delete('http://localhost:5511/state/delete/'+stid).then((res)=>{
                toast.success(res.data);
                ShowBtn();
            }).catch((err)=>{toast.error(err)});
        }else{
            toast.warning('Fill State Id to Delete');
        }
    }
    return(
        <div className="statemgt-container">
                 <ToastContainer  autoClose={1800}  toastClassName="center-toast" />
            <div className="stateform">
                <h3> State Mangement</h3>
                <div className="state-form"> 
                    <label >State ID <input className="stateform12" type="number" onChange={handleStid} value={stid}></input></label><br/>
                    <label >State Name <input className="stateform123" type="text" onChange={handleStname} value={stname}></input></label><br/>
                    <label>Active <input type="checkbox" checked={status===true} value={status} onChange={handleActive} /> </label>
                    <label>Inactive <input type="checkbox" checked={status===false} value={status} onChange={handleInactive} /> Status: <b> {check}</b> </label>
                    <div  className="btn-box-1">
                        <button className="btn-box" type="submit" onClick={addNewBtn}>NEW</button>
                        <button className="btn-box" type="submit" onClick={SaveBtn}>SAVE</button>
                        <button className="btn-box" type="submit" onClick={ShowBtn}>SHOW</button>
                        <button className="btn-box" type="submit" onClick={SearchedBtn}>SEARCH</button>
                        <button className="btn-box" type="submit" onClick={UpdateBtn}>UPDATE</button>
                        <button className="btn-box" type="submit" onClick={DeleteBtn}>DELETE</button>
                    </div>
                 </div>
            
            <div className="state-list">
                
                <h3> State List</h3>
                <center>
                <table>
                    
                    <thead >
                    <tr>
                        <th> State ID</th>
                        <th> State Name</th>
                        <th> Status</th>
                    </tr>
                    {
                        stlist.map((item)=>(
                            <tr>
                                <td>{item.stid}</td>
                                <td>{item.stname}</td>
                                <td>{item.status===true?<button className="btn-new" onClick={handleChngeStatus}>Active</button>:<button className="btn-new" onClick={handleChngeStatus}>Inactive</button>}</td>
                            </tr>
                        ))
                    }
                    </thead>
                   
                </table>
                 </center>
            </div>
        </div>
        </div>
    )
}