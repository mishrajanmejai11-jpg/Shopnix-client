import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Bill from "../customer/Bills";
// import CustomerLoginPopup from "../customer/CustomerLoginPopup";
import "./productlist.css";


export default function ProductList(props){
    const [itemcount,setItemcount]=useState(0);
    const [sellitem,setSellitem]=useState([]);
    const [quantities,setQuantities]=useState({});
    const [cid,setCid]=useState(null);
    const [customerSession,setCustomersession]=useState(null);
    const [pcatglist,setPcatglist]=useState([]);
    const [plist,setPlist]=useState([]);
    const [showlogin,setShowlogin]=useState(false);
    const [showbill,setShowbill]=useState(false);
    const [showplist,setShowplist]=useState([]);
    const [updatedlist,setUpdatelist]=useState(false);
    // const [increase,setIncrease]=useState('');
    // const [decrease,setdeccrease]=useState('');

    const purl="http://localhost:5511/product/";

    useEffect(()=>{
        setCid(props.data);

        axios.get(`${purl}showproduct`).then((res)=>{
            setPlist(res.data);
            setShowplist(res.data);
        }).catch(err=> toast.error(err));

        axios.get("http://localhost:5511/productcatg/showproductcatg").then((res)=>setPcatglist(res.data)).catch(err=>toast.error(err));

        const session=sessionStorage.getItem("Usersession")||localStorage.getItem("Usersession");
        if (session) {
            const obj=JSON.parse(session);
            setCustomersession(obj);
            setCid(obj.Cid);
        }
    },[props.data]);

    // const handleLoginSucces=(sessionData)=>{
    //     setCustomersession(sessionData);
    //     setCid(sessionData);
    //     setShowlogin(false);
    // };

    const handleFilterInc=(e)=>{
        const optn=e.target.value;
        console.log("optn",optn);
        if (optn==="0") {
            let filter=showplist;
            setPlist(filter);
            return;
        }
        if (optn==="increase") {
            //  alert("inc func call")
            let filter=showplist;
            let final= filter.sort((a,b)=> b.oprice-a.oprice);
            setPlist(final);
            if (updatedlist===false) {
                setUpdatelist(true);
            }else{setUpdatelist(false)}
            return;
        }
        if (optn==="decrease") {
            //  alert("dec func call")
            let filter=showplist;
            let final= filter.sort((a,b)=> a.oprice-b.oprice);
            setPlist(final);
            if (updatedlist===false) {
                setUpdatelist(true);
            }else{setUpdatelist(false)}
        }
    }
    //  const handleFilterdec=()=>{
    //     alert("dec func call");
    //      let filter=showplist;
    //    let final= filter.sort((a,b)=> a.oprice-b.oprice);
    //     setPlist(final);
    // }

    // const handleLogout=()=>{
    //     sessionStorage.removeItem("Usersession");
    //     localStorage.removeItem("Usersession");
    //     setCustomersession(null);
    //     setCid(null);
    //     setSellitem([]);
    //     setQuantities({});
    //     setItemcount(0);
    //     toast.warning("You have been logout");
    // };
    //buy button -adds or inc qnty
    const handleBuybtn=(pid)=>{
        setCid(props.data);
        if (!props.data) {
            setShowlogin(true);
            return;
        }
        axios.get(`${purl}showproduct/${pid}`).then(res=>{
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
                    setItemcount((prev)=> prev+1);
            }else{
                toast.warning("Product is Out of Stock. Cannot add to cart");
            }
        }).catch(err=> toast.error(err));

    };

    //direct buy bill btn
    const BuyBtn=(pid)=>{
        setCid(props.data);
        if (!props.data) {
            setShowlogin(true);
            return;
        }
        axios.get(`${purl}showproduct/${pid}`).then(res=>{
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

    //increase qnty
    const increaseQantity=(pid)=>{
        setQuantities((prev)=>({
            ...prev,[pid]:(prev[pid]||1)+1,
        }));
        setItemcount(prev=>prev+1);
    };

    const decreaseQnty=(pid)=>{
        setQuantities((prev)=>{
            let newQty=(prev[pid]||1)-1;
            if (newQty<=0) {
                setSellitem((old)=> old.filter((item)=> item.pid!==pid));
                const updated=Object.fromEntries(Object.entries(prev).filter((k)=>k!==String(pid)));
                const total=Object.values(updated).reduce((sum,v)=>sum+v,0);
                setItemcount(total);
                return updated;
            }
        });
    };

    const handleCheckOutBtn=()=>{
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
    const handleBuyBill=(p)=>{
        BuyBtn(p);
        setTimeout(() => {
            handleBuy();
        }, 1000);
    }

    const handlePaymentSuccess=()=>{
        setSellitem([]);
        setQuantities({});
        setItemcount(0);
        setShowbill(false);
    };
    //qantity update from bill

    const handleUpdateCart=(pid,newQty)=>{
        setQuantities((prev)=>{
            const updated={...prev,[pid]:newQty};
            const total=Object.values(updated).reduce((sum,v)=> sum+v,0);
            setItemcount(total);
            return updated;
        });
    };

    //item remove from bill

    const handleRemoveItem=(pid)=>{
        setSellitem((prev)=> prev.filter((item)=>item.pid !== pid));
        setQuantities((prev)=>{
            const updated={...prev};
            const total=Object.values(updated).reduce((sum,v)=>sum+v,0);
            setItemcount(total);
            return updated;
        });

    };

    const handleSearch=(evt)=>{
        const catgid=evt.target.value;
        const url=catgid>0?`${purl}showproductbycatg/${catgid}`:`${purl}showproduct`;
        axios.get(url).then(res=> setPlist(res.data)).catch(err=> toast.error(err));
    };


    if (showbill) {
        return(
            <Bill data={{sellitem,cid,quantities}} onBack={()=>setShowbill(false)} onPaymenSuccess={handlePaymentSuccess}
            onUpdatecart={handleUpdateCart} onRemoveitem={handleRemoveItem}></Bill>
        );
    }

    return(
        <>
        {/* {showlogin&& (
            <CustomerLoginPopup onClose={()=>setShowlogin(false)} onLoginSuccess={handleLoginSucces}></CustomerLoginPopup>
        )} */}

        {/* <div className={showlogin?"blured-content":""}>
            <div className="customer-info">
                {customerSession?(
                    <>
                    <span style={{marginLeft:"15px",fontWeight:"bold"}}>{itemcount}</span>
                    <button onClick={handleCheckOutBtn}>Checkout</button>
                    </>
                ):(
                   <span>Customer: Guest</span> 
                )}
            </div> */}
            <div className="customer_productlist_container">
                <div>
                    <center>
                        <label>Filter By Price:</label>
                        <select onChange={handleFilterInc}>
                            <option value="0" >select</option>
                            <option  value="increase" >Price High to Low</option>
                            <option value="decrease">Price Low to High</option>
                            </select>
                        <label>Search By Category</label>
                        <select onChange={handleSearch}>
                            <option value="0">All</option>
                            {pcatglist.map((pcatitem)=>(
                                <option key={pcatitem.pcatgid} value={pcatitem.pcatgid}>{pcatitem.pcatgname}</option>
                            ))}
                        </select>
                        {updatedlist?(<div className="product-list">
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
                        </div>):(<div className="product-list">
                                {plist.map((item)=>{
                                    const cname=pcatglist.find((c)=> c.pcatgid===item.pcatgid)?.pcatgname||"N/A";
                                    const Qty=quantities[item.pid]||0;
                                    return(
                                        <div className="product-card" key={item.pid}>
                                            <img className="product-img" src={item.ppicname} alt={item.ppicname}></img>
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
                        </div>)}
                    </center>
                </div>
            </div>
        </>
    );

}