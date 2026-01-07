import React,{useState,useEffect} from "react";
  import axios from "axios";
  import "./ordertracking.css";

  const STATUS_FLOW = [
"Processing",
  "Order Placed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled"
];

export default function OrderTracking({Cuserid,Onclose})
{
    const [billIds,setBillIds]=useState([]);
    const [billid,setBillid] = useState("");
    const [order,setOrder] = useState(null);
  const url=process.env.REACT_APP_API_URL;
    const cid = Cuserid;
    console.log("cid",cid);
    // LOAD BILL NUMBERS OF LOGGED-IN CUSTOMER
     useEffect(() => {
        if(cid)
        {
            axios.get(`${url}/bill/billshowbillid/${cid}`).then((res) => setBillIds(res.data)).catch((err) => console.log(err));
        }
     },[cid]);

     // LOAD FULL ORDER DETAILS

     const loadOrder = async (billid) => {
        const res = await axios.get(`${url}/bill/trackorder/${billid}`);

        setOrder(res.data);
     };

     const currentIndex = order ? STATUS_FLOW.indexOf(order.status) : 0;

     return (
        <div className="Ord-container">
            <h2 className="Ord-title">Track Your Order</h2>

             {/* BILL DROPDOWN */}

             <label className="lablee">Select Bill/Order Number</label>

             <select className="Ord-Bill" value={billid} onChange={(e) => {setBillid(e.target.value);
                loadOrder(e.target.value);
             }}>
                <option value="">-- Select Bill Number --</option>
                {billIds.map((b,i) => (
                    <option key={i} value={b.billid}>
                        {b.billid} ({b.billdate})
                    </option>
                ))}
             </select>

              {/* ONLY SHOW UI IF ORDER SELECTED */}
              { order && (
                    <div className="order_card">

                         {/* TOP ORDER BADGE */}

                         <h3>Bill No:{order.billid}</h3>
                         <p><strong>Date:</strong>{order.billdate}</p>

                         {/* STATUS BADGE */}

                         <p>
                            <strong>Status</strong>{""}
                          <span className={`status-badge status-${order.status.replace(/\s+/g,"")}`}>
                          {order.status}</span>  
                         </p>

                         <p><strong>Product ID:</strong>{order.pid}</p>
                         <p><strong>Quantity:</strong>{order.qty}</p>

                          {/* PROGRESS BAR */}

                          <div className="progress-wraperr">
                            <div className="progress-line">
                                <div className="progress-fill" style={{width:`${(currentIndex / (STATUS_FLOW.length - 1)) * 100}%`}}>
                                </div>
                            </div>

                            <div className="progress-steps" > {STATUS_FLOW.map((s, index) => (
                                <div key={index} className={`progress-step ${index <= currentIndex ? "active" : ""}`}>
                                    <div className="ordestrpcirlce">
                                        {index + 1}
                                    </div>
                                    <div className="stepord-lable">{s}</div>
                                </div>
                            ))}
                            </div>
                          </div>

                              {/* TIMELINE */}
                              <div className="ordertimeline">{STATUS_FLOW.map((status,index) => (
                              <div key={index} className={`timeline-item ${index <= currentIndex ? "completed" : ""}`}>
                                <div className="ordmarker"></div>
                                <div className="ordtimelinecontent">{status}</div>
                              </div>
                              ))}
                              
                              </div>
                    </div>
                )
              }
              {/* <button onClick={Onclose}>back</button> */}
        </div>
     );
}
