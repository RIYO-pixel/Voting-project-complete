import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSearch, FaUserTie, FaFilter, FaDownload, FaTimes, FaSave, FaUser, FaMapMarkerAlt, FaEnvelope, FaFingerprint, FaLock, FaExclamationTriangle } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";

// Libraries for PDF Export
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function OfficerList() {
  const [officers, setOfficers] = useState([]);
  const API = import.meta.env.VITE_PORT; 
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editOfficer, setEditOfficer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    constituency: '',
    partNo: ''
  });

  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        const response = await axios.get(`${API}/api/admin/all-officers`);
        console.log("Fetched Officers:", response.data);
        const formatted = response.data.map((o, index) => ({
          id: index + 1, 
          name: o.officerName,
          emailId: o.emailId,
          constituency: o.officerConstituency,
          constituencyNo: o.constituencyNo,
          partNo: o.partNo,
          username: o.username,
          raw: o
        }));
        setOfficers(formatted);
      } catch (err) {
        toast.error("Failed to load officers");
      }
    };
    fetchOfficers();
  }, [API]);

  // --- ACTIONS ---

  // 1. Logic to actually delete the officer (Called by the Toast)
  const executeDelete = async (emailId) => {
    try {
      const res = await axios.delete(`${API}/api/admin/delete-officer/${emailId}`);
      if (res.data.status) {
        setOfficers(prev => prev.filter(o => o.emailId !== emailId));
        toast.success("Officer removed successfully.");
      } else {
        toast.error(res.data.message || "Failed to delete officer.");
      }
    } catch (error) {
      toast.error("Server error while deleting officer.");
    }
  };

  // 2. The Trigger: Shows the Confirmation Toast
  const handleDelete = (emailId) => {
    const toastId = toast.info(
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
           <FaExclamationTriangle className="text-red-500 text-lg" />
           <p className="text-sm font-bold text-gray-800">Confirm Deletion</p>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          Are you sure you want to permanently remove this officer? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2 mt-1">
          <button
            onClick={() => toast.dismiss(toastId)}
            className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(toastId); // Close the confirm toast
              executeDelete(emailId); // Run the delete logic
            }}
            className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 rounded hover:bg-red-700 shadow-sm transition"
          >
            Yes, Delete
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,        // Keeps it open until clicked
        closeOnClick: false,     // Prevents accidental closing
        draggable: false,
        hideProgressBar: true,
        theme: "light",
        style: { minWidth: '320px' }
      }
    );
  };

  const handleEdit = async (emailId) => {
    // Legacy prompt logic (fallback)
    const constituencyNo = prompt("Update Constituency No:");
    const partNo = prompt("Update Part No:");
    if (!constituencyNo || !partNo) {
      toast.error("Both fields are required.");
      return;
    }
    try {
      const res = await axios.put(`${API}/api/admin/update-officer/${emailId}`, {
        constituencyNo,
        partNo
      });
      if (res.data.status) {
        toast.success("Officer updated successfully.");
        setOfficers(prev =>
          prev.map(o =>
            o.emailId === emailId ? { ...o, constituencyNo, partNo } : o
          )
        );
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error("Error updating officer.");
    }
  };

  // --- PDF EXPORT FUNCTION ---
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(30, 58, 138); 
    doc.rect(0, 0, 210, 20, 'F'); 
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text("Election Commission of India", 14, 13);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.text("Authorized Officer Registry", 14, 30);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 36);

    const tableColumn = ["ID", "Name", "Email", "Constituency", "Part No"];
    const tableRows = [];
    filteredOfficers.forEach(officer => {
      const officerData = [
        officer.id,
        officer.name,
        officer.emailId,
        officer.constituency,
        officer.partNo,
      ];
      tableRows.push(officerData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 138] },
      styles: { fontSize: 10 },
    });
    doc.save(`Officer_List_${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("PDF Downloaded Successfully");
  };

  // --- FILTER LOGIC ---
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ name: '', constituency: '', partNo: '' });
    setSearchTerm('');
  };

  const filteredOfficers = officers.filter(officer => {
    const matchesGlobal = 
        officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        officer.constituency.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesName = officer.name.toLowerCase().includes(filters.name.toLowerCase());
    const matchesConstituency = officer.constituency.toLowerCase().includes(filters.constituency.toLowerCase());
    const matchesPart = officer.partNo.toLowerCase().includes(filters.partNo.toLowerCase());
    return matchesGlobal && matchesName && matchesConstituency && matchesPart;
  });

  const handleSaveEdit = async () => {
    try {
      const updates = {
        officerName: editOfficer.officerName,
        officerConstituency: editOfficer.officerConstituency,
        constituencyNo: editOfficer.constituencyNo,
        partNo: editOfficer.partNo,
        emailId: editOfficer.emailId
      };
      const res = await axios.put(
        `${API}/api/admin/update-officer/${editOfficer.emailId}`,
        updates
      );
      if (res.data.status) {
        toast.success("Officer updated successfully.");
        setOfficers(prev =>
          prev.map(o =>
            o.emailId === editOfficer.emailId ? { ...o, ...updates } : o
          )
        );
        setIsEditOpen(false);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error("Server error while updating officer.");
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto my-10 px-4">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* MAIN CARD */}
      <div className="bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200 flex flex-col min-h-[700px]">
        
        {/* DECORATIVE TOP STRIP */}
        <div className="h-2 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>

        {/* HEADER SECTION */}
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
             <img 
               src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/1200px-Emblem_of_India.svg.png" 
               alt="Emblem" 
               className="h-16 w-auto" 
             />
             <div>
               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Election Commission of India</h3>
               <h2 className="text-2xl font-serif font-bold text-blue-900">Authorized Officer Registry</h2>
             </div>
          </div>

          {/* TOOLBAR */}
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="relative group">
               <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 group-focus-within:text-blue-900">
                  <FaSearch />
               </span>
               <input 
                 type="text" 
                 className="w-full md:w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition text-sm font-medium"
                 placeholder="Global Search..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            
            <div className="flex gap-2">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-bold transition shadow-sm ${showFilters ? 'bg-blue-100 border-blue-300 text-blue-900' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                    <FaFilter className={showFilters ? 'text-blue-900' : 'text-gray-400'} /> 
                    {showFilters ? 'Hide Filters' : 'Filter'}
                </button>
                <button 
                  onClick={exportPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg text-sm font-bold hover:bg-blue-800 transition shadow-md"
                >
                    <FaDownload /> Export PDF
                </button>
            </div>
          </div>
        </div>

        {/* ADVANCED FILTER ROW */}
        {showFilters && (
          <div className="bg-gray-50 p-4 border-b border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
            <input 
               type="text" name="name" placeholder="Filter by Name" value={filters.name} onChange={handleFilterChange}
               className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
            />
            <input 
               type="text" name="constituency" placeholder="Filter by Constituency" value={filters.constituency} onChange={handleFilterChange}
               className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
            />
            <input 
               type="text" name="partNo" placeholder="Filter by Part No" value={filters.partNo} onChange={handleFilterChange}
               className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
            />
            <button onClick={clearFilters} className="text-red-600 text-sm font-bold hover:underline flex items-center gap-1">
               <FaTimes /> Clear All
            </button>
          </div>
        )}

        {/* --- MODAL UI --- */}
        {isEditOpen && editOfficer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-fade-in-up border border-gray-200">
              
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3 text-white">
                  <FaUserTie className="text-xl opacity-80" />
                  <div>
                    <h2 className="text-lg font-bold tracking-wide">Update Officer Profile</h2>
                    <p className="text-xs text-blue-200 opacity-80">Officer ID: {editOfficer.emailId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="text-white hover:text-red-200 transition bg-white/10 hover:bg-white/20 p-2 rounded-full"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Personal Information */}
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Personal Information</label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Officer Full Name</label>
                        <div className="relative">
                          <FaUser className="absolute left-3 top-3 text-gray-400 text-sm" />
                          <input
                            type="text"
                            value={editOfficer.officerName}
                            onChange={(e) => setEditOfficer({ ...editOfficer, officerName: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm bg-gray-50 focus:bg-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Email Address</label>
                        <div className="relative">
                          <FaEnvelope className="absolute left-3 top-3 text-gray-400 text-sm" />
                          <input
                            type="email"
                            value={editOfficer.emailId}
                            onChange={(e) => setEditOfficer({ ...editOfficer, emailId: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm bg-gray-50 focus:bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 h-px bg-gray-100 my-1"></div>

                  {/* Assignment Details */}
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Polling Station Assignment</label>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Constituency Name</label>
                        <div className="relative">
                          <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400 text-sm" />
                          <input
                            type="text"
                            value={editOfficer.officerConstituency}
                            onChange={(e) => setEditOfficer({ ...editOfficer, officerConstituency: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm bg-gray-50 focus:bg-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Constituency No</label>
                        <input
                          type="text"
                          value={editOfficer.constituencyNo}
                          onChange={(e) => setEditOfficer({ ...editOfficer, constituencyNo: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm bg-gray-50 focus:bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Part No</label>
                        <input
                          type="text"
                          value={editOfficer.partNo}
                          onChange={(e) => setEditOfficer({ ...editOfficer, partNo: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm bg-gray-50 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 h-px bg-gray-100 my-1"></div>

                  {/* Security Credentials (Read Only) */}
                  <div className="md:col-span-2 bg-yellow-50 border border-yellow-100 p-4 rounded-lg">
                    <label className="text-xs font-bold text-yellow-700 uppercase tracking-wider mb-3 block flex items-center gap-2">
                      <FaLock className="text-yellow-600" /> Security Credentials (Locked)
                    </label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500">System Username</label>
                        <div className="relative">
                          <FaFingerprint className="absolute left-3 top-2.5 text-gray-400 text-sm" />
                          <input
                            type="text"
                            disabled
                            value={editOfficer.username}
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded bg-white text-gray-500 text-sm font-mono cursor-not-allowed select-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500">Password</label>
                        <input
                          type="password"
                          disabled
                          value="********"
                          className="w-full px-3 py-2 border border-gray-200 rounded bg-white text-gray-500 text-sm font-mono cursor-not-allowed select-none"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-6 py-2.5 rounded-lg bg-blue-900 text-white font-bold hover:bg-blue-800 shadow-md hover:shadow-lg transition transform active:scale-95 text-sm flex items-center gap-2"
                >
                  <FaSave /> Update Officer Record
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TABLE CONTENT (Unchanged) */}
        <div className="p-0 overflow-x-auto">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Officer Details</th>
                    <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Constituency</th>
                    <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Part No</th>
                    <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {filteredOfficers.length > 0 ? (
                    filteredOfficers.map((officer) => (
                      <tr key={officer.id} className="hover:bg-blue-50 transition-colors duration-150 group">
                         <td className="p-5">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 border border-blue-200">
                                  <FaUserTie />
                               </div>
                               <div>
                                  <p className="font-bold text-gray-800 text-sm">{officer.name}</p>
                                  <p className="text-xs text-gray-500">{officer.emailId}</p>
                               </div>
                            </div>
                         </td>
                         <td className="p-5">
                            <span className="inline-block px-3 py-1 rounded bg-gray-100 text-gray-700 text-xs font-bold border border-gray-200">
                              {officer.constituency}
                            </span>
                         </td>
                         <td className="p-5">
                            <p className="font-mono font-bold text-gray-700">{officer.partNo}</p>
                         </td>
                         <td className="p-5 text-center">
                            <div className="flex justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                               <button 
                                 onClick={() => {
                                  setEditOfficer(officer);
                                  setIsEditOpen(true);
                                 }}
                                 className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition tooltip"
                                 title="Edit Officer"
                               >
                                 <FaEdit size={16} />
                               </button>
                               <button 
                                 onClick={() => handleDelete(officer.emailId)}
                                 className="p-2 text-red-500 hover:bg-red-100 rounded-md transition tooltip"
                                 title="Revoke Access"
                               >
                                 <FaTrash size={16} />
                               </button>
                            </div>
                         </td>
                      </tr>
                    ))
                 ) : (
                    <tr>
                       <td colSpan="4" className="p-12 text-center text-gray-400">
                          <div className="flex flex-col items-center gap-2">
                             <FaSearch size={24} className="opacity-20" />
                             <p>No records found matching current filters.</p>
                             <button onClick={clearFilters} className="text-blue-600 text-sm font-bold hover:underline">Clear Filters</button>
                          </div>
                       </td>
                    </tr>
                 )}
              </tbody>
           </table>
        </div>

        {/* FOOTER / PAGINATION (Unchanged) */}
        <div className="bg-gray-50 border-t border-gray-200 p-4 flex justify-between items-center mt-auto">
           <p className="text-xs text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-800">{filteredOfficers.length}</span> records
           </p>
           <div className="flex gap-2">
              <button className="px-3 py-1 bg-white border border-gray-300 rounded text-xs font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1 bg-white border border-gray-300 rounded text-xs font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50" disabled>Next</button>
           </div>
        </div>

      </div>
    </div>
  );
}

export default OfficerList;