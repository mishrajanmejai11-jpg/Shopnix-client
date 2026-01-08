import axios from "axios";
import React, { useEffect, useState } from "react";
import Bill from "../customer/Bills";
import { toast } from "react-toastify";
import CustomerLoginPopup from "../customer/CustomerLoginPopup";
import "./productlistformain.css"


export default function ProductListbyCatg({id,onback}){
    const [itemcount, setItemCount]=useState(0);
    const [sellitem,setSellitem]=useState([]);
    const [quantities,setQuantities]=useState({});
    const [cid,setCid]=useState(null);
    const [customerSession,setCustomerSession]=useState(null);
    const [pcatglist,setPcgatList]=useState([]);
    const [plist,setPlist]=useState([]);
    const [showlogin,setShowlogin]=useState(false);
    const [showBill,setShowbill]=useState(false);
    const [showplist,setShowplist]=useState([]);
    const [updatedlist,setUpdatelist]=useState(false);
    const [catgid,setCatgid]=useState(id);
    const url=process.env.REACT_APP_API_URL;
    const ProUrl=`${url}/product/`;
    useEffect(()=>{
        axios.get(`${ProUrl}showproductbycatg/${catgid}`).then((res)=>{
            setPlist(res.data.filter(product=>product.status===true)||[]);
            // setShowplist(res.data.filter(product=>product.status===true)||[]);
            // setShowplist(res.data)


        }).catch(err=> toast.error(err));

        axios.get(`${url}/productcatg/showproductcatg`).then((res)=>setPcgatList(res.data)).catch(err=>toast.error(err));
        const session=sessionStorage.getItem("Usersession")||localStorage.getItem("Usersession");
        if (session) {
            const obj=JSON.parse(session);
            setCustomerSession(obj);
            setCid(obj.Cid);
        }
    },[]);

    const handleLoginSucces=(sessionData)=>{
        setCustomerSession(sessionData);
        setCid(sessionData.Cid);
        setShowlogin(false);
    };

    // filter by price
    //  const handleFilterInc=(e)=>{
    //     const optn=e.target.value;
    //     console.log("optn",optn);
    //     if (optn==="0") {
    //         // let filter=showplist;
    //         setPlist(showplist);
    //         return;
    //     }
    //     if (optn==="increase") {
    //         //  alert("inc func call")
    //         let filter=showplist;
    //         let final= filter.sort((a,b)=> b.oprice-a.oprice);
    //         setPlist(final);
    //         if (updatedlist===false) {
    //             setUpdatelist(true);
    //         }else{setUpdatelist(false)}
    //         return;
    //     }
    //     if (optn==="decrease") {
    //         //  alert("dec func call")
    //         let filter=showplist;
    //         let final= filter.sort((a,b)=> a.oprice-b.oprice);
    //         setPlist(final);
    //         if (updatedlist===false) {
    //             setUpdatelist(true);
    //         }else{setUpdatelist(false)}
    //     }
    // }

    const handleLogout=()=>{
            sessionStorage.removeItem("Usersession");
            localStorage.removeItem("Usersession");
            setCustomerSession(null);
            setCid(null);
            setSellitem([]);
            setQuantities({});
            setItemCount(0);
            toast.warning("You have been logout");
        };

         const handleBuybtn=(pid)=>{
        // setCid(props.data);
        if (!cid) {
            setShowlogin(true);
            return;
        }
        axios.get(`${ProUrl}showproduct/${pid}`).then(res=>{
            if (res.data.status===true) {
                const selected=plist.find((item)=> item.pid===pid);
                if(!selected)return;

                setSellitem((prev)=>{
                    const already=prev.find(i=> i.pid===pid);
                    if(already)return prev;
                    return [...prev,selected];
                });
                setQuantities((prev)=>({...prev,[pid]:(prev[pid]||0)+1,
                    }));
                    setItemCount((prev)=> prev+1);
            }else{
                toast.warning("Product is Out of Stock. Cannot add to cart");
            }
        }).catch(err=> toast.error(err));

    };

    //increase qnty
    const increaseQantity=(pid)=>{
        setQuantities((prev)=>({
            ...prev,[pid]:(prev[pid]||1)+1,
        }));
        setItemCount(prev=>prev+1);
    };

    const decreaseQnty=(pid)=>{
        setQuantities((prev)=>{
            let newQty=(prev[pid]||1)-1;
            if (newQty<=0) {
                setSellitem((old)=> old.filter((item)=> item.pid!==pid));
                const updated=Object.fromEntries(Object.entries(prev).filter((k)=>k!==String(pid)));
                return updated;
            }
            return{...prev,[pid]:newQty};
        });
            setItemCount((prev)=>(prev>0?prev-1:0));
    };

    const handleCheckOutBtn=()=>{
        console.log("chekcout");
        if (!cid) {
            setShowlogin(true);
            return;
        }
        if (sellitem.length<=0) {
            toast.warning("Please buy some product before Checkout");
            return;
        }
        setShowbill(true);
    };
    // direct buy btn
     const handleBuy=()=>{
        console.log("chekcout");
        if (!cid) {
            setShowlogin(true);
            return;
        }
        // if (sellitem.length<=0) {
        //     toast.warning("Please buy some product before Checkout");
        //     return;
        // }
        setShowbill(true);
    };
     //direct buy bill btn
    const BuyBtn=(pid)=>{
        // setCid(props.data);
        if (!cid) {
            setShowlogin(true);
            return;
        }
        axios.get(`${ProUrl}showproduct/${pid}`).then(res=>{
            if (res.data.status===true) {
                const selected=plist.find((item)=> item.pid===pid);
                if(!selected)return;

                setSellitem((prev)=>{
                    const already=prev.find(i=> i.pid===pid);
                    if(already)return prev;
                    return [...prev,selected];
                });
                setQuantities((prev)=>({...prev,[pid]:(prev[pid]||0)+1,
                    }));
                //     setItemcount((prev)=> prev+1);
            }else{
                toast.warning("Product is Out of Stock. Cannot add to cart");
            }
        }).catch(err=> toast.error(err));

    };

    const handleBuyBill=(p)=>{
        BuyBtn(p);
        setTimeout(() => {
            handleBuy();
        }, 1000);
    }
      const handlePaymentSuccess=()=>{
        setSellitem([]);
        setQuantities({});
        setItemCount(0);
        setShowbill(false);
    };
    //qantity update from bill

    const handleUpdateCart=(pid,newQty)=>{
        setQuantities((prev)=>({...prev,[pid]:newQty}))
            const total=Object.values({...quantities,[pid]:newQty}).reduce((sum,v)=> sum+v,0);
            setItemCount(total);        
    };

    //item remove from bill

    const handleRemoveItem=(pid)=>{
        setSellitem((prev)=> prev.filter((item)=>item.pid !== pid));
        setQuantities((prev)=>{
            const updated={...prev};
            delete updated[pid];
            return updated;
        });
         const total=Object.values(quantities).filter((_,key)=>key!==pid).reduce((sum,v)=> sum+v,0);
            setItemCount(total); 

    };

    const handleSearch=(evt)=>{
        const catgid=evt.target.value;
        const url=catgid>0?`${ProUrl}showproductbycatg/${catgid}`:`${ProUrl}showproduct`;
        axios.get(url).then(res=> setPlist(res.data)).catch(err=> toast.error(err));
    };

     if (showBill) {
            return(
                <Bill data={{sellitem,cid,quantities}} onBack={()=>setShowbill(false)} onPaymenSuccess={handlePaymentSuccess}
                onUpdatecart={handleUpdateCart} onRemoveitem={handleRemoveItem}></Bill>
            );
        }
    
        return(
            <>
            {showlogin&& (
                           <CustomerLoginPopup onClose={()=>setShowlogin(false)} onLoginSuccess={handleLoginSucces}></CustomerLoginPopup>
            )}
    
            <div className={showlogin?"blured-content":""}>
                <button onClick={()=>onback()}>Back</button>
                <div className="customer-info">
                    {customerSession?(
                        <>
                        <img src={customerSession.Cpicname} alt={customerSession.Cpicname} style={{borderRadius:50,height:150,width:150}}></img>
                        <span>{customerSession.Cfname}</span>
                        <span style={{marginLeft:"15px",fontWeight:"bold"}}>{itemcount}</span>
                        <button onClick={handleCheckOutBtn}>Checkout</button>
                        <button onClick={handleLogout}>Logout</button>
                        </>
                    ):(
                       <span>Customer: Guest</span> 
                    )}
                </div>
                <>
               <div>
                    <center>
                        {/* <label>Filter By Price:</label>
                        <select onChange={handleFilterInc}>
                            <option defaultValue="0" >select</option>
                            <option  value="increase" >Price High to Low</option>
                            <option value="decrease">Price Low to High</option>
                            </select>
                        <label>Search By Category</label>
                        <select className="Select"onChange={handleSearch}>
                            <option value="0">All</option>
                            {pcatglist.map((pcatitem)=>(
                                <option key={pcatitem.pcatgid} value={pcatitem.pcatgid}>{pcatitem.pcatgname}</option>
                            ))}
                        </select> */}
                        {/* {updatedlist?(<div className="product-list">
                                {plist.map((item)=>{
                                    const cname=pcatglist.find((c)=> c.pcatgid===item.pcatgid)?.pcatgname||"N/A";
                                    const Qty=quantities[item.pid]||0;
                                    return(
                                        <div className="product-card" key={item.pid}>
                                            <img className="product-img" src={`${ProUrl}getimage/${item.ppicname}`} alt={item.ppicname}></img>
                                            <h5>Discount OFFER -{`${item.discount}%`}</h5>
                                            <h4>{item.pname}</h4>
                                            <p>
                                               <span><del>MRP: ₹{item.pprice}{" "}</del> </span><br/>
                                                <span className="strike"> OFFER PRICE: ₹{item.oprice}</span>
                                            </p>
                                            <p>{cname}</p>
                                            {Qty > 0 ?(<div> 
                                               <button onClick={()=> decreaseQnty(item.pid)}>-</button>
                                               <span>{Qty}</span>
                                               <button onClick={()=>increaseQantity(item.pid)}>+</button>
                                               <button onClick={()=>handleRemoveItem(item.pid)}>Remove</button>
                                            </div>):(<button className="buy-btn" onClick={()=>handleBuybtn(item.pid)}>Add Cart</button>)}
                                            <button className="Buying-btn" onClick={()=> handleBuyBill(item.pid)}>Buy</button>
                                        </div>
                                    );
                                })}
                        </div>):(<div className="product-list">
                                {plist.map((item)=>{
                                    const cname=pcatglist.find((c)=> c.pcatgid===item.pcatgid)?.pcatgname||"N/A";
                                    const Qty=quantities[item.pid]||0;
                                    return(
                                        <div className="product-card" key={item.pid}>
                                            <img className="product-img" src={`${ProUrl}getimage/${item.ppicname}`} alt={item.ppicname}></img>
                                            <h5>Discount OFFER - {`${item.discount}%`}</h5>
                                            <h4>{item.pname}</h4>
                                            <p>
                                               <span><del>MRP: ₹{item.pprice}{" "}</del></span><br/>
                                                <span className="strike"> OFFER PRICE: ₹{item.oprice}</span>
                                            </p>
                                            <p>{cname}</p>
                                            {Qty > 0 ?(<div> 
                                               <button onClick={()=> decreaseQnty(item.pid)}>-</button>
                                               <span>{Qty}</span>
                                               <button onClick={()=>increaseQantity(item.pid)}>+</button>
                                               <button onClick={()=>handleRemoveItem(item.pid)}>Remove</button>
                                            </div>):(<button className="buy-btn" onClick={()=>handleBuybtn(item.pid)}>Add Cart</button>)}
                                            <button className="Buying-btn" onClick={()=> handleBuyBill(item.pid)}>Buy</button>
                                        </div>
                                    );
                                })}
                        </div>)} */}
                        <div className="product-list">
                                {plist.map((item)=>{
                                    const cname=pcatglist.find((c)=> c.pcatgid===item.pcatgid)?.pcatgname||"N/A";
                                    const Qty=quantities[item.pid]||0;
                                    return(
                                        <div className="product-card" key={item.pid}>
                                            <img className="product-img" src={item.ppicname} alt={item.ppicname}></img>
                                            <h5>Discount OFFER -{`${item.discount}%`}</h5>
                                            <h4>{item.pname}</h4>
                                            <p>
                                               <span><del>MRP: ₹{item.pprice}{" "}</del> </span><br/>
                                                <span className="strike"> OFFER PRICE: ₹{item.oprice}</span>
                                            </p>
                                            <p>{cname}</p>
                                            {Qty > 0 ?(<div> 
                                               <button onClick={()=> decreaseQnty(item.pid)}>-</button>
                                               <span>{Qty}</span>
                                               <button onClick={()=>increaseQantity(item.pid)}>+</button>
                                               <button onClick={()=>handleRemoveItem(item.pid)}>Remove</button>
                                            </div>):(<button className="buy-btn" onClick={()=>handleBuybtn(item.pid)}>Add Cart</button>)}
                                            <button className="Buying-btn" onClick={()=> handleBuyBill(item.pid)}>Buy</button>
                                        </div>
                                    );
                                })}
                        </div>
                    </center>
                </div>
                </>
                </div>
                </>
        )
}