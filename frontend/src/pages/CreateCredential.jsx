import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import { FaUndo, FaExclamationTriangle, FaTimes, FaSpinner } from 'react-icons/fa'; // Added FaSpinner

function CreateCredential() {

  const [otpToken, setOtpToken] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  
  // NEW: State for Reset Confirmation Modal
  const [showResetModal, setShowResetModal] = useState(false);

  // NEW: Loading state for Send OTP button
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Initial State for Form Data
  const initialFormState = {
    constituencyNo: '',
    partNo: '',
    officerName: '',
    officerConstituency: '', 
    emailId: '',
    username: '',
    password: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const BASE_URL = import.meta.env.VITE_PORT;

  // --- RESET FUNCTIONS ---
  
  // 1. Triggered by the button
  const handleResetClick = () => {
    setShowResetModal(true);
  };

  // 2. Logic execution
  const executeReset = () => {
    setFormData(initialFormState);
    setOtp('');
    setOtpToken('');
    setGeneratedOtp('');
    setIsOtpSent(false);
    setIsVerified(false);
    setOtpTimer(0);
    setCanResend(false);
    setIsSendingOtp(false); // Reset loading state
    setShowResetModal(false); // Close modal
    toast.info("Form reset successfully.");
  };

  // 1. Send OTP Logic
  const handleSendOtp = async () => {
    if (!formData.emailId) {
      toast.error("Please enter an Email ID first.");
      return;
    }

    setIsSendingOtp(true); // Start Loader

    try {
      const res = await axios.post(`${BASE_URL}/api/admin/send-otp`, {
        email: formData.emailId
      });

      if (res.data.status === "success") {
        setGeneratedOtp(null); 
        setOtpToken(res.data.token); 
        setIsOtpSent(true);
        setIsVerified(false);
        setOtp("");
        setCanResend(false);
        setOtpTimer(360);

        toast.success("OTP sent successfully!");
        startOtpTimer();
      } else {
        toast.error(res.data.message || "Failed to send OTP");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Server error sending OTP");
    } finally {
      setIsSendingOtp(false); // Stop Loader regardless of result
    }
  };

  const startOtpTimer = () => {
    let time = 300;
    const interval = setInterval(() => {
      time -= 1;
      setOtpTimer(time);

      if (time <= 0) {
        clearInterval(interval);
        setCanResend(true);
      }
    }, 1000);
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    handleSendOtp(); 
  };

  // 2. Helper to generate credentials
  const generateCredentials = () => {
    const constituencySlug = formData.officerConstituency
      ? formData.officerConstituency.trim().toLowerCase().replace(/\s+/g, '')
      : 'const';

    const nameSlug = formData.officerName
      ? formData.officerName.trim().toLowerCase().replace(/\s+/g, '.')
      : 'user';

    const username = `${constituencySlug}@${nameSlug}`;
    const randomPass = Math.random().toString(36).slice(-8) + "#@1";

    setFormData(prevState => ({
      ...prevState,
      username,
      password: randomPass
    }));
  };

  // 3. Verify OTP Logic
  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error("Enter the OTP");
      return;
    }
    if (!otpToken) {
      toast.error("OTP token missing. Send OTP again.");
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/api/admin/verify-otp`, {
        otp: otp,
        token: otpToken
      });

      if (res.data.status === "success") {
        setIsVerified(true);
        generateCredentials();
        toast.success("OTP Verified Successfully!");
      } else {
        toast.error(res.data.message || "Invalid OTP");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP verification failed");
    }
  };

  // 4. Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isVerified) {
      toast.warning("Please verify OTP first.");
      return;
    }

    const payload = {
      emailId: formData.emailId,
      constituencyNo: formData.constituencyNo,
      officerConstituency: formData.officerConstituency,
      partNo: formData.partNo,
      officerName: formData.officerName,
      username: formData.username,
      password: formData.password
    };

    try {
      const res = await axios.post(`${BASE_URL}/api/admin/create-officer`, payload);

      if (res.data.status === true || res.data.status === "success") {
        toast.success("Officer Created Successfully!");
      } else {
        toast.error(res.data.message || "Failed to create officer");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Server error creating officer");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-6 px-4">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* --- RESET CONFIRMATION MODAL START --- */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up border border-gray-200">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-50 to-white p-4 border-b border-gray-100 flex justify-between items-center">
               <div className="flex items-center gap-2 text-red-600 font-bold">
                  <FaExclamationTriangle />
                  <span>Confirm Reset</span>
               </div>
               <button onClick={() => setShowResetModal(false)} className="text-gray-400 hover:text-gray-600">
                  <FaTimes />
               </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 text-center">
               <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                 Are you sure you want to clear all data and start over? <br/>
                 <span className="font-bold text-red-500">This action cannot be undone.</span>
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
      {/* --- RESET CONFIRMATION MODAL END --- */}

      {/* CARD CONTAINER */}
      <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
        
        {/* DECORATIVE STRIP */}
        <div className="h-1.5 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>

        <div className="p-6 md:p-8">
          
          {/* HEADER SECTION */}
          <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-200 pb-4 mb-6">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
               <img 
                 src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/1200px-Emblem_of_India.svg.png" 
                 alt="Emblem" 
                 className="h-12 w-auto" 
               />
               <div>
                 <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Election Commission of India</h3>
                 <h2 className="text-xl font-serif font-bold text-blue-900">Create Officer Credential</h2>
               </div>
            </div>
            
            {/* Location Inputs (Top Right) */}
            <div className="flex gap-3 bg-gray-50 p-2 rounded-lg border border-gray-200">
               <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Constituency No</label>
                  <input 
                    type="text" 
                    name="constituencyNo"
                    className="w-20 px-1 py-1 bg-white border border-gray-300 rounded text-center text-sm font-medium focus:ring-1 focus:ring-blue-900 focus:outline-none" 
                    value={formData.constituencyNo}
                    onChange={handleChange}
                    placeholder="e.g. 123"
                  />
               </div>
               <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Part No</label>
                  <input 
                    type="text" 
                    name="partNo"
                    className="w-20 px-1 py-1 bg-white border border-gray-300 rounded text-center text-sm font-medium focus:ring-1 focus:ring-blue-900 focus:outline-none" 
                    value={formData.partNo}
                    onChange={handleChange}
                    placeholder="e.g. 15"
                  />
               </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* SECTION 1: OFFICER DETAILS */}
            <div>
              <h4 className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-3 border-l-4 border-orange-600 pl-2">
                1. Officer Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Officer Full Name</label>
                  <input 
                    type="text" 
                    name="officerName"
                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-900 transition text-sm"
                    value={formData.officerName}
                    onChange={handleChange}
                    placeholder="Enter name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Officer Constituency Name</label>
                  <input 
                    type="text" 
                    name="officerConstituency"
                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-900 transition text-sm"
                    value={formData.officerConstituency}
                    onChange={handleChange}
                    placeholder="Enter Constituency Name"
                    required
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: VERIFICATION */}
            <div>
              <h4 className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-3 border-l-4 border-orange-600 pl-2">
                2. Verification
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                 
                 {/* Email Input */}
                 <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="flex gap-2">
                        <input 
                          type="text" 
                          name="emailId"
                          className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-900 transition disabled:opacity-60 text-sm"
                          value={formData.emailId}
                          onChange={handleChange}
                          placeholder="officer@election.gov.in"
                          required
                          disabled={isVerified}
                        />
                        {!isVerified && (
                           <button 
                             type="button" 
                             onClick={canResend ? handleResendOtp : handleSendOtp}
                             disabled={isSendingOtp}
                             className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded transition whitespace-nowrap flex items-center gap-2 
                               ${isSendingOtp ? 'bg-blue-200 text-blue-500 cursor-not-allowed' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
                           >
                             {isSendingOtp && <FaSpinner className="animate-spin text-sm" />}
                             {isSendingOtp ? "Sending..." : (canResend ? "Resend OTP" : "Send OTP")}
                           </button>
                        )}
                    </div>
                 </div>

                 {/* OTP Input */}
                 {isOtpSent && !isVerified && (
                    <div className="animate-fade-in">
                       <label className="block text-xs font-medium text-gray-700 mb-1">Enter OTP {otpTimer > 0 && <span className="text-red-500">({otpTimer}s)</span>}</label>
                       <div className="flex gap-2">
                           <input 
                             type="text" 
                             maxLength="6"
                             className="w-full px-3 py-1.5 bg-white border-2 border-orange-200 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 transition text-sm"
                             value={otp}
                             onChange={(e) => setOtp(e.target.value)}
                             placeholder="6-digit OTP"
                           />
                           <button 
                             type="button" 
                             onClick={handleVerifyOtp}
                             className="px-3 py-1.5 bg-green-600 text-white text-[10px] font-bold uppercase rounded hover:bg-green-700 transition shadow-md whitespace-nowrap"
                           >
                             Verify
                           </button>
                       </div>
                    </div>
                 )}
                 
                 {isVerified && (
                   <div className="flex items-center pb-2 text-green-600 font-bold gap-2 text-sm">
                      <span className="text-lg">✓</span> Verified
                   </div>
                 )}
              </div>
            </div>

            {/* SECTION 3: CREDENTIALS */}
            <div className={`transition-opacity duration-500 ${isVerified ? 'opacity-100' : 'opacity-50 grayscale'}`}>
              <h4 className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-3 border-l-4 border-orange-600 pl-2">
                3. Credentials (Auto Generated)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
                 <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Username</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-gray-600 font-mono text-sm"
                      value={formData.username}
                      readOnly
                      placeholder="Pending..."
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Password</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-gray-600 font-mono text-sm"
                      value={formData.password}
                      readOnly
                      placeholder="Pending..."
                    />
                 </div>
              </div>
            </div>

            {/* ACTION BUTTONS (SUBMIT + RESET) */}
            <div className="pt-4 border-t border-gray-100 flex gap-4 justify-center">
              
              {/* Reset Button (Triggers Modal) */}
              <button 
                type="button" 
                onClick={handleResetClick}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded shadow hover:bg-gray-300 transition-all uppercase tracking-wider text-sm flex items-center gap-2"
              >
                <FaUndo /> Reset
              </button>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="flex-1 max-w-xs px-6 py-3 bg-blue-900 text-white font-bold rounded shadow-lg hover:bg-blue-800 hover:shadow-xl transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
                disabled={!isVerified}
              >
                Create Official Credential
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateCredential;