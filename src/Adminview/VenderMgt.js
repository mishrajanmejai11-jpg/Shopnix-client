import React, { useState, useEffect } from "react";
import axios from "axios";

 export default function VenderMgt() {
    const [venderlist, setVenderList] = useState([]);
    const [selectedVender, setSelectedVender] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editForm, setEditForm] = useState({
        VenderName: "",
        VAddress: "",
        VContact: "",
        VEmail: "",
        VPicName: null,
        previewImage: ""
    });

    useEffect(() => {
        fetchVenders();
    }, []);

    const fetchVenders = () => {
        axios.get("http://localhost:5511/vender/getallvender")
            .then(res => setVenderList(res.data))
            .catch(err => alert(err));
    };
    const toggleStatus = (vid, currentStatus) => {
        const newStatus = currentStatus === true ? false : true;
        axios.put(`http://localhost:5511/vender/vendermanage/${vid}/${newStatus}`)
            .then(res => {
                alert(res.data);
                fetchVenders();
            })
            .catch(err => alert(err));
    };

    const openEditModal = (vender) => {
        setSelectedVender(vender);
        setEditForm({
            VenderName: vender.VenderName,
            VAddress: vender.Vaddress,
            VContact: vender.Vcontact,
            VEmail: vender.Vemail,
            VPicName: null,
            previewImage: vender.Vpicname
                ? `http://localhost:5511/vender/getimage/${vender.Vpicname}`
                : ""
        });
        setShowModal(true);
    };

    const handleEditChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setEditForm({
                ...editForm,
                VPicName: files[0],
                previewImage: URL.createObjectURL(files[0]) // preview new image
            });
        } else {
            setEditForm({ ...editForm, [name]: value });
        }
    };

    const checkEmailDuplicate = async () => {
        const existing = venderlist.find(
            v => v.Vemail === editForm.VEmail && v.VuserId !== selectedVender.VUserId
        );
        return !!existing;
    };

    const handleEditSave = async () => {
        if (await checkEmailDuplicate()) {
            alert("This email is already used by another vender!");
            return;
        }

        const formData = new FormData();
        formData.append("VenderName", editForm.VenderName);
        formData.append("Vaddress", editForm.VAddress);
        formData.append("Vcontact", editForm.VContact);
        formData.append("Vemail", editForm.VEmail);
        if (editForm.VPicName) formData.append("file", editForm.VPicName);

        axios.put(`http://localhost:5511/vender/update/${selectedVender.Vuserid}`, formData)
            .then(res => {
                alert(res.data.message);
                setShowModal(false);
                fetchVenders();
            })
            .catch(err => alert(err));
    };


    return (
        <div>
            <center>
                <h4>Vendor List</h4>
                <table border={1}>
                    <thead>
                        <tr>
                            <th>Photo</th>
                            <th>VId</th>
                            <th>Vendor Name</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Action</th>
                            <th>Edit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {venderlist.map(item => (
                            <tr key={item.Vid}>
                                <td>
                                    {item.Vpicname && (
                                        <img
                                            src={`http://localhost:5511/vender/getimage/${item.Vpicname}`}
                                            alt="vendor" width="50"
                                        />
                                    )}
                                </td>
                                <td>{item.Vid}</td>
                                <td>{item.VenderName}</td>
                                <td>{item.Vemail}</td>
                                <td>{item.Status?"Active":"Inactive"}</td>
                                <td>
                                    <button onClick={() => toggleStatus(item.Vid, item.Status)}>
                                        {item.Status === false ? "Active" :"Inactive"}
                                    </button>
                                </td>
                                <td>
                                    <button onClick={() => openEditModal(item)}>Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </center>

            {/* Edit Modal */}
            {showModal && (
                <div style={{
                    position: "fixed", top: 0, left: 0,
                    width: "100%", height: "100%",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex", justifyContent: "center", alignItems: "center"
                }}>
                    <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", minWidth: "300px" }}>
                        <h3>Edit Vendor</h3>

                        <input
                            type="text"
                            name="VenderName"
                            value={editForm.VenderName}
                            onChange={handleEditChange}
                            placeholder="Vender Name"
                        /><br />

                        <input
                            type="text"
                            name="VAddress"
                            value={editForm.VAddress}
                            onChange={handleEditChange}
                            placeholder="Address"
                        /><br />

                        <input
                            type="text"
                            name="VContact"
                            value={editForm.VContact}
                            onChange={handleEditChange}
                            placeholder="Contact"
                        /><br />

                        <input
                            type="email"
                            name="VEmail"
                            value={editForm.VEmail}
                            onChange={handleEditChange}
                            placeholder="Email"
                        /><br />

                        {/* Existing or Preview Image */}
                        {editForm.previewImage && (
                            <div style={{ margin: "10px 0" }}>
                                <img src={editForm.previewImage} alt="Preview" width="100" />
                            </div>
                        )}

                        <input type="file" name="VPicName" onChange={handleEditChange} /><br/><br/>
                        <button onClick={handleEditSave}>Save</button>
                        <button onClick={() => setShowModal(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
}


