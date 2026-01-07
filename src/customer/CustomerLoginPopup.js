
   import React,{useState,useEffect} from "react";
   import axios from "axios";
   import Cookies from "js-cookie";
   import "./customerloginpopup.css";


     export default    function CustomerLoginPopup({onClose, onLoginSuccess})
         {
             const [uid,setUId] = useState("");
             const [upass,setUPass] =useState("");
             const [isChecked,setIsChecked] = useState(false);
             const [loading,setLoading] = useState(false);
             const [authError,setAuthError] = useState("");

             useEffect(() => {
                const myCookies = Cookies.get("auth");

                if(myCookies)
                {
                    const obj = JSON.parse(myCookies);
                    setUId(obj.username);
                    setUPass(obj.password);
                }
             },[]);

             const handleLoginButton = async () => {
                setAuthError("");
                setLoading(true);

                try{
                    const res = await axios.post("http://localhost:5511/customer/login", 
                        {
                            Cuserid : uid,
                            Cuserpass : upass,
                        }
                    );

                    if(res.data.Cuserid)
                    {
                        if(res.data.Status === false)
                        {
                            alert("User not active. Please wait for admin activation");
                            setLoading(false);
                            return;
                        }

                        if(isChecked)
                        {
                            Cookies.set(
                                "auth",JSON.stringify({username:uid,password:upass}),{expires:7}
                            );
                        }

                        const sessionData = {
                            Cfname: res.data.Customername,
                            Cpicname: res.data.Cpicname,
                            Cid:res.data.Cid,
                        }

                        if(isChecked)
                        {
                            localStorage.setItem("userSession",JSON.stringify(sessionData));
                        }
                        else
                        {
                          sessionStorage.setItem("userSession",JSON.stringify(sessionData));
                        }

                        onLoginSuccess(sessionData);
                        onClose();

                    }

                    else
                    {
                        setAuthError("Authentication failed: Invalid ID or Password");
                    }
                } catch(err)
                {
                    if(err.response && err.response.status === 404)
                    {
                        setAuthError("Authentication failed : Invalid ID or Password");
                    }

                    else
                    {
                        setAuthError("Login failed:"+ (err.response?.data?.message || err.message));
                    }
                } finally
                {
                    setLoading(false);
                }
             };

             return(
    <div className="cl-popup-overlay">
        <div className="cl-popup-container">
            <span className="cl-popup-close" onClick={onClose}>&times;</span>
            <h4 className="cl-popup-header">Customer Login</h4>

            <input className="cl-popup-input" type="text" placeholder="User ID" value={uid} onChange={(e) => setUId(e.target.value)} />
            <input className="cl-popup-input" type="password" placeholder="Password" value={upass} onChange={(e) => setUPass(e.target.value)} />

            <div className="cl-popup-remember">
                <input type="checkbox" checked={isChecked} onChange={(e) => setIsChecked(e.target.checked)} />
                <span>Remember Me</span>
            </div>

            {authError && <p className="cl-popup-error">{authError}</p>}

            <button className="cl-popup-btn" onClick={handleLoginButton} disabled={loading}>
                {loading && <span className="cl-popup-spinner"></span>}
                {loading ? "Logging in..." : "Login"}
            </button>
        </div>
    </div>
);
         }


        //      return(
        //         <div className="login-1">
        //             <div className="login2">
        //                 <span className="loginclose" onClick={onClose}>*</span>
        //                 <h4>Customer Login</h4>
                       
        //                 <input type="text" placeholder="User ID" value={uid} onChange={(e) => setUId(e.target.value)}></input>

        //                 <input type="password" placeholder="Password" value={upass} onChange={(e) => setUPass(e.target.value)}></input>
                    
        //                 <div className="remember ">
        //                      <input type="checkbox" checked={isChecked} onChange={(e) => setIsChecked(e.target.checked)}></input>
        //                      <span>Remember ME</span>
        //                 </div>
        //                 {authError && <p className="error">{authError}</p>}

        //                 <button onClick={handleLoginButton} disabled={loading} style={{position : "relative", paddingLeft:loading ? "35px" : "12px"}}>

        //                    {loading && (
        //                     <span style={{position: "absolute",left:"10px",top:"50%",transform:"translateY(-50)",width:"16px",height:"16px",border:"2px solid #fff",borderTop:"2px solid transparent",borderRadius:"50%",animation:"spin 1s linear infinite"}}>
                                  
        //                     </span>
        //                    )}
        //                    {loading ? "Logging in..." : "Login"}

        //                 </button>
        //             </div>

        //              {/* SPINNER ANIMATION */}

        //              <style>
        //                 {`@keyframes spin {
        //                  0% {transform : translateY(-50%) rotate(0deg);}
        //                  100% {transform : tanslateY(-50) rotate(360deg) : }}`}
        //              </style>
        //         </div>
        //      );
        //  }
          
        //  export default CustomerLoginPopup;