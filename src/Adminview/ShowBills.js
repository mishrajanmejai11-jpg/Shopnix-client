import React,{ useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { toast } from "react-toastify";

function ShowBills(){
    const[custlist, setCustList]=useState([]);
    const[billdetailslist, setBillDetailsList]=useState([]);
    const[plist, setPList]=useState([]);
    const[grandTotal, setGrandTotal]=useState(0);
    const[selectedCustomer, setSelectedCustomer]=useState("");
    const[loadingPDF, setLoadingPDF]=useState(false);

        const url=process.env.REACT_APP_API_URL;

    //pagination
    const[currentPage, setCurrentPage]=useState(1);
    const billsPerPage= 3;

    useEffect(()=>{
        axios.get(`${url}/customer/getcustomer`).then((res)=> setCustList(res.data))
        .catch((err)=> toast.error(err));
        axios.get(`${url}/product/showproduct`).then((res)=> setPList(res.data))
        .catch((err)=> toast.error(err));
    },[]);

    const handleCustomerSelect=(evt)=>{
        const cid=evt.target.value;
        setSelectedCustomer(cid);

        axios.get(`${url}/bill/billshow/${cid}`).then((res)=>{
            const bills=res.data;
            const mergedBills=[];
            let totalSum=0;

            bills.forEach((bitem)=>{
                const productData=plist.find((p)=>p.pid===bitem.Pid);
                if(productData){
                    const product={
                        pname:productData.pname,
                        price:parseFloat(productData.oprice),
                        qty:bitem.qty || 1,
                        subtotal:parseFloat(productData.oprice)*(bitem.qty || 1),
                        pic:productData.ppicname,
                    };
                    let existingBill=mergedBills.find((bill)=> bill.billid===bitem.billid);

                    if(!existingBill){
                        existingBill={
                            billid:bitem.billid,
                            cid:bitem.cid,
                            billdate:bitem.billdate,
                            products:[],
                            total:0
                        };
                        mergedBills.push(existingBill);
                    }
                    existingBill.products.push(product);
                    existingBill.total+=product.subtotal;
                    totalSum+=product.subtotal;
                }
            });
            setBillDetailsList(mergedBills);
            setGrandTotal(totalSum);
            setCurrentPage(1);
        }).catch((err)=> alert(err));
    };

    //Pagination
    const indexofLast=currentPage*billsPerPage;
    const indexofFirst=indexofLast-billsPerPage;
    const currentBills=billdetailslist.slice(indexofFirst,indexofLast);
    const totalPages=Math.ceil(billdetailslist.length / billsPerPage);

    //Utility: convert image to Base64 for PDF
    const getBase64Image=async(url)=>{
        try{
            const respone=await fetch(url);
            const blob=await respone.blob();
            return new Promise((resolve)=>{
                const reader=new FileReader();
                reader.onloadend=()=> resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        }catch(err){
            console.error("Image load error: ", err);
            return null;
        }
    };

    //PDF Export with Images
    const downloadPDF=async()=>{
        setLoadingPDF(true); //SHOW SPINNER/TEXT
        let doc=new jsPDF();
        
        try{
            const pageWith=doc.internal.pageSize.getWidth();
            doc.setFont("helvetica", "blod");
            doc.setFontSize(18);
            const title="Customer Bills Report";
            const textWidth=doc.getTextWidth(title);
            const textX=(pageWith - textWidth)/2;
            doc.text(title, textX, 12);

            const customer=custlist.find((c)=> c.Cid===selectedCustomer);
            var found=false
            for(var i=0;i<custlist.length;i++){
                if(custlist[i].Cid===selectedCustomer){
                    found=true;
                    break;
                }
            }
            if(found===true){
                doc.setFontSize(12);
                doc.text(`Customer: ${custlist[i].Customername} (${custlist[i].Cid})`, 14, 25);
            }
            if(customer){
                doc.setFontSize(12);
                doc.text(`Customer: ${custlist.Customername} (${custlist.Cid})`, 14, 25);
            }
            let yPos=35;
            for(const bill of billdetailslist){
                doc.setFontSize(13);
                doc.text(`Bill ID: ${bill.billid} | Date: ${bill.billdate}`, 14, yPos);
                yPos+=6;

                //Prepare rows but store base64 image seperately (not in table text)
                const rows=[];
                const imageMap={};

                for(let i=0;i<bill.products.length;i++){
                    const prod=bill.products[i];
                    const imgUrl=custlist.Cpicname;
                    const base64Img=await getBase64Image(imgUrl);
                    if(base64Img) imageMap[i]=base64Img;

                    rows.push(["", //leave image cell empty for new
                        prod.pname,
                        prod.qty,
                        prod.price.toFixed(2),
                        prod.subtotal.toFixed(2), 
                    ]);
                }

                //Draw table
                doc.autoTable({
                    head:[["Image", "Product", "Qty", "Price", "Subtotal"]],
                    body:rows,
                    startY:yPos,
                    theme:"grid",
                    styles: { fontSize:11, cellPadding:3, minCellHeight:14},
                    didDrawCell:(data)=>{
                        //Draw image inside first colum cell, only for body rows(skip header)
                        if(
                            data.section==="body" && //ensure its not header
                            data.column.index===0 &&
                            imageMap[data.row.index]
                        ){
                            const base64Img=imageMap[data.row.index];
                            doc.addImage(base64Img, "JPEG", data.cell.x + 2, data.cell.y + 2, 10, 10);
                        }
                    },
                });
                yPos=doc.lastAutoTable.finalY + 5;
                doc.setFontSize(12);
                //doc.text(`Total: ₹${bill.total.toFixed(2)}`, 130, yPos);
                doc.text(`Total: ₹${bill.total.toFixed(2)}`, 142, yPos);
                //doc.text(`Total: ₹${bill.total.toFixed(2)}`, 130, yPos);
                yPos+=10;
            }

            //GrandTotal
            doc.setFontSize(14);
            doc.setTextColor(0, 100, 0);
            doc.text(`Grand Total: ${grandTotal.toFixed(2)}`, 110, yPos + 5);
            //doc.text(`Grand Total: ${grandTotal.toFixed(2)}`, 110, yPos + 5);
            doc.save("CustomerBills.pdf");
        }catch(err){
            console.error(err);
            alert("Error generating PDF");
        }finally{
            setLoadingPDF(false); //Hide spinner/text
        }
    };

    return(
        <div>
            <center>
                <h2>Bill List (Admin View)</h2>
                <table>
                    <tbody>
                        <tr>
                            <td>Customer: </td>
                            <td>
                                <select onChange={handleCustomerSelect}>
                                    <option value="">--Select Customer--</option>
                                    {custlist.map((item)=>(
                                        <option key={item.Cid} value={item.Cid}>
                                            {item.Customername} ({item.Cid})
                                        </option>
                                    ))}
                                </select>
                            </td>
                        </tr>
                    </tbody>
                </table>
                {billdetailslist.length > 0 ? (
                    <>
                    <table border={1} cellPadding={6} style={{marginTop:"20px"}}>
                        <thead style={{backgroundColor:"#ddd"}}>
                            <tr>
                                <th>Bill ID</th>
                                <th>Customer ID</th>
                                <th>Bill Date</th>
                                <th>Product Name</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Subtotal</th>
                                <th>Product Image</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentBills.map((bill)=>(
                                <React.Fragment key={bill.billid}>
                                    {bill.products.map((prod, idx)=>(
                                        <tr key={`${bill.billid}-${idx}`}>
                                            <td>{idx===0 ? bill.billid : ""}</td>
                                            <td>{idx===0 ? bill.cid : ""}</td>
                                            <td>{idx===0 ? bill.billdate : ""}</td>
                                            <td>{prod.pname}</td>
                                            <td>{prod.qty}</td>
                                            <td>{prod.price.toFixed(2)}</td>
                                            <td>{prod.subtotal.toFixed(2)}</td>
                                            <td>
                                                <img src={prod.pic}
                                                height="80" width="80" alt={prod.pname}/> </td>
                                        </tr>
                                    ))}

                                    {/* Per-Bill Total */}
                                    <tr style={{backgroundColor:"#fff8dc", fontWeight:"blod",}}>
                                        <td colSpan="6"></td>
                                        <td style={{borderTop:"2px solid #888", color:"green",
                                            textAlign:"center"}}>
                                                Total: ₹{bill.total.toFixed(2)}
                                            </td>
                                            <td></td>
                                    </tr>
                                </React.Fragment>
                            ))}

                            {/* Grand Total */}
                            <tr style={{backgroundColor:"#e6ffe6", fontWeight:"bold", fontSize:"16px"}}>
                                <td colSpan="6"></td>
                                <td style={{borderTop:"3px double #000", textAlign:"center", color:"darkgreen"}}>
                                    Grand Total: ₹{grandTotal.toFixed(2)}
                                </td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>

                    {/* PDF Button */}
                    <button onClick={downloadPDF} disabled={loadingPDF}
                    style={{
                        marginTop:"20px",
                        backgroundColor:"#007bff",
                        color:"white",
                        padding:"10px 25px",
                        border:"none",
                        borderRadius:"5px",
                        cursor:loadingPDF ? "not-allowed" : "pointer",
                        display:"flex",
                        alignItems:"center",
                        justifyContent:"center",
                        fontWeight:"bold",
                        fontSize:"16px",
                    }}>
                        {loadingPDF && (
                            <span style={{ border:"3px solid #f3f3f3", borderTop:"3px solid #00aaff",
                                borderRadius:"50%", width:"20px", height:"20px", display:"inline-block",
                                marginRight:"10px", animation:"spin 1s linear infinite",
                            }}></span>
                        )}
                        {loadingPDF ? "Generating PDF..." : "Download PDF"}

                        {/* Keyframes inline for spinner */}
                        <style>
                            {`@keyframes spin{
                            0%{ transform: rotate(0deg):}
                            100% { transform: rotate(360deg);}}`}
                        </style>
                    </button>
                    </>
                ) : (
                    <p style={{marginTop:"20px", color:"gray"}}>No bills to display.</p>
                )}

                {/* Pagination */}
                {totalPages>1 && (
                    <div style={{marginTop:"20px"}}>
                        <button disabled={currentPage===1} onClick={()=> setCurrentPage(currentPage-1)}>
                            Prev
                        </button>
                        <span style={{margin:"0 10px"}}>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button disabled={currentPage===totalPages} onClick={()=> setCurrentPage(currentPage+1)}>
                            Next
                        </button>
                    </div>
                )}
            </center>
        </div>
    );
}
export default ShowBills;