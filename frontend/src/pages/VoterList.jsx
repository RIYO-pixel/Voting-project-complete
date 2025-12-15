import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSearch, FaUser, FaFilter, FaDownload, FaTimes, FaIdCard, FaExclamationTriangle, FaSave, FaMapMarkerAlt, FaCalendarAlt, FaFingerprint, FaLock } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';

function VoterList() {

  const BASE_URL = import.meta.env.VITE_PORT;

  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- MODAL STATE ---
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editVoter, setEditVoter] = useState(null);

  useEffect(() => {
    fetchVoters();
  }, []);

  const fetchVoters = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/all-voters`);

      const mappedVoters = res.data.map((voter, index) => ({
        id: index + 1,
        name: voter.name || "N/A",
        epicNo: voter.epicNo,
        age: voter.age ?? "N/A",
        aadhar: voter.aadharNo, 
        constituency: voter.constituencyNo || "N/A",
        partNo: voter.partNo || "N/A",
        status: voter.hasVoted ? "Done" : "Pending"
      }));

      setVoters(mappedVoters);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch voter list");
    } finally {
      setLoading(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    constituency: '',
    partNo: '',
    status: ''
  });

  // --- DELETE ACTION (TOAST) ---
  const executeDelete = async (epicNo) => {
    try {
      const res = await axios.delete(
        `${BASE_URL}/api/admin/delete-voter/${epicNo}`
      );

      if (res.data.status) {
        toast.success(res.data.message || "Voter deleted successfully");
        setVoters(prev => prev.filter(v => v.epicNo !== epicNo));
      } else {
        toast.error(res.data.message || "Deletion failed");
      }
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Server error while deleting voter"
      );
    }
  };

  const handleDelete = (epicNo) => {
    const toastId = toast.info(
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
           <FaExclamationTriangle className="text-red-500 text-lg" />
           <p className="text-sm font-bold text-gray-800">Confirm Deletion</p>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          Are you sure you want to remove this voter from the electoral roll? This action cannot be undone.
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
              toast.dismiss(toastId);
              executeDelete(epicNo);
            }}
            className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 rounded hover:bg-red-700 shadow-sm transition"
          >
            Yes, Delete
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        hideProgressBar: true,
        theme: "light",
        style: { minWidth: '320px', borderLeft: '4px solid #ef4444' }
      }
    );
  };

  // --- EDIT ACTION (MODAL) ---
  const handleEditClick = (voter) => {
    setEditVoter({ ...voter }); // Copy voter data to edit state
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const payload = {
        name: editVoter.name,
        age: Number(editVoter.age),
        constituencyNo: editVoter.constituency,
        partNo: editVoter.partNo
      };
  
      const res = await axios.put(
        `${BASE_URL}/api/admin/update-voter/${editVoter.epicNo}`,
        payload
      );
  
      if (res.data.status) {
        toast.success(res.data.message || "Voter updated successfully");
  
        // Update local state without refetching
        setVoters(prev =>
          prev.map(v =>
            v.epicNo === editVoter.epicNo ? { ...v, ...editVoter, age: Number(editVoter.age) } : v
          )
        );
        setIsEditOpen(false);
      } else {
        toast.error(res.data.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Server error while updating voter");
    }
  };

  // --- PDF EXPORT ---
  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFillColor(30, 58, 138); 
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text("Election Commission of India", 14, 13);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.text("Electoral Roll - Voter List", 14, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 36);

    const tableColumn = ["ID", "Name", "EPIC No", "Age", "Constituency", "Voting Status"];
    const tableRows = [];

    filteredVoters.forEach(voter => {
      const voterData = [
        voter.id,
        voter.name,
        voter.epicNo,
        `${voter.age} years`,
        `${voter.constituency} (Part ${voter.partNo})`,
        voter.status,
      ];
      tableRows.push(voterData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [255, 153, 51] }, 
      styles: { fontSize: 9 },
    });

    doc.save(`Voter_List_${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("Voter List Exported Successfully");
  };

  // --- FILTER LOGIC ---
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ constituency: '', partNo: '', status: '' });
    setSearchTerm('');
  };

  const filteredVoters = voters.filter(voter => {
    const matchesGlobal = 
        voter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voter.epicNo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesConstituency = voter.constituency.toLowerCase().includes(filters.constituency.toLowerCase());
    const matchesPart = voter.partNo.toLowerCase().includes(filters.partNo.toLowerCase());
    const matchesStatus = filters.status ? voter.status === filters.status : true;

    return matchesGlobal && matchesConstituency && matchesPart && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
        case 'Done': return 'bg-green-100 text-green-800 border-green-200';
        case 'Pending': return 'bg-orange-100 text-orange-800 border-orange-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
               <h2 className="text-2xl font-serif font-bold text-blue-900">Voter Electoral Roll</h2>
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
                 placeholder="Search Name or EPIC..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            
            <div className="flex gap-2">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-bold transition shadow-sm ${showFilters ? 'bg-orange-50 border-orange-300 text-orange-900' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                    <FaFilter className={showFilters ? 'text-orange-600' : 'text-gray-400'} /> 
                    {showFilters ? 'Hide Filters' : 'Filter'}
                </button>
                <button 
                  onClick={exportPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-bold hover:bg-green-800 transition shadow-md"
                >
                    <FaDownload /> Export List
                </button>
            </div>
          </div>
        </div>

        {/* FILTER ROW */}
        {showFilters && (
          <div className="bg-orange-50 p-4 border-b border-orange-100 grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
            <input 
               type="text" name="constituency" placeholder="Filter Constituency" value={filters.constituency} onChange={handleFilterChange}
               className="px-3 py-2 border border-orange-200 rounded text-sm focus:outline-none focus:border-orange-500"
            />
            <input 
               type="text" name="partNo" placeholder="Filter Part No" value={filters.partNo} onChange={handleFilterChange}
               className="px-3 py-2 border border-orange-200 rounded text-sm focus:outline-none focus:border-orange-500"
            />
            <select 
               name="status" value={filters.status} onChange={handleFilterChange}
               className="px-3 py-2 border border-orange-200 rounded text-sm focus:outline-none focus:border-orange-500 bg-white"
            >
               <option value="">All Voting Status</option>
               <option value="Done">Done</option>
               <option value="Pending">Pending</option>
            </select>
            <button onClick={clearFilters} className="text-red-600 text-sm font-bold hover:underline flex items-center gap-1">
               <FaTimes /> Clear All
            </button>
          </div>
        )}

        {/* --- PROFESSIONAL EDIT MODAL --- */}
        {isEditOpen && editVoter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-fade-in-up border border-gray-200">
              
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3 text-white">
                  <FaUser className="text-xl opacity-80" />
                  <div>
                    <h2 className="text-lg font-bold tracking-wide">Update Voter Details</h2>
                    <p className="text-xs text-blue-200 opacity-80">EPIC No: {editVoter.epicNo}</p>
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
                        <label className="text-sm font-medium text-gray-700">Voter Name</label>
                        <div className="relative">
                          <FaUser className="absolute left-3 top-3 text-gray-400 text-sm" />
                          <input
                            type="text"
                            value={editVoter.name}
                            onChange={(e) => setEditVoter({ ...editVoter, name: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm bg-gray-50 focus:bg-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Age</label>
                        <div className="relative">
                          <FaCalendarAlt className="absolute left-3 top-3 text-gray-400 text-sm" />
                          <input
                            type="number"
                            value={editVoter.age}
                            onChange={(e) => setEditVoter({ ...editVoter, age: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm bg-gray-50 focus:bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 h-px bg-gray-100 my-1"></div>

                  {/* Location Details */}
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Location Details</label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Constituency No</label>
                        <div className="relative">
                            <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400 text-sm" />
                            <input
                            type="text"
                            value={editVoter.constituency}
                            onChange={(e) => setEditVoter({ ...editVoter, constituency: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm bg-gray-50 focus:bg-white"
                            />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Part No</label>
                        <input
                          type="text"
                          value={editVoter.partNo}
                          onChange={(e) => setEditVoter({ ...editVoter, partNo: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm bg-gray-50 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 h-px bg-gray-100 my-1"></div>

                  {/* Identity Proofs (Locked) */}
                  <div className="md:col-span-2 bg-yellow-50 border border-yellow-100 p-4 rounded-lg">
                    <label className="text-xs font-bold text-yellow-700 uppercase tracking-wider mb-3 block flex items-center gap-2">
                      <FaLock className="text-yellow-600" /> Identity Proofs (Locked)
                    </label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500">EPIC Number</label>
                        <div className="relative">
                          <FaIdCard className="absolute left-3 top-2.5 text-gray-400 text-sm" />
                          <input
                            type="text"
                            disabled
                            value={editVoter.epicNo}
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded bg-white text-gray-500 text-sm font-mono cursor-not-allowed select-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500">Aadhar Number</label>
                        <div className="relative">
                            <FaFingerprint className="absolute left-3 top-2.5 text-gray-400 text-sm" />
                            <input
                            type="text"
                            disabled
                            value={editVoter.aadhar || "xxxx-xxxx-xxxx"}
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded bg-white text-gray-500 text-sm font-mono cursor-not-allowed select-none"
                            />
                        </div>
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
                  <FaSave /> Update Voter Record
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TABLE CONTENT */}
        <div className="p-0 overflow-x-auto">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Voter Details</th>
                    <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Identification</th>
                    <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Age</th>
                    <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Voting Status</th>
                    <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {filteredVoters.length > 0 ? (
                    filteredVoters.map((voter) => (
                      <tr key={voter.id} className="hover:bg-blue-50 transition-colors duration-150 group">
                         <td className="p-5">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 border border-gray-300">
                                  <FaUser />
                               </div>
                               <p className="font-bold text-gray-800 text-sm">{voter.name}</p>
                            </div>
                         </td>
                         <td className="p-5">
                            <div className="flex flex-col gap-1">
                               <span className="flex items-center gap-1 text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded w-fit">
                                 <FaIdCard size={10} /> {voter.epicNo}
                               </span>
                               <span className="text-[10px] text-gray-400">UID: {voter.aadhar ? `xxxx-${voter.aadhar.slice(-4)}` : 'N/A'}</span>
                            </div>
                         </td>
                         <td className="p-5 text-sm text-gray-700">
                            {voter.age} Yrs 
                         </td>
                         <td className="p-5">
                            <p className="text-xs font-bold text-gray-700">{voter.constituency}</p>
                            <p className="text-[10px] text-gray-500">Part No: {voter.partNo}</p>
                         </td>
                         <td className="p-5">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getStatusColor(voter.status)}`}>
                               {voter.status}
                            </span>
                         </td>
                         <td className="p-5 text-center">
                            <div className="flex justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                               <button 
                                 onClick={() => handleEditClick(voter)}
                                 className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition tooltip"
                                 title="Edit Voter"
                               >
                                 <FaEdit size={16} />
                               </button>
                               <button 
                                 onClick={() => handleDelete(voter.epicNo)}
                                 className="p-2 text-red-500 hover:bg-red-100 rounded-md transition tooltip"
                                 title="Delete Voter"
                               >
                                 <FaTrash size={16} />
                               </button>
                            </div>
                         </td>
                      </tr>
                    ))
                 ) : (
                    <tr>
                       <td colSpan="6" className="p-12 text-center text-gray-400">
                          <p>No voter records found matching filters.</p>
                       </td>
                    </tr>
                 )}
              </tbody>
           </table>
        </div>

        {/* PAGINATION */}
        <div className="bg-gray-50 border-t border-gray-200 p-4 flex justify-between items-center mt-auto">
           <p className="text-xs text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-800">{filteredVoters.length}</span> entries
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

export default VoterList;