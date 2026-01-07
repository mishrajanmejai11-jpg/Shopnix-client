
 import React,{useState} from "react";
 import { useNavigate } from "react-router-dom";
 import StateMgt from "./StateMgt.js";
 import CityMgt from "./CityMgt.js";
 import ProductCatMgt from "./ProductCatgMgt";
 import VenderMgt from "./VenderMgt.js";
 import ShowBills from "./ShowBills.js"
 import ProductList from "./ProductList";
 import CustomerMgt from "./CustomerMgt.jsx";
 import UpdateOrderStatus from "./UpdateOrderStatus";
import "./adminhome.css";
 import AdminVenderSales from "./AdminVendorSales.js";


 function AdminHome()
 {
    const [isstateshow,setIsStateShow] = useState(false);
    const [iscityshow,setIsCityShow] = useState(false);
    const [ispcatgshow,setIsPCatgShow] = useState(false);
    const [isvendershow,setIsVenderShow] = useState(false);
    const [isbillshow,setIsBillShow] = useState(false);
    const [isproductlistshow,setIsProductListShow] = useState(false);
    const [iscustomershow,setIsCustomerShow] = useState(false);
    const [isupdateordershow,setIsUpdateOrderShow] = useState(false);
    const [isvendersalesshow,setIsVenderSalesShow] = useState(false);
    const navigate = useNavigate();

    function LogOutButtonClick()
    {
        localStorage.removeItem("admintoken");
        navigate("/home");
    }

    return(
        <div className="AdimHome">
            <center>
                <h3>Admin DashBoard</h3>
                <div className="adboard">
                    <div className="admindiv">
                    <button onClick={() => setIsStateShow(!isstateshow)} className="badmin" >State</button>
          
     <button onClick={() => setIsCityShow(!iscityshow)} className="badmin" >City</button> 

      <button onClick={() => setIsPCatgShow(!ispcatgshow)} className="badmin">Category</button> 

      <button onClick={() => setIsVenderShow(!isvendershow)} className="badmin" >Vender</button> 

     <button onClick={() => setIsBillShow(!isbillshow)} className="badmin">Bills</button> 

     <button onClick={() => setIsUpdateOrderShow(!isupdateordershow)}className="badmin" >Order Status</button> 

     <button onClick={() => setIsProductListShow(!isproductlistshow)}  className="badmin">Product</button> 

     <button onClick={() => setIsCustomerShow(!iscustomershow)} className="badmin" >Customer</button> 

     <button onClick={() => setIsVenderSalesShow(!isvendersalesshow)}  className="badmin">Vender Sales</button> 
      
     <button onClick={LogOutButtonClick} className="badmin" >Logout</button>
     </div>
                </div>

                {isstateshow && <StateMgt/>}
                {iscityshow && <CityMgt/>}
                {ispcatgshow && <ProductCatMgt/>}
                {isvendershow && <VenderMgt/>}
                {isbillshow && <ShowBills/>}
                {isproductlistshow && <ProductList/>}
                {iscustomershow && <CustomerMgt/>}
                {isupdateordershow && <UpdateOrderStatus updateByName={"Admin"}/>}
                {isvendersalesshow && <AdminVenderSales/>}
            </center>
        </div>
    )
 }
  export default AdminHome;
