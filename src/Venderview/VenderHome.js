
import React, { useEffect, useState } from 'react';
// import VendorSales from './VendorSales';
import EditVendorProfile from './EditVenderProfile';
import Product from '../ProductView/Product';
import VenderSales from './VenderSales.js';
import Venderchangepass from './Venderchangepass';
import InventoryDashboard from './InventoryDashboard.js';
// import './venderhome'



function VendorHome({ vender, onLogout }) {
  // Line 9: State initialization
  const [editing, setEditing] = useState(false);
  const [venderData, setVendorData] = useState(vender); // Using prop 'vendor' for initial state
  const [isShowProduct, setIsShowProduct] = useState(false);
  const [isShrunk, setIsShrunk] = useState(false);
  // const [isShowSales, setIsShowSales] = useState('');
  const [isInventory, setIsInventory]= useState(false);
  const [isShowVendorSales, setIsShowVendorSales] = useState(false); // Likely for view/manage sales
  const [isChangepass,setIsChangepass]=useState(false)

  // Line 17: Effect to handle window scroll for 'shrinking' header
  useEffect(() => {
    // Shrink header on scroll
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsShrunk(true);
      } else {
        setIsShrunk(false);
      }
    };
    window.addEventListener('scroll', handleScroll);

    // Cleanup function
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  console.log("vpicname",vender.Vpicname);

  return (
    <div className='home-page'>
      {/* Line 29: STICKY TOP BAR */}
      <div className='top-header'
        style={{
          width:'99%',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center', // Center or 'space-between' based on full code
          justifyContent: 'space-between',
          padding: isShrunk ? '5px 15px' : '15px 25px',
          background: isShrunk ? '#c27f7fff' : '#1e75ccff', // Background color change
          borderRadius: isShrunk ? '0px 0px 5px 5px' : '0px 0px 0px 0px',
          border: isShrunk ? '1px solid #250404ff' : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Vendor Info */}
        <div style={{ display: 'flex', alignItems: 'center' }} className='vender-image'>
          <img
            src={venderData.Vpicname}
            alt="Vendor Profile"
            style={{
              width: isShrunk ? 40 : 70,
              height: isShrunk ? 40 : 70,
              borderRadius: '50%',
              transition: 'all 0.3s ease',
            }}
          />
          <div className='vender-info' style={{ marginLeft: '10px' }}>
            <p style={{ margin: 0, fontSize: '20px', transition: '0.3s' }}>
              <b>{venderData.VenderName}</b>
            </p>
            {/* Line 55: Conditional display based on isShrunk state */}
            {!isShrunk && (
              <>
                <p style={{ margin: 0, fontSize: '14px', }}>
                  Email: {venderData.Vemail}
                </p>
                <p style={{ margin: 0, fontSize: '14px' }}>
                  Contact: {venderData.Vcontact}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className='action-btn' style={{ display: 'flex', gap: '10px' }}>
          {/* Edit Profile / Close Edit Button */}
          <button className='btn-edit'
            onClick={() => {
              setEditing((prev) => !prev);
              setIsShowProduct(false); // hide product if editing
              setIsChangepass(false);
              setIsInventory(false);
              setIsShowVendorSales(false); //hide change password if editing
            }}
            type="button"
            style={{
              padding: isShrunk ? '5px 10px' : '8px 15px',
              borderRadius: '5px',
              background: editing ? 'gray' : 'white',
              color: editing ? 'white' : 'black',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            {editing ? 'Close Edit' : 'Edit Profile'}
          </button>
          <button onClick={()=>{
            setIsChangepass((prev)=> !prev);
            setEditing(false);
            setIsShowProduct(false);
            setIsInventory(false);
            setIsShowVendorSales(false);
          }}   style={{
              padding: isShrunk ? '5px 10px' : '8px 15px',
              borderRadius: '5px',
              background: isChangepass ? 'gray' : 'white',
              color: isChangepass ? 'white' : 'black',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}>
            {isChangepass? "Close Password":"Change Password"}
          </button>

          {/* Close Product / Manage Product Button */}
          <button className='btn-manage-product'
            onClick={() => {
              setIsShowProduct((prev) => !prev);
              setEditing(false); // hide edit if showing product
              setIsChangepass(false); // hide the chnage password if product is showing
              setIsInventory(false);
              setIsShowVendorSales(false);
            }}
            type="button"
            style={{
              padding: isShrunk ? '5px 10px' : '8px 15px',
              borderRadius: '5px',
              background: isShowProduct ? 'gray' : 'white',
              color: isShowProduct ? 'white' : 'black',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            {isShowProduct ? 'Close Product' : 'Manage Product'}
          </button>

          {/* View Sales / Close View Sales Button */}
          <button className='btn-view-sale'
            onClick={() => {
              setIsShowVendorSales((prev) => !prev);
              setEditing(false);
              setIsChangepass(false);
              setIsShowProduct(false);
              setIsInventory(false);
              // setIsShowSales((prev) => !prev); // This state seems redundant or used for a different view
            }}
            type="button"
          >
            {isShowVendorSales ? 'Close View Sales' : 'View Sales'}
          </button>

           {/* inventory  InventoryDashboard */}

           <button className='btn-view-sale'
            onClick={() => {
              setIsInventory((prev) => !prev);
                setEditing(false);
              setIsChangepass(false);
              setIsShowProduct(false);
              setIsShowVendorSales(false);
              // setIsShowSales((prev) => !prev); // This state seems redundant or used for a different view
            }}
            type="button"
          >
            {isInventory ? 'Close Inventory' : 'View Inventory'}
          </button>


          {/* Logout Button */}
          <button className='btn-logout'
            onClick={() => {
              localStorage.removeItem('vendorSession'); // Remove session on logout
              onLogout(); // Call the passed down logout function
            }}
            type="button"
            style={{
              padding: '8px 15px',
              borderRadius: '5px',
              background: 'red',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            Logout
          </button>
        </div>
      </div>
      {/* --- END STICKY TOP BAR --- */}

      {/* Line 133: MAIN CONTENT AREA */}
      <div className='main-container' style={{ padding: '20px' ,paddingTop:'0px'}}>
        {editing && (
          <EditVendorProfile
            vender={venderData}
            onClose={() => setEditing(false)}
            onUpdate={(updated) => setVendorData(updated)}
          />
        )}
        {isChangepass && (<div className='change-password-box'>
          <Venderchangepass CUserid={vender.Vid|| vender.Vuserid} 
          data={vender.Vuserid}
          onClose={()=>setIsChangepass(false)}></Venderchangepass>
        </div>)}
        {/* Conditional rendering for other components */}
        {isShowProduct && <Product data={vender.Vid} />}
        {/* Sales management conditional view */}
        {isInventory && <InventoryDashboard vid={vender.Vid}/>}
        {/* '// isShowSales === "sales" && <Sales vendor={vendor} />' (Commented out) */}
        {isShowVendorSales && <VenderSales vender={vender} />}
      </div>
    </div>
  );
}

export default VendorHome;


// export default function VendorHome({ vender, onLogout }) {
//     return(
//         <div>
//             <h4>WELCOME {vender}</h4>
//             <h4>hello{onLogout}</h4>
//         </div>
//     )
// }