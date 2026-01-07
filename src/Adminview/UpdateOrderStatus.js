import React,{useState,useEffect} from "react";
import axios from "axios";
import { toast } from "react-toastify";

   const STATUS_FLOW = [
     "Processing",
     "Order Placed",
     "Packed",
     "Shipped",
     "Out for Delivery",
     "Delivered",
     "Cancelled"
   ];

   function UpdateOrderStatus({updateByName})
   {
      const [billIds,setBillIds] = useState([]);
      const [billid,setBillid] = useState("");
      const [status,setStatus] = useState("");
      const [currentStatus,setCurrentStatus] = useState("");
      const [updatedAt,setUpdatedAt] = useState(null);
      const [updatedBy,setupdatedBy] = useState("");

      // LOAD ALL BILL IDS

      useEffect(() => {
         axios.get("http://localhost:5511/bill/allbillids").then((res) => setBillIds(res.data)).catch((err) => console.log(err));
      },[]);

      // LOAD CURRENT STATUS

      const loadCurrentStatus = () => {
          if(billid)
          {
            axios.get(`http://localhost:5511/bill/getstatus/${billid}`).then((res) => {
                setCurrentStatus(res.data.status);
                setUpdatedAt(res.data.updatedAt);
                setupdatedBy(res.data.updatedBy)
            }).catch(() => setCurrentStatus(""));
          }
      };

      useEffect(() => {
        loadCurrentStatus();
      },[billid]);

      const currentIndex = STATUS_FLOW.indexOf(currentStatus);
      const isFinalLocked = currentStatus === "Delivered" || currentStatus === "Cancelled";

      // UPDATE STATEUS WITH CONFIRMATION

      const UpdateStatus = async() => {
        if(!billid || !status)
        {
            alert("Please select Bill ID and Status");
            return;
        }

        if(!window.confirm(`Confirm update status to ":${status}" ?`)) return;

        await axios.put("http://localhost:5511/bill/updatestatus", {
            billid,
            status,
            updatedBy:updateByName
        });

        toast.success("Order Status Update Succesfully");
        setStatus("");
        loadCurrentStatus();
      };

      return(
        <div className="upAdmin">
            <div className="upStatus">
                <h2 className="UpH2">
                    Update Order Status
                    <span>{updateByName}</span>
                </h2>

                {/* // BILL ID DROPDOWN */}

                <label>Select Bill ID</label>
                <select value={billid} onChange={(e) => setBillid(e.target.value)}>

                    <option value="">--Select Bill ID--</option>
                     {billIds.map((id,index) => (
                        <option key={index} value={id}>{id}</option>
                    ) )}
                </select>

                {/* STATUS INFO */}

                {currentStatus && (
                    <div className="upAdminStatus">
                        <p>
                            <strong>Current Status</strong>
                            <span className={`admin-status-badge status-${currentStatus.replace(/\s+/g,"")}`}>
                            {currentStatus}</span>
                        </p>
                 <p><strong>Last Updated:</strong>{updatedAt ? new Date(updatedAt).toLocaleString() : "N/A"}</p> 

                 <p><strong>Updated By</strong>{updatedBy}</p>

                 {/* ANIMATED PROGRESS BY: */}
                 <div className="UdadminProgess">
                    <div className="UdProbar">
                        <div className="UdadminFill" style={{width:`${(currentIndex / (STATUS_FLOW.length - 1)) * 100}%`}}></div>
                    </div>

                    <div className="UdadminStep">
                        {STATUS_FLOW.map((s,i) => (
                            <span key={i} className={i <= currentIndex ? "active" : ""}>
                                {s}
                            </span>
                        ))}
                    </div>
                 </div>
                 </div>      
                )}

                {/* NEW STRONG DROPDOWN {DISABLE WHEN DELIVERED CANCELLED} */}

                <label>Set New Status:</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} disabled={isFinalLocked}>

                    <option value="">--Select New Status--</option>
                    {STATUS_FLOW.map((s,i) => i > currentIndex && s !== "Cancelled" ? (
                        <option key={i}>{s}</option>
                    ) : null)}

                </select>

                    {/* DISABLE BUTTON ON FINAL STATE */}

                    <button onClick={UpdateStatus} disabled={isFinalLocked}>{isFinalLocked ? "STATUS_LOCKED" : "update Status"}</button>
            </div>
        </div>
      )
   }
   export default UpdateOrderStatus;