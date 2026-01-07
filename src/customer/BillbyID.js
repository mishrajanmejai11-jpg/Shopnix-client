import React,{useState,useEffect, useMemo} from "react";

  import axios from "axios";
  import jsPDF from "jspdf";
import OrderTrackingPerBillId from "./OrderTrackingPerbillid";
 import "./billbyid.css";


  function BillByID(props) {
     const [billidlist,setBillIdList] = useState([]);
     const [billdatelist,setBillDateList] = useState([]);
     const [billdetailslist, setBillDetailsList] =useState([]);
     const [plist,setPlist] =useState([]);
     const [custDetails,setCustDetails] = useState({});
     const [billId,setBillId] = useState("");
     const [billdate,setBillDate] = useState("");
     const [loading,setLoading] = useState(true);
     const [isshowordertracking,setIsShowOrderTracking] = useState(false);

  const url=process.env.REACT_APP_API_URL;
     
     // LOAD BILL IDS, PRODUCTS, AND BILL DATES

     useEffect(() => {
        setLoading(true);

        Promise.all([axios.get(`${url}/bill/billshowbillid/${props.data}`),
            axios.get(`${url}/product/showproduct`),
            axios.get(`${url}/bill/billshowbilldates/${props.data}`),
        ]).then(([billRes,prodRes, dateRes]) => {
             setBillIdList(billRes.data);
             setPlist(prodRes.data);
             setBillDateList(dateRes.data);
        }).catch((err) => alert(err)).finally(() => setTimeout(() => setLoading(false),1000));
     },[props.data]);


     // HANDLE SELECT BY BILL ID

     const handleBillIdSelect = async (evt) => {
        const selectedId = evt.target.value;
        setBillId(selectedId);
        setBillDate("");
        setBillDetailsList([]);

        try
        {
            const res = await axios.get(`${url}/bill/showbillbyid/${selectedId}`);
            setBillDetailsList(res.data);
        } catch(err)
        {
            alert(err);
        }
     };

       // HANDLE SELECT BY BILL ID

       const handleBillDateSelect = async (evt) => {
        const selectDate = evt.target.value;
        setBillDate(selectDate);
        setBillId("");
        setBillDetailsList([]);


        try{
            const res = await axios.get(`${url}/bill/showbillbydate/${selectDate}`);

            setBillDetailsList(res.data);
        } catch(err)
        {
            alert(err);
        }
          };

          
          //  FETCH CUSTOMER DETAILS

          const fetchCustomerDetails = async () => {
            try{
         const res = await axios.get( `${url}/customer/getcustomerdetails/${props.data}`);

                    setCustDetails(res.data);
                    return res.data;
            }  catch(err)
                {
                    alert (err);
                    return {};
                };
            };

            //  CONVERT IMAGE URL TO BASE64 

            const toDataURL = (url) => fetch(url).then((response) => 
                response.blob()).then((blob) => new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                })
            );

            // GROUP BILL BILLID (USED FOR BILL DATE SELECTION)
            const groupedBills = useMemo(() => {
                if(!billdetailslist.length) return[];

                const groups = {};

                billdetailslist.forEach((bitem) => {
                    const billid = bitem.billid;

                    if(!groups[billid])
                    {
                        groups[billid] = {items: [], total: 0, count : 0, qtyTotal: 0};
                    }

                    const product = plist.find((p) => p.pid === bitem.Pid);
                    const price = product?.oprice || 0;
                    const qty = bitem.qty || 1;
                    const amount = price * qty; 

                    groups[billid].items.push({
                        ...bitem,
                         pname: product?.pname || "",
                         price,
                         qty,
                         amount,
                         ppicname: product?.ppicname || "",
                    });

                    groups[billid].total += amount;
                    groups[billid].count += 1;
                    groups[billid].qtyTotal += qty;
                });

                return Object.entries(groups).map(([billid,data]) => ({
                     billid,
                     ...data,
                }));
            },[billdetailslist,plist]);
            

            //  GENERATE PDF FOR EACH BILL

            const generatePDF = async (bill) => {
                const customer = await fetchCustomerDetails();
                const doc = new jsPDF();

                const logoBase64 = await toDataURL('');

                doc.addImage(logoBase64, "JPEG", 10, 10, 40, 20);
                doc.setFontSize(18);
                doc.text("Customer invoice",70, 25);
                doc.line(10,30,200,30);

                doc.setFontSize(12);
                doc.text(`Customer ID: ${customer.Cid}`,10, 40);
                doc.text(`Name : ${customer.Customername}`,10,48);
                doc.text(`Address : ${customer.Caddress}`,10,56);
                doc.text(`Contact : ${customer.Ccontact}`,10,64);
                doc.text(`Bill ID: ${bill.billid}`,10,72);
                doc.text(`Bill Date : ${bill.items[0]?.billdate || "N/A"}`,10,80);

                 let y = 90;
                 doc.setFontSize(11);
                 doc.setFont("helvetica","bold");
                 doc.text("Product", 15, y);
                  doc.text("Price", 70, y);
                  doc.text("Qty", 100,y);
                  doc.text("Amount",120,y);
                  doc.text("Image",160,y);
                  doc.line(10, y + 2, 200, y + 2);

                  y+= 10;
                  doc.setFont("helvetica","normal");

                  for(const item of bill.items)
                  {
                    if(y > 260)
                    {
                        doc.addPage();
                        y = 20;
                    }

                    doc.text(item.pname, 15,y);
                    doc.text(`Rs${item.price}`,70,y);
                    doc.text(`${item.qty}`,100,y);
                    doc.text(`Rs${item.amount}`,120, y);

                    if(item.ppicname)
                    {
                        const imgUrl = `${url}/product/getproductimage/${item.ppicname}`;
                        const base64Img = await toDataURL(imgUrl);
                        doc.addImage(base64Img, "JPEG", 160, y -6 , 20 ,20);
                    }
                  
                  y +=25;

            }

            doc.setFontSize(13);
            doc.setFont("helvetica","bold");
            doc.text(`Total Items: ${bill.count}`,10, y+5);
            doc.text(`Total Qty: ${bill.qtyTotal}`,60, y+5);
            doc.text(`Total Amount: Rs${bill.total.toFixed(2)}`,120, y+5);

            doc.setFontSize(10);
            doc.text("Thank you for shopping with us!", 70, 285);
            const dateStr = new Date().toLocaleString();
            doc.text(`Generated on :${dateStr}`,140, 285);

            doc.save(`CID_${customer.Cid}_Bill_${bill.billid}`.pdf);

        };
          
          // DOWNLOAD ALL BILLS (FOR DATE)

          const downloadAllPDFs =async () => {
            if(!groupedBills.length)
            {
                alert("No Bills to download");
                return;
            }
    

          for(const bill of groupedBills)
          {
            await generatePDF(bill)
          }
        };

        //  UI 

        if(loading)
        {
            return (
                <div style={{textAlign : "center", marginTop:"40px"}}>
                    <div className="loader"></div>
                    <p>Loading data,Please wait...</p>
                </div>
            );
        }
            
        const handleTrackOrder = (clickedBillId) => {
            if(isshowordertracking && billId === clickedBillId)
            {
          setIsShowOrderTracking(false);  // HIDE
          setBillId("");          
        }
        else
        {
            setBillId(clickedBillId);  // SHOW
            setIsShowOrderTracking(true);
        }
        };

          return (
    <div className="customer_order_billbyid">
        <center>
        <h3>View Orders</h3>
        <p>Customer ID = {props.data}</p>

        <table className="bill-table-h3">
            <tbody>
                <tr>
                    <td>
                        Bill Id
                        <select onChange={handleBillIdSelect} value={billId}>
                            <option value="">--Select Bill Id--</option>
                            {billidlist.map((item) => (
                                <option key={item.billid} value={item.billid}>
                                    {item.billid}
                                </option>
                            ))}
                        </select>
                    </td>

                    <td>
                        Bill Date
                        <select onChange={handleBillDateSelect} value={billdate}>
                            <option value="">--Select Bill Date--</option>
                            {billdatelist.map((item) => (
                                <option key={item.billdate} value={item.billdate}>
                                    {item.billdate}
                                </option>
                            ))}
                        </select>
                    </td>
                </tr>
            </tbody>
        </table>

        {groupedBills.length === 0 ? (
            <p>No bills found for this selection</p>
        ) : (
            groupedBills.map((group, idx) => (
                <div key={idx} style={{ marginBottom: "40px" }}>

                    <h4>Bill ID: {group.billid}</h4>

                    <table className="table table-border">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Price</th>
                                <th>Qty</th>
                                <th>Amount</th>
                                <th>Photo</th>
                            </tr>
                        </thead>

                        <tbody>
                            {group.items.map((bitem, i) => (
                                <tr key={i}>
                                    <td>{bitem.pname}</td>
                                    <td>{bitem.price}</td>
                                    <td>{bitem.qty}</td>
                                    <td>{bitem.amount}</td>
                                    <td>
                                        <img
                                            src={bitem.ppicname}
                                            height="80"
                                            width="80"
                                            alt="product"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <p>
                        <b>Total Items:</b> {group.count} &nbsp; | &nbsp;
                        <b>Total Qty:</b> {group.qtyTotal} &nbsp; | &nbsp;
                        <b>Total Amount</b> Rs{group.total.toFixed(2)}
                    </p>

                    <button
                        onClick={() => generatePDF(group)}
                        style={{
                            marginTop: "10px",
                            padding: "6px 12px",
                            backgroundColor: "black",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer"
                        }}
                    >
                        Download Bill #{group.billid}
                    </button>

                    <button onClick={() => handleTrackOrder(group.billid)}>
                        {isshowordertracking && billId === group.billid
                            ? "Hide Tracking"
                            : "Track Order"}
                    </button>

                    <hr />
                </div>
            ))
        )}

        {groupedBills.length > 1 && (
            <button
                onClick={downloadAllPDFs}
                style={{
                    padding: "8px 16px",
                    backgroundColor: "green",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer"
                }}
            >
                Download All Bills(ZIP)
            </button>
        )}

        {isshowordertracking && billId && (
            <div className="traching">
                <div className="popup">
                    <span
                        className="tracking-close"
                        onClick={() => setIsShowOrderTracking(false)}
                    >
                        *
                    </span>

                    <OrderTrackingPerBillId BillId={billId} />
                </div>
            </div>
        )}
        </center>
    </div>
    );
 
   }
  export default BillByID;
