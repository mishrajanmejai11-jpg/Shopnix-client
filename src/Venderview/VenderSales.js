
   import React,{useState,useEffect,useRef} from "react";
   import axios from "axios";
   import jsPDF from "jspdf";
   import autoTable from "jspdf-autotable";
   import {Bar} from "react-chartjs-2";

   import {
       Chart as Chartjs,BarElement,CategoryScale,LinearScale,Tooltip,Legend
   } from "chart.js";
// import { data } from "react-router";

   import "./vendersale.css";

Chartjs.register(BarElement,CategoryScale,LinearScale,Tooltip,Legend);

 function VenderSales({vender,onLogout})
 {
    const [sales,setSales] = useState([]);
    const [salesSearch,setSalesSearch] = useState("");
    const [fromDate,setFromDate] = useState("");
    const [toDate,setToDate] = useState("");
    const [salesPage,setSalesPage] = useState(1)
    const [salesPerPage] = useState(10);
    const [grandTotal,setGrandTotal] = useState(0);
    const [productTotals,setProductTotals] = useState({});
    const [selectedProduct,setSelectedProduct] = useState(null);
    const [popupVisible,setPopupVisible] = useState(false);
    const [totalProductSold,setTotalProductSold] = useState(0);
    const chartRef = useRef(null);

    // FETCH SALES DATA

    useEffect(() => {
        console.log("vender",vender.Vid);
        if(!vender?.Vid) return;

        const fetchSales = async () => {
            try
            {
                const res = await axios.get(
                    `http://localhost:5511/sales/vender/${vender.Vid}`
                );
                setSales(res.data.sales || []);
            }
            catch (err)
            {
                console.error(err);
                alert("Error Fetching Sales Data");
            }
        };
        fetchSales();
    },[vender.Vid]);

    // FILTER LOGIC

    const filteredSales = sales.filter((s) => {
        const productName = s.product?.pname?.toLowerCase() || "";
        const billIdStr = s.billid? s.billid.toString() : "";
        const searchLower = salesSearch.toLowerCase();

        const matchSearch = productName.includes(searchLower) || billIdStr.includes(searchLower);
        const saleDate = new Date(s.date);

        const matchDate = (!fromDate || saleDate >= new Date(fromDate)) && (!toDate || saleDate <= new Date(toDate));
        return matchSearch && matchDate;
    });

    const totalPages = Math.ceil(filteredSales.length / salesPerPage);
    const startIndex = (salesPage -  1)* salesPerPage;
    const currentSales = filteredSales.slice(
        startIndex,startIndex + salesPerPage
    );

    // COMPUTE TOTALS

    useEffect(() => {
        const totalRevenue = filteredSales.reduce(
            (sum,s) => sum + (s.totalPrice || 0), 0
        );

        setGrandTotal(totalRevenue);
        const summary = {};

        let totalQty =0;
        filteredSales.forEach((s) => {
            const pname = s.product?.pname || "unknown";
            if(!summary[pname]) summary[pname] = {qty:0, revenue:0};

            summary[pname].qty += s.quantity;
            summary[pname].revenue += s.totalPrice;
            totalQty += s.quantity;
        });

        setProductTotals(summary);
        setTotalProductSold(totalQty);
    },[filteredSales])

    // CHART

    const productNames = Object.keys(productTotals);
    const colors = productNames.map((_,i) => `hsl(${(i * 45) % 360}, 70% , 55%)`);
    const chartData = {
        labels : productNames,
        datasets : [
            {
                label: "Revenue (₹)",
                data:Object.values(productTotals).map((p) => p.revenue),
                backgroundColor: colors,
                borderColor:colors.map((c) => c.replace("55%", "45%")),borderWidth:1,
            },
        ],
    };

    const chartOption = {
        responsive : true,
        plugins : {legend:{position:"top"}},
        scales:{y:{beginAtZero:true,ticks:{callback:(v) => `₹${v}`}}},
    };

    // EXPORT PDFS [MAIN + PER PRODUCTS]

    const exportPDF = async () => {
        const doc = new jsPDF();
        const currentDate = new Date().toLocaleDateString();
        doc.setFontSize(14);
        doc.text(`vender:${vender.VenderName}`,14,15);
        doc.text(`Date:${currentDate}`,14,22);
        doc.setFontSize(16);
        doc.text("Sales Report",150,15,{align:"right"});

        if(fromDate || toDate)
            doc.text(`(${fromDate || "Alt"} - ${toDate || "Now"})`,150,22,{align:"right",});

        // doc.autoTable({
        //     startY:30,
        //     head:[
        //         ["Bill ID","Date", "Product","Qty","Price","Offer Price","Total"],
        //     ],

        //     body:filteredSales.map((s) => [
        //         s.billid,
        //         new Date(s.date).toLocaleDateString(),
        //         s.product?.pname || "Unknown",
        //         s.quantity,
        //         s.product?.pprice || "-",
        //         s.product?.oprice || "-",
        //         s.totalPrice,
        //     ]),
        // });

// 👇 THIS LINE IS REQUIRED
autoTable(doc, {
  startY: 30,
  head: [
    ["Bill ID", "Date", "Product", "Qty", "Price", "Offer Price", "Total"],
  ],
  body: filteredSales.map((s) => [
    s.billid,
    new Date(s.date).toLocaleDateString(),
    s.product?.pname || "Unknown",
    s.quantity,
    s.product?.pprice || "-",
    s.product?.oprice || "-",
    s.totalPrice,
  ]),
});

doc.save("sales-report.pdf");


        let y = doc.lastAutoTable.finalY + 10;
        doc.text("per-Product Summart",14,y);
        // doc.autoTable({
        //        startY: y + 5,
        //        head: [["Product","Total Qty","Revenue"]],
        //        body:Object.keys(productTotals).map((p) => [
        //         p,productTotals[p].qty,
        //         productTotals[p].revenue,
        //        ]),

        // });
        autoTable(doc, {
  startY: y + 5,
  head: [["Product", "Total Qty", "Revenue"]],
  body: Object.keys(productTotals).map((p) => [
    p,
    productTotals[p].qty,
    productTotals[p].revenue,
  ]),
});

        y = doc.lastAutoTable.finalY + 10;
        doc.text(`Total Products Sold: ${setTotalProductSold}`, 14, y);
        y += 8;
        doc.text(`Grand Total Sales : ₹${grandTotal.toLocaleString("en-IN")}`,14, y);
        y +=15;

        if(chartRef.current)
        {
            const chartImage = chartRef.current.toBase64Image();
            const pageWidth = doc.internal.pageSize.getWidth();
            const chartWidth = 150;
            const chartHeight = 90;
            const x = (pageWidth - chartWidth) /2;
            doc.addImage(chartImage,"PNG",x,y, chartWidth,chartHeight);
        };
        doc.save(`Vender_${vender.Vid}_Sales_Report.pdf`);
    };

        const exportProductPDF = (productName,productSales) => {
            const doc = new jsPDF();
            const currentDate = new Date().toLocaleDateString();
            const product = productSales[0]?.product;
            doc.setFontSize(14);
            doc.text(`Vendor:${vender.VenderName}`,14,15);
            doc.text(`Date: ${currentDate}`,14,22);
            doc.setFontSize(16);
            doc.text(`${productName} - Sales Details`,150,15,{align:"right"});
            const startY = 30;
            doc.autoTable({
                startY,
                head:[["Bill ID","Date","Qty","Price","Offer Price","Total"]],
                body: productSales.map((s) => [
                    s.billid,
                    new Date(s.date).toLocaleDateString(),
                    s.quantity,
                    s.product?.pprice || "-",
                    s.product?.oprice || "-",
                    s.totalPrice,
                ]),
            });

            const totalRevenue = productSales.reduce((sum,s) => sum + s.totalPrice,0);
            const totalQty = productSales.reduce((sum,s) => sum + s.quantity,0);
            let y = doc.lastAutoTable.finalY + 10;
            doc.text(`Total qty sold: ${totalQty}`,14,y);
            y += 8;
            doc.text(`Total Revenue: ₹${totalRevenue.toLocaleDateString("en-IN")}`, 14, y);
            doc.save(`${productName}_Sales_Details.pdf`);
        };

        return (
            <div className="Vender-Sales-page">
                   {/* HEADER */}

                   <header>

                    <h3 >Vender Sales Report</h3>
                    <div
                       style={{
                    display:"flex",
                    alignItems:"center",
                    gap:"10px",
                    flex:"2 1 auto",
                    justifyContent:"center",
                   }}>

                      </div>

                       <div
                       style={{
                    display:"flex",
                    alignItems:"center",
                    gap:"10px",
                    flex:"2 1 auto",
                    justifyContent:"flex-end",
                   }}>

                    <button onClick={exportPDF} className="venderbtn" disabled={!filteredSales.length}>
                        Export PDF
                    </button>

                      </div>
                   </header>

                    {/* CONTENT  */}

                    <div className="vendercontent" style={{padding: "10px"}}>
                        <div className="venderfilters" style={{marginBottom:"15px"}}>
                    <input type="text" placeholder="Search by Bill ID or Product" value={salesSearch} onChange={(e) => {setSalesSearch(e.target.value); setSalesPage(1);}}></input>    
                    <div style={{display:"flex",gap:"5px",flexWrap:"wrap"}}>
                        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}></input>
                        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}></input>
                        <button onClick={() => {setFromDate(" "); setToDate("");}}>Reset</button>
                        </div>    
                        </div>

                        <div className="vendersaless">{filteredSales.length === 0 ? (
                            <p style={{textAlign:"center"}}>No Sales Found</p>
                        ) : (
                            <table border="1" cellPadding="8" style={{width:"100%"}}>
                                <thead>
                                    <tr>
                                        <th>Bill ID</th>
                                        <th>Date</th>
                                        <th>Product</th>
                                        <th>Qty</th>
                                        <th>Price</th>
                                        <th>Offer Price</th>
                                        <th>Total</th>
                                        <th>Photo</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {currentSales.map((s) => (
                                        <tr key={s._id}>
                                            <td>{s.billid}</td>
                                            <td>{new Date(s.date).toLocaleDateString()}</td>
                                            <td>{s.product?.pname}</td>
                                            <td>{s.quantity}</td>
                                            <td>{s.product?.pprice}</td>
                                            <td>{s.product?.oprice}</td>
                                            <td>{s.totalPrice}</td>

                                            <td>
                                                <img src={s.product?.ppicname || "default.png"} alt={s.product?.pname} style={{height:"45px",width:"45px",objectFit:"cover",borderRadius:"6px"}}></img>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        </div>
                        {totalPages > 1 && (
                            <div className="venderpaggination">
                                {Array.from({length:totalPages},(_, i) => (
                                    <button key={i} onClick={() => setSalesPage(i + 1)}
                                    style={{
                                        margin:"2px",
                                        backgroundColor:salesPage === i+1 ? "red" : "white",color:salesPage === i+1 ? "white" : "black",
                                    }}>{i + 1}</button>
                                ))}
                            </div>
                        )}

                        <h5>Per Product Summary</h5>
                        <table border="1" cellPadding="8" style={{width:"100%",color:"black"}}>
                            <thead>
                                <tr>
                                    <th>Photo</th>
                                    <th>Product</th>
                                    <th>Total Qty</th>
                                    <th>Total Revenue</th>
                                </tr>
                            </thead>

                            <tbody>
                                {Object.keys(productTotals).map((p) => {
                                    const product = sales.find((s) => s.product?.pname === p)?.product;
                                    return(
                                        <tr key={p} 
                                        onClick={() => {setSelectedProduct(p);
                                            setPopupVisible(true);
                                        }}
                                        style={{backgroundColor:"orange",cursor:"pointer"}}
                                        >

                                            <td>
                                    <img src={product?.ppicname || "default.png"} alt={p} style={{height:"45px",width:"45px",objectFit:"cover",borderRadius:"6px"}}></img>            
                                            </td>

                                            <td>{p}</td>
                                            <td>{productTotals[p].qty}</td>
                                            <td>{productTotals[p].revenue}</td>

                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                    <h5>Total Product Sold:{totalProductSold}</h5> 
                    <h5>Grand Total Sales : ₹{grandTotal.toLocaleString("en-IN")}</h5>

                    {Object.keys(productTotals).length > 0 && (
                        <details style={{marginTop:"20px"}}>
                            <summary>View Revenue Chart</summary>
                            <div style={{width:"100%",maxWidth:"800px",margin:"20px auto"}}>
                                <Bar ref={chartRef} data={chartData} options={chartOption}></Bar>
                            </div>
                        </details>
                    )}
                    </div>

                    {/* POPUP */}

                    {popupVisible && selectedProduct && (
                        <div className="venderpopup">
                            <div className="vendercontent">
                                {(() => {
                                    const productSales = filteredSales.filter((s) => s.product?.pname === selectedProduct);

                                    const totalQty = productSales.reduce((sum,s) => sum + s.quantity,0);

                                    const totalRevenue = productSales.reduce((sum,s) => sum + s.totalPrice,0);

                                    const product = productSales[0]?.product;

                                    return (
                                        <>
                                        <div className="venderpopupheader">
                                            <img src={`http://localhost:5511/product/getimage/${product?.ppicname || "default.png"}`} alt={selectedProduct}
                                            style={{
                                                width:"70px",
                                                height:"70px",
                                                objectFit:"cover",
                                                borderRadius:"8px",
                                                marginRight:"15px",
                                            }}></img>

                                            <div>
                                                <h2>{selectedProduct}</h2>
                                                <p>
                                                    <strong>Total Quantity Sold:</strong>
                                               {totalQty}
                                                </p>

                                                <p>
                                                    <strong>Total Revenue</strong> ₹{totalRevenue.toLocaleString("en-IN")}
                                                </p>
                                            </div>
                                        </div>

                                        <table className="venderPouuptable">
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
                                                {productSales.map((s) => (
                                                    <tr key={s._id}>
                                                        <td>{s.billid}</td>
                                                        <td>{new Date(s.date).toLocaleDateString()}</td>
                                                        <td>{s.quantity}</td>
                                                        <td>{s.product?.pprice}</td>
                                                        <td>{s.product?.oprice}</td>
                                                        <td>{s.totalPrice}</td>

                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        <div className="venderpop">
                                            <button className="venderbuttont" onClick={() => exportProductPDF(selectedProduct,productSales)}>
                                                DownLoad PDF
                                            </button>

                                            <button className="venderclose" onClick={() => setPopupVisible(false)}>Close</button>
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
export default VenderSales;