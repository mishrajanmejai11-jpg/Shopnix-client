import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "./bill.css";

export default function Bill({data,onBack,onPaymentSuccess,onUpdatecart,onRemoveitem}){
    const [customer,setCustomer]=useState({name:"",address:"",contact:"",email:"",});
    const [date,setDate]=useState("");
    const [items,setItems]=useState([]);
    const [quantities,setQuantities]=useState({});
    const [ispaymentDone,setPaymentDone]=useState(false);
    const [billid,setBillid]=useState("");
    const [isProcessing,setProcessing]=useState(false);
    const url=process.env.REACT_APP_API_URL;
    const getCurrentDate=()=>{
        const d=new Date();
        return `${d.getDate()}-${d.getMonth()+1}-${d.getFullYear()}`;
    };

    useEffect(()=>{
        if(!data){
            alert("data not found");
            setItems([]);
            setQuantities({});
            return;
        }
        setDate(getCurrentDate());
        const sel=data.sellitem??data.items??[];
        setItems(sel);

        const qtyobj={};
        (sel||[]).forEach(item => {
            const key=String(item.pid);
            qtyobj[item.pid]=data.quantities?.[key]??data.quantities?.[item.pid]??1;
        });
        setQuantities(qtyobj);
        if (data.cid) {
            axios.get(`${url}/customer/getcustomerdetails/${data.cid}`).then(res=>{
                const body=res.data||{};
                setCustomer({name:body.Customername||body.name||"",address:body.Caddress||body.address||"",contact:body.Ccontact||body.contact||"",email:body.Cemail||"mishrajanmejai11@gmail"});
            }).catch(()=>{
                setCustomer({name:"",address:"",contact:""});
            });
        }
    },[data]);
    const totalAmount=items.reduce((acc,item)=>acc+(item.oprice||0)+(quantities[item.pid]||1),0);

    const increaseQty=(pid)=>{
        setQuantities((prev)=>{
            const newQty=(prev[pid]||1)+1;
            onUpdatecart?.(pid,newQty);
            return{...prev,[pid]:newQty};
        });
    };
    const decreaseQty=(pid)=>{
        setQuantities((prev)=>{
            const newqty=Math.max((prev[pid]||1)-1,1);
            onUpdatecart?.(pid,newqty);
            return {...prev,[pid]:newqty};
        });
    };

    const removeItem=(pid)=>{
        setItems((prev)=>prev.filter((it)=> it.pid!==pid));
        setQuantities((prev)=>{
            const q={...prev};
            delete q[pid];
            return q;
        });
        onRemoveitem?.(pid);
    };

    const loadScript=(src)=> new Promise((resolve)=>{
        const existing=document.querySelector(`script[src="${src}"]`);
        if(existing) return resolve(true);
        const script=document.createElement("script");
        script.src=src;
        script.onload=()=> resolve(true);
        script.onerror=()=> resolve(false);
        document.body.appendChild(script);
    });

    const saveBill=useCallback(async () => {
        if (!items.length)return null;
        const res=await axios.get(`${url}/bill/getbillid`);
        const nextId=parseInt(res.data?.[0]?.billid||0,10)+1;
        setBillid(nextId);
        const today=getCurrentDate();

        
        for (const item of items) {
         const qty=quantities[item.pid]||1;
         const Pid=item.pid;
         const obj={billid:nextId,billdate:today,Cid:data.cid,Pid,qty};
         await axios.post(`${url}/bill/billsave`,obj).then((res)=>toast.success(res.data.bill)).catch(err=>toast.error(err))
         const sale ={venderId:item.vid,productId:Pid,quantity:qty,totalPrice:item.oprice*qty,billid:nextId,date:today,}
         await axios.post(`${url}/sales/add`,sale);
        }
        return nextId;
    },[items,quantities,data?.cid]);

    const buildPurchaseItem=()=> items.map((item)=>({pid:item.pid,vid:item.vid,qty:quantities[item.pid]||1}));

    const callinventoryPurchase=async (puchaseitem) => {
        if (!puchaseitem|| puchaseitem.length===0) {
            return {succes:true,message:"no items to purchase"};}

            // const base="${url}";
            // const endpoint="/intventory/purchase";
            let lastError=null;
            // for (const ep of endpoint){
                try {
                    const res=await axios.post(`${url}/inventory/purchase`,{items:puchaseitem});
                    // alert(res.data.message);
                    // const res=await axios.post(base+ep,{items:puchaseitem});
                    if (res&&(res.data?.success||res.status===200)) {
                        return{succes:true,data:res.data};
                    }
                    return {succes:false,message:res.data?.message||"unknown response",data:res.data};
                } catch (error) {
                    lastError=error;
                }
            // }
            return{succes:false,message:lastError?.message||"inventory API failed",error:lastError};
    };

    const displayRozarpay=async () => {
        if (ispaymentDone) {
            toast.warning("Payment is already Done!");
            return;
        }
        if (isProcessing) return;
        if (!items.length) {
            toast.warning("No items in bill");
            return;
        }
        setProcessing(true);
        let savedBillid=null;
        // try {
        //     savedBillid=await saveBill();
        // } catch (error) {
        //     toast.warning("failed to save bill details. Payment aborted");
        //     setProcessing(false);
        //     return;
        // }
        const sdkLoaded=await loadScript("https://checkout.razorpay.com/v1/checkout.js");
        if (!sdkLoaded) {
            toast.warning("Failed to load Razorpay SDK. are you Online");
            setProcessing(false);
            return;
        }
        try {
            try {
            savedBillid=await saveBill();
        } catch (error) {
            toast.warning("failed to save bill details. Payment aborted");
            setProcessing(false);
            return;
        }
            const amountPaisa=Math.round(totalAmount*100);
            const order=await axios.post(`${url}/payment/orders/${amountPaisa}`);
            const {id:order_id,amount,currency}=order.data;

            const option={
                key:"rzp_test_8CxHBNuMQt1Qn8",
                amount:amount.toString(),
                currency,
                name:"Universal Informatics Pvt. Ltd.",
                description:"Order Payment",
                image:"pending",
                order_id,
                handler:async function (response) {
                    try {
                        await axios.post(`${url}/paymentdetail/paymentdetailsave`,{
                            orderCreationId:order_id,
                            razorpayPaymentId:response.razorpay_payment_id,
                            razorpayOrderId:response.razorpay_order_id,
                            razorpaySignature:response.razorpay_signature,
                            cid:data.cid,
                            amount:amount/100,
                            billid:savedBillid,
                            email:customer.email,
                            Customername:customer.name,
                        }).then(res=>toast.success(res.data.message));


                        const purchaseItems=buildPurchaseItem();
                        // alert("inv")
                        // console.log("purchase item",purchaseItems);
                        const invRes=await callinventoryPurchase(purchaseItems);
                        // alert("inv complete");
                        // console.log("inventory",invRes);
                        if (!invRes.succes) {
                            toast.warning("Payment is Succeeded, but inventory update failed,checked server logs");
                        }else{
                            setPaymentDone(true);
                            toast.success("Payment Successfull and Inventory Updated");
                        }
                        onPaymentSuccess?.();
                    } catch (error) {
                        toast.error("Payment is Succeeded but post-processing failed. Check Console");
                        onPaymentSuccess?.();
                    }finally{
                        setProcessing(false);
                    }
                },
                prefill:{
                    name:customer.name||"Customer",
                    email:"universal@gmail.com",
                    contact:customer.contact||"9532571972",
                },
                notes:{address:"Universal Informatics Indore Pvt. Ltd"},
                theme:{color:"#61dafb"},
            };
            new window.Razorpay(option).open();
        } catch (error) {
            toast.warning("Could Not Create payment order. Check Server.");
            setProcessing(false);
        }

    };


    return(
        <div className="bill-backdrop" role="dialog" aria-modal="true">
             <ToastContainer  autoClose={1800}  toastClassName="center-toast" />
            <div className="bill-card">
                <div className="bill-header">
                    <h3> Bill / Checkout</h3>
                    <div className="bill-header-action">
                        <button onClick={onBack}>Back</button>
                    </div>
                </div>
                <div>
                    <div>
                        <div><strong>Customer:</strong>{customer.name||""}</div>
                        <div><strong>Contact:</strong>{customer.contact||""}</div>
                        <div><strong>Address:</strong>{customer.address||""}</div>
                    </div>
                    <div>
                        <div><strong>Bill Date:</strong>{date}</div>
                        {billid?<div><strong>Bill ID:</strong>{billid}</div>:null}
                    </div>
                </div>
                    {(!data||!data.cid)&&<div className="bill-warning">Warning:- missing billing data</div>}
                    <div>
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Product</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Subtotal</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length?(items.map((item)=>{
                                    const qty=quantities[item.pid]||1;
                                    const subtotal=(item.oprice||0)*qty;
                                    return(
                                        <tr key={item.pid}>
                                            <td>{item.pid}</td>
                                            <td>{item.pname}</td>
                                            <td><button onClick={()=>decreaseQty(item.pid)}>-</button>
                                            <span>{qty}</span>
                                            <button onClick={()=>increaseQty(item.pid)}>+</button>
                                            </td>
                                            <td>₹{item.oprice}</td>
                                            <td>₹{subtotal}</td>
                                            <td>
                                                <button className="remove-btn" onClick={()=>removeItem(item.pid)}>Remove</button>
                                            </td>
                                        </tr>
                                    )
                                })):(<tr>
                                    <td colSpan="6" className="no-item">No Item Selected</td>
                                </tr>)}
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <div>Total: ₹{totalAmount}</div>
                        <div>
                            <button className="pay-btn" onClick={displayRozarpay} disabled={!items.length||isProcessing}>{isProcessing?"Processing...":ispaymentDone?"Paid":"Pay Now"}</button>
                        </div>
                    </div>
            </div>

        </div>
    );

}