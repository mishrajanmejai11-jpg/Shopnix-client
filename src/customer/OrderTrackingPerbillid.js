import React,{useEffect, useState} from "react";
import axios from "axios";
import "./ordertrackingbybillid.css";

const STATUS_FLOW = [
  "Processing",
  "Order Placed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled"
];

function OrderTrackingPerBillId({BillId})
{
  const [order,setOrder] = useState(null);

  useEffect(() => {
    if(BillId)
    {
      loadOrder(BillId)
    }
  },[BillId])

  const loadOrder = async (billid) => {
    try{
      const res = await axios.get(`http://localhost:5511/bill/trackorder/${billid}`);
      setOrder(res.data);
    } catch(err)
    {
      alert("Failed to load order tracking"); 
    }
  };

  const currentIndex = order ? STATUS_FLOW.indexOf(order.status) : 0 ;

  return (
  <>
    <div className="Track">
      <h3 className="TracTitle">Your Order Status</h3>

      {order && (  

          <div className="order-Card">
            <h3>Bill No:{order.billid}</h3>
            <p><strong>Date:</strong>{order.billdate}</p>

            <p>
              <strong>Status</strong>{" "}
              <span className={`status-badge-statt-${order.status.replace(/\s+/g,"")}`}>
                {order.status}
              </span>
            </p>
         

          <div className="ProgressWraperr">
            <div className="ProgLink">
              <div
                className="Progrf"
                style={{width :`${(currentIndex / (STATUS_FLOW.length - 1)) * 100}%`}}
              ></div>
            </div>

            <div className="Progress-Stepp">
              {STATUS_FLOW.map((s,index) => (
                <div key={index} className={`progresasd ${index <= currentIndex ? "active" : ""}`}>
                  <div className="stpCircle">{index + 1}</div>    
                  <div className="stepLab">{s}</div>
                </div>
              ))}
            </div>
          </div>        

          <div className="timeline">
            {STATUS_FLOW.map((status,index) => (
              <div
                key={index}
                className={`timelinee-item ${index <= currentIndex ? "completed" : ""}`}
              >
                <div className="timeline-marker"></div>
                <div className="timeline-contentt">{status}</div>  
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
 </> 
 );
}

export default OrderTrackingPerBillId;













//   import React,{useEffect, useState} from "react";
//   import axios from "axios";
// import { waitFor } from "@testing-library/dom";

//     const STATUS_FLOW = [
//         "Processing",
//      "Order Placed",
//      "Packed",
//      "Shipped",
//      "Out for Delivery",
//      "Delivered",
//      "Cancelled"
//    ];

//    function OrderTrackingPerBillId({BillId})
//    {
//      const [order,setOrder] = useState(null);

//      useEffect(() => {
//         if(BillId)
// {
//        loadOrder(BillId)
// }
//      },[BillId])

//      const loadOrder = async (billid) => {

//         try{
//             const res = await axios.get(http://localhost:9876/bill/trackorder/${billid});
//              setOrder(res.data);
//      } catch(err)
//      {
//              alert("Failed to load order tracking"); 
//      }
//    };

//    const currentIndex = order ? STATUS_FLOW.indexOf(order.status) : 0 ;

//    return (
//     <div className="Track">
//         <h3 className="TracTitle">Your Order Status</h3>

//         {order && (
//             <div className="order-Cardd">
//                 <h3>Bill No:{order.billid}</h3>
//                 <p><strong>Date:</strong>{order.billdate}</p>

//                 <p>
//                     <strong>Status</strong>{""}
//                     <span className={status-badge-statt-${order.status.replace(/\s+/g,"")}}>{order.status}</span>
//                 </p>
//             </div>

//             <div className="ProgressWraperr">
//                 <div className="ProgLink">
//                     <div className="Progrf" style={{width :${(currentIndex / (STATUS_FLOW.length - 1)) * 100}%}}></div>
//                 </div>

//                 <div className="Progress-Stepp">{STATUS_FLOW.map((s,index) => (
//                     <div key={index} className={progresasd ${index <= currentIndex ? "active" : ""}}>

//                     <div className="stpCircle">{index + 1}</div>    
//                     <div className="stepLab">{s}</div>
//                     </div>
//                 ))}</div>
//             </div>        

//             <div className="timeline">
//                 {STATUS_FLOW.map((status,index) => (
//                     <div key={index} className={timelinee-item ${index <= currentIndex ? "completed" : ""}}>
//                       <div className="timeline-marker"></div>
//                       <div className="timeline-contentt">{status}</div>  
//                     </div>
//                 ))}
//             </div>
//              </div>
//         )}
//     </div>
//    )
//    }

//    export default OrderTrackingPerBillId;