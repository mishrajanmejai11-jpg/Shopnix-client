import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "./citymgt.css"


export default function CityMgt(){
    const [ctid,setCtid]=useState();
    const [ctname,setCtname]=useState();
    const [stid,setStid]=useState();
    const [status,setStatus]=useState(false);
    const [ctlist,setCtList]=useState([]);
    const [stlist,setSlist]=useState([]);
        const [check,setCheck]=useState("");
    

    var statename="";
    const handleCtid=(e)=>{
        setCtid(e.target.value);
    }
    const handleCtname=(e)=>{
        setCtname(e.target.value);
    }
    const handleStid=(e)=>{
        setStid(e.target.value);
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
    // const handleStatus=(e)=>{
    //     setStatus(e.target.value);
    // }

    useEffect( () => {
        axios.get('http://localhost:5511/state/show').then((res)=>{
            setSlist(res.data);
        }).catch((err)=>{
            toast.error(err);
        })
    })
         const handleShowBtn= async () => {
        await axios.get("http://localhost:5511/city/getall").then((res)=>{
            setCtList(res.data);
        }).catch((err)=>{
            toast.error(err);
        });
    }
    const addNewBtn=async () => {
        await axios.get('http://localhost:5511/city/getall').then((res)=>{
            setCtid(res.data.length+1);
            setStatus(true);
        }).catch((err)=>{
            toast.error(err);
        })
    }

    const handleSaveBtn= async () => {
       const fields={ctid,ctname,status};
       let fvalue=true;
       for(let key in fields){
        if (!fields[key]) {
            fvalue=false;
            toast.info(`${key } is required`);
            return;
        }
       }

       if (fvalue===true) {
          await axios.get('http://localhost:5511/city/searchbyname/'+ctname).then((res)=>{
            if (res.data.ctname!==undefined) {
                toast.warning('City Name Already Exist');
            }else{
                var obj={
                    ctid:ctid,
                    ctname:ctname,
                    stid:stid,
                    status:status
                }
                 axios.post("http://localhost:5511/city/save/",obj).then((res)=>{
                    toast.success(res.data);
                    setCtid('');
                    setCtname('');
                    setStid('');
                    setStatus('');
                    handleShowBtn();
                 }).catch((err)=>{
                    toast.error(err);
                 })
            }
          }).catch((err)=>{
            toast.error(err);
          })
       }
    }

   

    const handleSearchBtn= async () => {
        if (ctid!==undefined&&ctid!=="") {
        await  axios.get('http://localhost:5511/city/search/'+ctid).then((res)=>{
            if (res.data.stid!==undefined) {
                setCtid(res.data.ctid);
                setCtname(res.data.ctname);
                setStid(res.data.stid);
                setStatus(res.data.status);
            }else{
                toast.warning('Data Not Found');
            }
        }).catch((err)=>{
            toast.error(err);
        });
        }
        if (ctname!==undefined&& ctname!=="") {
            axios.get("http://localhost:5511/city/searchbyname/"+ctname).then((res)=>{
                if (res.data.stid!==undefined) {
                    setCtid(res.data.ctid);
                    setCtname(res.data.ctname);
                    setStid(res.data.setStid);
                    setStatus(res.data.status);
                }else{
                    toast.warning("Data not Found");
                }
            }).catch((err)=>{
                toast.error(err);
            });
        }
    }

    const handleUpdateBtn= async () => {
         const fields={ctid,ctname,stid};
       let fvalue=true;
       for(let key in fields){
        if (!fields[key]) {
            fvalue=false;
            toast.info(`${key } is required`);
            return;
        }
       }

       if (fvalue===true) {
             var obj={
                    ctid:ctid,
                    ctname:ctname,
                    stid:stid,
                    status:status
                }
                await axios.put("http://localhost:5511/city/update/",obj).then((res)=>{
                    toast.success(res.data);
                    setCtid('');
                    setCtname('');
                    setStid('');
                    setStatus('');
                    handleShowBtn();
                 }).catch((err)=>{
                    toast.error(err);
                 })
       }
        
    }

    const handleDeleteBtn=()=>{
        if (ctid!==undefined&&ctid!=="") {
            axios.delete("http://localhost:5511/city/delete/"+ctid).then((res)=>{
                toast.success(res.data);
            }).catch((err)=>{
                toast.error(err)
            });
        }else{
            toast.warning("Fill State Id to delete");
        }
    }
    return(
        <div className="citymgt-containe">
                <ToastContainer  autoClose={1800}  toastClassName="center-toast" />
            <div className="cityform">
                <center>
                <h3> City Mangement</h3>
                <div className="city-form"> </div>
                <label> City ID <input className="cityform12" type="number" value={ctid} onChange={handleCtid}></input></label><br/>
                <label> City Name <input className="cityform123" type="text" value={ctname} onChange={handleCtname}></input></label><br/>
                <label> State Name <select className="cityform123" onClick={handleStid} name="stateddl" >
                    <option>Select State</option>
                    {
                    stlist.map((item)=>(
                        <option value={item.stid} key={item.stid}>{item.stname}</option>
                    ))
                    }
                    </select></label><br/>
                     <label>Active <input type="checkbox" checked={status===true} value={status} onChange={handleActive} /> </label>
                    <label>Inactive <input type="checkbox" checked={status===false} value={status} onChange={handleInactive} /> Status: {check} </label>
                      <div className="btn-box-1">
                        <button className="btn-box"  type="submit" onClick={addNewBtn}>NEW</button>
                        <button className="btn-box" type="submit" onClick={handleSaveBtn}>SAVE</button>
                        <button className="btn-box" type="submit" onClick={handleShowBtn}>SHOW</button>
                        <button className="btn-box" type="submit" onClick={handleSearchBtn}>SEARCH</button>
                        <button className="btn-box" type="submit" onClick={handleUpdateBtn}>UPDATE</button>
                        <button className="btn-box" type="submit" onClick={handleDeleteBtn}>DELETE</button>
                    </div>
                </center>
            
              <div className="city-list">
                <center>
                <h3> State List</h3>
                <table>
                    <thead >
                    <tr>
                        <th> City ID</th>
                        <th> City Name</th>
                        <th> State Name</th>
                        <th> Status</th>
                    </tr>
                    {
                        ctlist.map((item)=>(
                            <tr>
                                <td>{item.ctid}</td>
                                <td>{item.ctname}</td>
                                <td>{
                                    stlist.map((sitem)=>{
                                        if (item.stid===sitem.stid) {
                                            statename=sitem.stname;
                                        }
                                    })
                                    }{statename}</td>
                                <td>{item.status===true?<h3>Active</h3>:<h3>Inactive</h3>}</td>
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