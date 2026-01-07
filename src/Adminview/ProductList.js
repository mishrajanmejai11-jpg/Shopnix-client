  //     CODE FOR PRODUCT LIST VIEW FOR ADMIN MANAGE PRODUCTS ACTIVE/INACTIVE WITHOUT ACTIVATION PRODUCT PURCHASE OPTION WILL BE NOT AVAILABLE FOR CUSTOMER TO BUY PRODUCT.

   import React,{useEffect,useState} from "react";
   import axios from "axios";
   import ReactDOM from "react-dom/client";
   import Bill from "../customer/Bills";
    function ProductList(props)
    {
         const [itemcount,setItemCount] = useState(0);
         const [selitems,setSelItems] = useState([]);
         const [pcatglist,setPCatgList] = useState([]);
         const [plist,setPList] = useState([]);
         const [vlist,setVList] = useState([]);

         let cname="";

         useEffect(() => {
            axios.get("http://localhost:5511/product/showproduct").then((res) => {
                setPList(res.data);
            }).catch((err) => {
                alert(err);
            });

            axios.get("http://localhost:5511/productcatg/showproductcatg").then((res) => {
                setPCatgList(res.data);
            }).catch((err) => {
                 alert(err);
            });
        

                // GET VENDER

                axios.get("http://localhost:5511/vender/getallvender").then((res) => {
                    setVList(res.data);
                }).catch((err)=> {
                    alert(err);
                })
                 },[]);

                 const handleActiveButton=(evt) => {
                    let pid=parseInt(evt);
                    let status=true;
                    axios.put("http://localhost:5511/product/updateproductstatus/"+pid+"/"+status).then((res) => {
                      alert("Product Status Updated");
                 }).catch((err) => {
                    alert(err);
                 });
                 }

                 const handleInactiveButton=(evt) =>{
                 let pid=parseInt(evt);
                    let status=false;
                    axios.put("http://localhost:5511/product/updateproductstatus/"+pid+"/"+status).then((res) => {
                      alert("Product Status Updated");
                 }).catch((err) => {
                    alert(err);
                 }); 
                 }

                 const handleCheckOutButton=()=>{
                    alert("Hello");
                    if(selitems.length<=0)
                    {
                        alert("Please Buy Some Product");
                    }
                    else
                    {
                        const root=ReactDOM.createRoot(document.getElementById("root"));

                        let ccid=props.data;
                        let obj = {
                            selitems:selitems,
                        cid:ccid
                        };

                        root.render(<Bill data={obj}></Bill>)
                    }
                 }

                 const handleSearch=(evt)=>{
                    if(evt.target.value>0)
                    {
                        axios.get("http://localhost:5511/product/showproductbycatg/"+evt.target.value).then((res)=>{
                            setPList(res.data);
                        }).catch((err)=>{
                            alert(err);
                        });
                    }
                    else
                    {
                       axios.get("http://localhost:5511/product/showproduct").then((res)=>{
                            setPList(res.data);
                        }).catch((err)=>{
                            alert(err);
                        }); 
                    }
                 }

                 // PRODUCT SEARCH BY VENDER

                 const handleSearchByVender=(evt) => {
                    if(evt.target.value>0)
                    {
                        axios.get("http://localhost:5511/product/showproductbyvender/"+evt.target.value).then((res) => {
                            setPList(res.data);
                        }).catch((err)=> {
                            alert(err);
                        });
                    }
                    else
                    {
                         axios.get("http://localhost:5511/product/showproduct").then((res) => {
                            setPList(res.data);
                        }).catch((err)=> {
                            alert(err);
                        });
                    }
                 }

                    // PRODUCT SEARCH BY STATUS
                  
                      const handleSearchByStatus=(evt) => {
                    if(evt.target.value!=="0")
                    {
                        axios.get("http://localhost:5511/product/showproductbystatus/"+evt.target.value).then((res) => {
                            setPList(res.data);
                        }).catch((err)=> {
                            alert(err);
                        });
                    }
                    else
                    {
                         axios.get("http://localhost:5511/product/showproduct").then((res) => {
                            setPList(res.data);
                        }).catch((err)=> {
                            alert(err);
                        });
                    }
                 }

                 return(
                    <div className="ProDiv">
                       <center>
                        Search By Category <select onClick={handleSearch}>
                            <option value={0}>All</option>
                            {
                                pcatglist.map((itm) => (
                                    <option key={itm.pcatgid} value={itm.pcatgid}>{itm.pcatgname}</option>
                                ))
                            }
                        </select>

                        <p>
                            Search By Vender <select onClick={handleSearchByVender}>
                                <option value="0">All</option>
                                {
                                   vlist.map((vitem) =>(
                                    <option key={vitem.Vid} value={vitem.Vid}>{vitem.VenderName}</option>
                                   ))
                                }
                            </select>
                        </p>


                        <p>
                            Search By Status <select onClick={handleSearchByStatus}>
                                <option value="0">All</option>
                                <option value={true}>Active</option>
                                <option value={false}>Inactive</option>
                            </select>
                        </p>

                      <p style={{backgroundColor:"gray",color:"white" , width:"87%"}}>Product List</p> 
                      <table border={1} className="borrdrer">
                        <thead>
                        <tr>
                            <th>Id</th>
                            <th>Product Name</th>
                            <th>Price</th>
                            <th>Offer Price</th>
                            <th>Category</th>
                            <th>Photo</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                        {
                            plist.map((item) => (
                                <tr key={item.pid}>
                                    <td>{item.pid}</td>
                                    <td>{item.pname}</td>
                                    <td>{item.pprice}</td>
                                    <td>{item.oprice}</td>

                                    <td>
                                        {
                                            pcatglist.map((citem)=>{
                                                if(item.pcatgid==citem.pcatgid)
                                                {
                                                    cname=(citem.pcatgname)
                                                }
                                                 })
                                        }
                                        {cname}
                                    </td>

                              <td>
                                <img src={item.ppicname} height="100" width="100"></img>
                                </td>      

                                <td>{item.status?"Active":"Inactive"}</td>
                                <td>
                                    <button type="submit" onClick={() => handleActiveButton(item.pid)}>Active</button>
                                    <span></span>
                                <button type="submit" onClick={() => handleInactiveButton(item.pid)}>Inactive</button>
                                    </td>
                                </tr>
                            ))
                        }
                        </thead>
                        </table> 
                       </center>
                    </div>
                 );
   
                }

                export default ProductList;