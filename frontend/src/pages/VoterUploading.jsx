import React, { useState } from 'react';
import axios from "axios";
import { toast, ToastContainer } from "react-toastify"; // Added ToastContainer import
import 'react-toastify/dist/ReactToastify.css'; // Ensure CSS is imported
import { useNavigate } from "react-router-dom";
import { FaUndo, FaExclamationTriangle, FaTimes } from 'react-icons/fa'; // Import icons

function VoterUploading() {
  const initialFormState = {
    epicNo: '',
    name: '',
    age: '',
    aadharNo: '',
    constituencyNo: '',
    partNo: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [showResetModal, setShowResetModal] = useState(false); // Modal State

  const BASE_URL = import.meta.env.VITE_PORT;
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // --- RESET LOGIC ---
  const handleResetClick = () => {
    // If form is already empty, just show info toast
    const isEmpty = Object.values(formData).every(x => x === '');
    if (isEmpty) {
        toast.info("Form is already empty.");
        return;
    }
    setShowResetModal(true);
  };

  const executeReset = () => {
    setFormData(initialFormState);
    setShowResetModal(false);
    toast.info("Form reset successfully.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.age < 18) {
      toast.error("Voter must be at least 18 years old.");
      return;
    }

    if (!/^\d{12}$/.test(formData.aadharNo)) {
      toast.error("Aadhar number must be exactly 12 digits.");
      return;
    }

    try {
      const payload = {
        epicNo: formData.epicNo,
        constituencyNo: formData.constituencyNo,
        partNo: formData.partNo,
        name: formData.name,
        age: Number(formData.age),
        aadharNo: formData.aadharNo
      };

      console.log("Sending voter data:", payload);

      const res = await axios.post(
        `${BASE_URL}/api/admin/add-voter`,
        payload
      );

      if (res.status === 200) {
        toast.success(res.data || "Voter added successfully!");

        navigate("/admin/camera-signup", {
          state: { epicNo: formData.epicNo,candidate:payload}
        });

        setFormData(initialFormState);

      } else {
        toast.error(res.data.message || "Failed to add voter.");
      }

    } catch (err) {
      console.error("Error:", err);
      toast.error("Server error while adding voter.");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-10 px-4">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* --- RESET CONFIRMATION MODAL --- */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up border border-gray-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-50 to-white p-4 border-b border-gray-100 flex justify-between items-center">
               <div className="flex items-center gap-2 text-red-600 font-bold">
                  <FaExclamationTriangle />
                  <span>Confirm Reset</span>
               </div>
               <button onClick={() => setShowResetModal(false)} className="text-gray-400 hover:text-gray-600">
                  <FaTimes />
               </button>
            </div>
            {/* Body */}
            <div className="p-6 text-center">
               <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                 Are you sure you want to clear all data? <br/>
                 <span className="font-bold text-red-500">Unsaved changes will be lost.</span>
               </p>
               <div className="flex justify-center gap-3">
                  <button 
                    onClick={() => setShowResetModal(false)}
                    className="px-4 py-2 rounded-md bg-gray-100 text-gray-600 text-sm font-bold hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={executeReset}
                    className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-bold hover:bg-red-700 shadow-md transition"
                  >
                    Yes, Reset Form
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CARD */}
      <div className="bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200">
        
        {/* DECORATIVE TOP STRIP */}
        <div className="h-2 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>

        {/* HEADER SECTION */}
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
             <img 
               src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/1200px-Emblem_of_India.svg.png" 
               alt="Emblem" 
               className="h-16 w-auto" 
             />
             <div>
               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Election Commission of India</h3>
               <h2 className="text-2xl font-serif font-bold text-blue-900">Voter Data Entry</h2>
             </div>
          </div>

          {/* POLLING STATION CONTEXT BAR */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-6 py-2 flex gap-8 shadow-sm">
            {/* CONSTITUENCY */}
            <div className="text-center">
              <span className="block text-[10px] font-bold text-blue-800 uppercase tracking-wide">
                Constituency
              </span>
              <span className="block text-lg font-bold text-blue-900">
                <input
                  type="text"
                  name="constituencyNo"
                  value={formData.constituencyNo}
                  onChange={handleChange}
                  className="bg-transparent outline-none text-center w-20 font-bold text-blue-900 focus:border-b focus:border-blue-500"
                  placeholder="--"
                />
              </span>
            </div>

            <div className="w-px bg-blue-200"></div>

            {/* PART NO */}
            <div className="text-center">
              <span className="block text-[10px] font-bold text-blue-800 uppercase tracking-wide">
                Part No
              </span>
              <span className="block text-lg font-bold text-blue-900">
                <input
                  type="text"
                  name="partNo"
                  value={formData.partNo}
                  onChange={handleChange}
                  className="bg-transparent outline-none text-center w-12 font-bold text-blue-900 focus:border-b focus:border-blue-500"
                  placeholder="--"
                />
              </span>
            </div>
          </div>
        </div>

        {/* FORM CONTENT */}
        <div className="p-8 md:p-12">
           <form onSubmit={handleSubmit} className="space-y-8">
             
             {/* SECTION 1: IDENTITY */}
             <div>
                <h4 className="text-sm font-bold text-orange-600 uppercase tracking-wide mb-4 border-l-4 border-orange-600 pl-3">
                  1. Voter Identity
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">EPIC Number</label>
                      <input
                        type="text"
                        name="epicNo"
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-900 transition uppercase"
                        value={formData.epicNo}
                        onChange={handleChange}
                        placeholder="e.g. ABC1234567"
                        required
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Aadhar Number</label>
                      <input
                        type="text"
                        name="aadharNo"
                        maxLength="12"
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-900 transition"
                        value={formData.aadharNo}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 12) setFormData(prev => ({ ...prev, aadharNo: value }));
                        }}
                        placeholder="12 Digit Aadhar"
                        required
                      />
                   </div>
                </div>
             </div>

             {/* SECTION 2: PERSONAL DETAILS */}
             <div>
                <h4 className="text-sm font-bold text-orange-600 uppercase tracking-wide mb-4 border-l-4 border-orange-600 pl-3">
                  2. Personal Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-900 transition"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="As per official documents"
                        required
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                      <input
                        type="number"
                        name="age"
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-900 transition"
                        value={formData.age}
                        onChange={handleChange}
                        placeholder="Yrs"
                        min="18"
                        required
                      />
                   </div>
                </div>
             </div>

             {/* ACTION BUTTONS (RESET + SUBMIT) */}
             <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
                
                {/* Reset Button */}
                <button 
                  type="button" 
                  onClick={handleResetClick}
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded shadow hover:bg-gray-300 font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                >
                  <FaUndo /> Reset
                </button>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-3 rounded shadow-lg font-bold uppercase tracking-wider transition-all transform hover:scale-105"
                >
                  Upload Voter Record
                </button>
             </div>

           </form>
        </div>

        {/* FOOTER STRIP */}
        <div className="bg-gray-50 border-t border-gray-200 p-3 text-center">
           <p className="text-xs text-gray-400">Data Entry Module v2.1 • <span className="text-gray-600">Secure Connection</span></p>
        </div>

      </div>
    </div>
  );
}

export default VoterUploading;