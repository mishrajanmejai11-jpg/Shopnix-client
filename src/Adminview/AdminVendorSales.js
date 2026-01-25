import React,{ useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    Tooltip,
    Legend,
    LinearScale,
} from "chart.js";
import autoTable from "jspdf-autotable";
// import "./AdminVendorSales.css";
// import LinearProgress from "@mui/material/LinearProgress";
// import { before } from "node:test";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function AdminVendorSales(){
    const[sales,setSales]=useState([]);
    const[salesSearch, setSalesSearch]=useState("");
    const[fromDate]=useState("");
    const[toDate]=useState("");
    const[salesPage, setSalesPage]=useState(1);
    const[salesPerPage]=useState(10);
    const[grandTotal, setGrandTotal]=useState(0);
    const[productTotals, setProductTotals]=useState({});
    const[totalProductSold, setTotalProductSold]=useState(0);
    const[selectedProduct, setSelectedProduct]=useState(null);
    const[popupVisible, setPopupVisible]=useState(false);
    const chartRef=useRef(null);
    const[venderlist, setVenderList]=useState([]);
    const[selectedVender, setSelectedVender]=useState("");
    const[loadingVenders, setLoadingVenders]=useState(false);
    const[loadingSales, setLoadingSales]=useState(false);
    const[errorVenders, setErrorVenders]=useState("");
    const[errorSales, setErrorSales]=useState("");

    const IMAGE_BASE_URL=`${process.env.REACT_APP_API_URL}/product`;

    //===============================
    // FETCH VENDERS
    //===============================
    const fetchVenders=async()=>{
        setErrorVenders("");
        setLoadingVenders(true);
        try{
            const res=await axios.get(`${process.env.REACT_APP_API_URL}/vender/getallvender`);
            setVenderList(res.data || []);
        }catch(err){
            setErrorVenders("Unable to load vendors.");
        }finally{
            setLoadingVenders(false);
        }
    };

    useEffect(()=>{
        fetchVenders();
    },[]);

    //======================FETCH SALES=================
    const fetchSalesManually=async()=>{
        if(!selectedVender) return;

        setErrorSales("");
        setLoadingSales(true);

        try{
            const res=await axios.get(`http://localhost:5511/sales/vender/${selectedVender}`);
            const data= res.data.sales ?? [];
            setSales(Array.isArray(data) ? data: []);
            setSalesPage([]);
        }catch(err){
            setErrorSales("Unable to load sales.");
        }finally{
            setLoadingSales(false);
        }
    };

    useEffect(()=>{
        if(selectedVender) fetchSalesManually();
        else setSales([]);
    },[sales]);

    //========================FILTER======================
    const filteredSales= sales.filter((s)=>{
        const productName=(s.product?.pname || "").toLowerCase();
        const billIdStr= s.billid ? String(s.billid) : "";
        const searchLower= salesSearch.toLowerCase();

        const matchSearch= productName.includes(searchLower) || billIdStr.includes(searchLower);
        const saleDate= s.date ? new Date(s.date) : null;
        const afterFrom= !fromDate || (saleDate && saleDate>=new Date(fromDate));
        const beforeTo= !toDate || (saleDate && saleDate>=new Date(toDate));

        return matchSearch && afterFrom && beforeTo;
    });

    //===========RESET PAGE ON FILTER CHANGE=============
    useEffect(()=>{
        const totalRevenue=filteredSales.reduce(
            (sum, s) => sum + (Number(s.totalPrice) || 0), 0
        );
        setGrandTotal(totalRevenue);

        const summary={};
        let totalQty=0;

        filteredSales.forEach((s)=>{
            const pname= s.product?.pname || "Unknown";
            if(!summary[pname])
                summary[pname]= { qty:0, revenue:0, sample: s.product };
                summary[pname].qty+= Number(s.quantity) || 0;
                summary[pname].revenue+= Number(s.totalPrice) || 0;
                totalQty+= Number(s.quantity) || 0;
        });
        setProductTotals(summary);
        setTotalProductSold(totalQty);
    },[filteredSales]);

    //=================CHART=======================
    const chartData= useMemo(()=>({
        labels: Object.keys(productTotals),
        datasets:[{
            label: "Revenue (₹)",
            data: Object.values(productTotals).map((p)=>p.revenue),
            backgroundColor: Object.keys(productTotals).map((_, i)=> `hsl(${(i*45)% 360}, 70%,55%)`),
            borderWidth:1,
        },],
    }),[productTotals]);

    //===================PAGINATION==================
    const totalPages=Math.ceil(filteredSales.length / salesPage) || 1;
    const startIndex= (salesPage - 1)* salesPerPage;
    const currentSales= filteredSales.slice(startIndex, startIndex + salesPerPage);

    //========================MAIN PDF=================
    const exportPDF=()=>{
        if(!filteredSales.length) return alert("No Sales");

        const doc=new jsPDF();
        doc.text("Vendor Sales Report", 14, 15);

        autoTable(doc,{
            startY:25,
            head:[["Bill", "Date", "Product", "Qty", "Total"]],
            body: filteredSales.map((s)=>[
                s.billid,
                new Date(s.date).toLocaleDateString(),
                s.product?.pname,
                s.quantity,
                s.totalPrice
            ]),
        });

        doc.text(`Grand Total: ₹${grandTotal}`, 14, doc.lastAutoTable.finalY + 10);
        doc.save("Vendor_Sales_Report.pdf");
    };

    //=================PER PRODUCT PDF======================
    const exportProductPDF=(productName, productSales)=>{
        const doc=new jsPDF();
        doc.text(`${productName} Sales Report`, 14 , 15);

        autoTable(doc,{
            startY:25,
            head:[["Bill", "Date", "Qty", "Total"]],
            body: productSales.map((s)=>[
                s.billid,
                new Date(s.date).toLocaleDateString(),
                s.quantities,
                s.totalPrice,
            ]),
        });

        const totalRevenue=productSales.reduce(
            (sum, s)=> sum + (Number(s.totalPrice) || 0), 0
        );
        doc.text(`Total Revenue: ₹${totalRevenue}`,14,
            doc.lastAutoTable.finalY + 10
        );
        doc.save(`${productName}_Sales_Report.pdf`);
    };

    // console.log("current sale",currentSales);

    //======================UI====================
    return(
        <div className="vendor-sales-page">
            <h3>Vendor Sales Report</h3>
            <select onChange={(e)=> setSelectedVender(e.target.value)}>
                <option value="">--Select--</option>
                {venderlist.map((v)=>(
                    <option key={v.Vid} value={v.Vid}>{v.VenderName}</option>
                ))}
            </select>
            <button onClick={exportPDF}>Export PDF</button>

            <input placeholder="Search" value={salesSearch} onChange={(e)=> setSalesSearch(e.target.value)}/>

            {loadingSales ? (
                <p>Loading Sales...</p>
            ) : errorSales ? (
                <>
                <p>{errorSales}</p>
                <button onClick={fetchSalesManually}>Retry</button>
                </>
            ) : (
                <>
                <table border="1" width="100%">
                    <thead>
                        <tr>
                            <th>Bill</th>
                            <th>Date</th>
                            <th>Product</th>
                            <th>Qty</th>
                            <th>Total</th>
                            <th>Photo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentSales.map((s)=>(
                            <tr key={s._id}>
                                <td>{s.billid}</td>
                                <td>{new Date(s.date).toLocaleDateString()}</td>
                                <td>{s.product?.pname}</td>
                                <td>{s.quantity}</td>
                                <td>{s.totalPrice}</td>
                                <td><img src={s.product?.ppicname}
                                alt={s.product?.pname} height="40" width="40" 
                                onError={(e)=> (e.target.src+`${IMAGE_BASE_URL}default.png`)}/>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* PAGINATION UI */}
                <div style={{marginTop:15, textAlign:"center"}}>
                    <button disabled={salesPage===1} onClick={()=> setSalesPage((p)=> p-1)}></button>
                    <span style={{margin:"0 10px", fontWeight:"bold"}}>Page {salesPage}</span>

                    <button disabled={salesPage===totalPages} onClick={()=> setSalesPage((p)=> p+1)}>
                        Next
                    </button>
                </div>
                </>
            )}

            {/* ===========PER PRODUCT SUMMARY============*/ }
            <h4 style={{marginTop:30}}>Per-Product Summary</h4>
            <table border="1" width="100%">
            <tbody>
                {Object.keys(productTotals).map((p)=>{
                    const product=productTotals[p].sample;
                    return(
                        <tr key={p} style={{cursor:"pointer"}} onClick={()=>{
                            setSelectedProduct(p);
                            setPopupVisible(true);
                        }}>
                            <td><img src={`${IMAGE_BASE_URL}${product.ppicname}`}
                            height="40" width="40" alt=""/>
                            </td>
                            <td>{p}</td>
                            <td>{productTotals[p].qty}</td>
                            <td>{productTotals[p].revenue}</td>
                        </tr>
                    );
                })}
            </tbody>
            </table>

            <h4>Total Product Sold: {totalProductSold}</h4>
            <h4>Grand Total: ₹{grandTotal}</h4>
            <div style={{maxWidth:700, margin:"30px auto"}}>
                <Bar ref={chartRef} data={chartData}/>
            </div>

            {/* =================POPUP=========== */}
            {popupVisible && selectedProduct && (
                <div className="popup=overlay">
                    <div className="popup-content">
                        {(()=>{
                          const productSales=filteredSales.filter((s)=>s.product?.pname===selectedProduct);
                          const totalQty=productSales.reduce((sum, s)=>sum+(Number(s.quantity) || 0),0);
                          const totalRevenue=productSales.reduce((sum,s)=>sum+(Number(s.totalPrice) || 0),0);
                          const product=productSales[0]?.product;

                          return(
                            <>
                            <div className="popup-header">
                                <img src={`${IMAGE_BASE_URL}${product?.ppicname}` || "/default.png"}
                                alt={selectedProduct} style={{width:"70px", height:"70px", objectFit:"cover",
                                    borderRadius:"8px",marginRight:"15px"
                                }}/>
                                <div>
                                <h2>{selectedProduct}</h2>
                                <p><strong>Total Quantity Sold: </strong>{totalQty}</p>
                                <p><strong>Total Revenue: </strong>₹{totalRevenue.toLocaleString("en-IN")}</p>
                            </div>
                            </div>

                            <table className="popup-table">
                                <thead>
                                    <tr>
                                        <th>Bill ID</th>
                                        <th>Date</th>
                                        <th>Qty</th>
                                        <th>Price</th>
                                        <th>Offer</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productSales.map((s)=>(
                                        <tr key={s._id}>
                                            <td>{s.billid}</td>
                                            <td>{s.date ? new Date(s.date).toLocaleDateString() : "-"}</td>
                                            <td>{s.quantity}</td>
                                            <td>{s.product?.pprice}</td>
                                            <td>{s.totalPrice}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="popup-buttons">
                                <button className="btn btn-info btn-sm" onClick={()=> exportPDF
                                    (selectedProduct, productSales)}>Download PDF</button>
                                    <button className="btn bnt-danger btn-sm" onClick={()=> 
                                    setPopupVisible(false)}>❌ Close </button>
                            </div>
                            </>
                          );
                        })()}
                    </div>
                </div>
            )}
        </div>
    );

}    


// import React,{ useState, useEffect, useRef, useMemo } from "react";
// import axios from "axios";
// import jsPDF from "jspdf";
// import { Bar } from "react-chartjs-2";
// // import "./AdminVenderSales.css";
// import {
//     Chart as ChartJS,
//     BarElement,
//     CategoryScale,
//     LinearScale,
//     Tooltip,
//     Legend,
// } from "chart.js";
// // import "./AdminVendorSales.css";
// // import LinearProgress from "@mui/material/LinearProgress";
// import autoTable from "jspdf-autotable";
// // import { before } from "node:test";

// ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// export default function AdminVendorSales(){
//     const[sales,setSales]=useState([]);
//     const[salesSearch, setSalesSearch]=useState("");
//     const[fromDate, setFromDate]=useState("");
//     const[toDate, setToDate]=useState("");
//     const[salesPage, setSalesPage]=useState(1);
//     const[salesPerPage, setSalesPerPage]=useState(10);
//     const[grandTotal, setGrandTotal]=useState(0);
//     const[productTotals, setProductTotals]=useState({});
//     const[totalProductSold, setTotalProductSold]=useState(0);
//     const[selectedProduct, setSelectedProduct]=useState(null);
//     const[popupVisible, setPopupVisible]=useState(false);
//     const chartRef=useRef(null);
//     const[venderlist, setVenderList]=useState([]);
//     const[selectedVender, setSelectedVender]=useState("");
//     const[loadingVenders, setLoadingVenders]=useState(false);
//     const[loadingSales, setLoadingSales]=useState(false);
//     const[errorVenders, setErrorVenders]=useState("");
//     const[errorSales, setErrorSales]=useState("");

//     const IMAGE_BASE_URL="http://localhost:5511/product/";

//     //===============================
//     // FETCH VENDERS
//     //===============================
//     const fetchVenders=async()=>{
//         setErrorVenders("");
//         setLoadingVenders(true);
//         try{
//             const res=await axios.get("http://localhost:5511/vender/getallvender");
//             setVenderList(res.data || []);
//         }catch(err){
//             setErrorVenders("Unable to load vendors.");
//         }finally{
//             setLoadingVenders(false);
//         }
//     };

//     useEffect(()=>{
//         fetchVenders();
//     },[]);

//     //======================FETCH SALES=================
//     const fetchSalesManually=async()=>{
//         if(!selectedVender) return;

//         setErrorSales("");
//         setLoadingSales(true);

//         try{
//             const res=await axios.get(`http://localhost:5511/sales/vender/${selectedVender}`);
//             const data= res.data.sales?? [];
//             setSales(Array.isArray(data) ? data: []);
//             setSalesPage([1]);
//             // setSalesPage([]);
//         }catch(err){
//             setErrorSales("Unable to load sales.");
//         }finally{
//             setLoadingSales(false);
//         }
//     };

//     useEffect(()=>{
//         if(selectedVender) fetchSalesManually();
//         else setSales([]);
//     },[selectedVender]);
//                                 //     OLD
//     //========================FILTER======================
//     // const filteredSales= sales.filter((s)=>{
//     //     const productName=(s.product?.pname || "").toLowerCase();
//     //     const billIdStr= s.billid ? String(s.billid) : "";
//     //     const searchLower= salesSearch.toLowerCase();

//     //     const matchSearch= productName.includes(searchLower) || billIdStr.includes(searchLower);
//     //     const saleDate= s.date ? new Date(s.date) : null;
//     //     const afterFrom= !fromDate || (saleDate && saleDate>=new Date(fromDate));
//     //     const beforeTo= !toDate || (saleDate && saleDate<=new Date(toDate));
//     //     // const beforeTo= !toDate || (saleDate && saleDate>=new Date(toDate));

//     //     return matchSearch && afterFrom && beforeTo;
//     // });

//     const filteredSales = useMemo(() => {
//   return sales.filter((s) => {
//     const productName = (s.product?.pname || "").toLowerCase();
//     const billIdStr = s.billid ? String(s.billid) : "";
//     const searchLower = salesSearch.toLowerCase();

//     const matchSearch =
//       productName.includes(searchLower) ||
//       billIdStr.includes(searchLower);

//     const saleDate = s.date ? new Date(s.date) : null;
//     const afterFrom =
//       !fromDate || (saleDate && saleDate >= new Date(fromDate));
//     const beforeTo =
//       !toDate || (saleDate && saleDate <= new Date(toDate));

//     return matchSearch && afterFrom && beforeTo;
//   });
// }, [sales, salesSearch, fromDate, toDate]);

//                          // OLDDDDDD
//     //===========RESET PAGE ON FILTER CHANGE=============         
//     // useEffect(()=>{
//     //     const totalRevenue=filteredSales.reduce(
//     //         (sum, s) => sum + (Number(s.totalPrice) || 0), 0
//     //     );
//     //     setGrandTotal(totalRevenue);

//     //     const summary={};
//     //     let totalQty=0;

//     //     filteredSales.forEach((s)=>{
//     //         const pname= s.product?.pname || "Unknown";
//     //         if(!summary[pname])
//     //             summary[pname]= { qty:0, revenue:0, sample: s.product };
//     //             summary[pname].qty+= Number(s.quantity) || 0;
//     //             summary[pname].revenue+= Number(s.totalPrice) || 0;
//     //             totalQty+= Number(s.quantity) || 0;
//     //     });
//     //     setProductTotals(summary);
//     //     setTotalProductSold(totalQty);
//     // },[filteredSales]);

//     useEffect(() => {
//   const totalRevenue = filteredSales.reduce(
//     (sum, s) => sum + (Number(s.totalPrice) || 0),
//     0
//   );
//   setGrandTotal(totalRevenue);

//   const summary = {};
//   let totalQty = 0;

//   filteredSales.forEach((s) => {
//     const pname = s.product?.pname || "Unknown";

//     if (!summary[pname]) {
//       summary[pname] = { qty: 0, revenue: 0, sample: s.product };
//     }

//     summary[pname].qty += Number(s.quantity) || 0;
//     summary[pname].revenue += Number(s.totalPrice) || 0;
//     totalQty += Number(s.quantity) || 0;
//   });

//   setProductTotals(summary);
//   setTotalProductSold(totalQty);
// }, [filteredSales]);


//     //=================CHART=======================
//     const chartData= useMemo(()=>({
//         labels: Object.keys(productTotals),
//         datasets:[{
//             label: "Revenue (₹)",
//             data: Object.values(productTotals).map((p)=>p.revenue),
//             backgroundColor: Object.keys(productTotals).map((_, i)=> `hsl(${(i*45)% 360}, 70%,55%)`),
//             borderWidth:1,
//         },],
//     }),[productTotals]);

//     //===================PAGINATION==================
//     const totalPages=Math.ceil(filteredSales.length / salesPerPage) || 1;
//     // const totalPages=Math.ceil(filteredSales.length / salesPage) || 1;
//     const startIndex= (salesPage - 1)* salesPerPage;
//     const currentSales= filteredSales.slice(startIndex, startIndex + salesPerPage);

//     //========================MAIN PDF=================
//     const exportPDF=()=>{
//         if(!filteredSales.length) return alert("No Sales");

//         const doc=new jsPDF();
//         doc.text("Vendor Sales Report", 14, 15);

//         autoTable(doc,{
//             startY:25,
//             head:[["Bill", "Date", "Product", "Qty", "Total"]],
//             body: filteredSales.map((s)=>[
//                 s.billid,
//                 new Date(s.date).toLocaleDateString(),
//                 s.product?.pname,
//                 s.quantity,
//                 s.totalPrice
//             ]),
//         });

//         doc.text(`Grand Total: ₹${grandTotal}`, 14, doc.lastAutoTable.finalY + 10);
//         doc.save("Vendor_Sales_Report.pdf");
//     };

//     //=================PER PRODUCT PDF======================
//     const exportProductPDF=(productName, productSales)=>{
//         const doc=new jsPDF();
//         doc.text(`${productName} Sales Report`, 14 , 15);

//         autoTable(doc,{
//             startY:25,
//             head:[["Bill", "Date", "Qty", "Total"]],
//             body: productSales.map((s)=>[
//                 s.billid,
//                 new Date(s.date).toLocaleDateString(),
//                 s.quantities,
//                 s.totalPrice,
//             ]),
//         });

//         const totalRevenue=productSales.reduce(
//             (sum, s)=> sum + (Number(s.totalPrice) || 0), 0
//         );
//         doc.text(`Total Revenue: ₹${totalRevenue}`,14,
//             doc.lastAutoTable.finalY + 10
//         );
//         doc.save(`${productName}_Sales_Report.pdf`);
//     };

//     //======================UI====================
//     return(
//         <div className="vendor-sales-page">
//             <h3>Vendor Sales Report</h3>
//             <select onChange={(e)=> setSelectedVender(e.target.value)}>
//                 <option value="">--Select--</option>
//                 {venderlist.map((v)=>(
//                     <option key={v.Vid} value={v.Vid}>{v.VenderName}</option>
//                 ))}
//             </select>
//             <button onClick={exportPDF}>Export PDF</button>

//             <input placeholder="Search" value={salesSearch} onChange={(e)=> setSalesSearch(e.target.value)}/>

//             {loadingSales ? (
//                 <p>Loading Sales...</p>
//             ) : errorSales ? (
//                 <>
//                 <p>{errorSales}</p>
//                 <button onClick={fetchSalesManually}>Retry</button>
//                 </>
//             ) : (
//                 <>
//                 <table border="1" width="100%">
//                     <thead>
//                         <tr>
//                             <th>Bill</th>
//                             <th>Date</th>
//                             <th>Product</th>
//                             <th>Qty</th>
//                             <th>Total</th>
//                             <th>Photo</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {currentSales.map((s)=>(
//                             <tr key={s._id}>
//                                 <td>{s.billid}</td>
//                                 <td>{new Date(s.date).toLocaleDateString()}</td>
//                                 <td>{s.product?.pname}</td>
//                                 <td>{s.quantity}</td>
//                                 <td>{s.totalPrice}</td>
//                                 <td><img src={`${IMAGE_BASE_URL}/getimage/${s.product?.ppicname}`} 
//                                 alt={s.product?.pname} height="40" width="40" 
//                                 onError={(e)=> (e.target.src=`${IMAGE_BASE_URL}default.png`)}/>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>

//                 {/* PAGINATION UI */}
//                 <div style={{marginTop:15, textAlign:"center"}}>
//                     <button disabled={salesPage===1} onClick={()=> setSalesPage((p)=> p-1)}></button>
//                     <span style={{margin:"0 10px", fontWeight:"bold"}}>Page {salesPage}</span>

//                     <button disabled={salesPage===totalPages} onClick={()=> setSalesPage((p)=> p+1)}>
//                         Next
//                     </button>
//                 </div>
//                 </>
//             )}

//             {/* ===========PER PRODUCT SUMMARY============*/ }
//             <h4 style={{marginTop:30}}>Per-Product Summary</h4>
//             <table border="1" width="100%">
//             <tbody>
//                 {Object.keys(productTotals).map((p)=>{
//                     const product=productTotals[p].sample;
//                     return(
//                         <tr key={p} style={{cursor:"pointer"}} onClick={()=>{
//                             setSelectedProduct(p);
//                             setPopupVisible(true);
//                         }}>
//                             <td><img src={`${IMAGE_BASE_URL}/getimage/${product?.ppicname}`}
//                             height="40" width="40" alt=""/>
//                             </td>
//                             <td>{p}</td>
//                             <td>{productTotals[p].qty}</td>
//                             <td>{productTotals[p].revenue}</td>
//                         </tr>
//                     );
//                 })}
//             </tbody>
//             </table>

//             <h4>Total Product Sold: {totalProductSold}</h4>
//             <h4>Grand Total: ₹{grandTotal}</h4>
//             <div style={{maxWidth:700, margin:"30px auto"}}>
//                 <Bar ref={chartRef} data={chartData}/>
//             </div>

//             {/* =================POPUP=========== */}
//             {popupVisible && selectedProduct && (
//                 <div className="popup=overlay">
//                     <div className="popup-content">
//                         {(()=>{
//                           const productSales=filteredSales.filter((s)=>s.product?.pname===selectedProduct);
//                           const totalQty=productSales.reduce((sum, s)=>sum+(Number(s.quantity) || 0),0);
//                           const totalRevenue=productSales.reduce((sum,s)=>sum+(Number(s.totalPrice) || 0),0);
//                           const product=productSales[0]?.product;

//                           return(
//                             <>
//                             <div className="popup-header">
//                                 <img src={`${IMAGE_BASE_URL}${product?.ppicname}` || "/default.png"}
//                                 alt={selectedProduct} style={{width:"70px", height:"70px", objectFit:"cover",
//                                     borderRadius:"8px",marginRight:"15px"
//                                 }}/>
//                                 <div>
//                                 <h2>{selectedProduct}</h2>
//                                 <p><strong>Total Quantity Sold: </strong>{totalQty}</p>
//                                 <p><strong>Total Revenue: </strong>₹{totalRevenue.toLocaleDateString("en-IN")}</p>
//                             </div>
//                             </div>

//                             <table className="popup-table">
//                                 <thead>
//                                     <tr>
//                                         <th>Bill ID</th>
//                                         <th>Date</th>
//                                         <th>Qty</th>
//                                         <th>Price</th>
//                                         <th>Offer</th>
//                                         <th>Total</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {productSales.map((s)=>(
//                                         <tr key={s._id}>
//                                             <td>{s.billid}</td>
//                                             <td>{s.date ? new Date(s.date).toLocaleDateString() : "-"}</td>
//                                             <td>{s.quantity}</td>
//                                             <td>{s.product?.pprice}</td>
//                                             <td>{s.totalPrice}</td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>

//                             <div className="popup-buttons">
//                                 <button className="btn btn-info btn-sm" onClick={()=> exportPDF
//                                     (selectedProduct, productSales)}>Download PDF</button>
//                                     <button className="btn bnt-danger btn-sm" onClick={()=> 
//                                     setPopupVisible(false)}>❌ Close </button>
//                             </div>
//                             </>
//                           );
//                         })()}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );

// }