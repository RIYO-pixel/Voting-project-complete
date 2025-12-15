import React, { useState } from 'react';
import { useAuth } from '@/Context/AuthContext'; 
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { FaUserCircle, FaIdCard, FaFingerprint } from 'react-icons/fa';

function CandidateCheck() {
  const { authData } = useAuth();
  const navigate = useNavigate();
  
  const [epicNumber, setEpicNumber] = useState('');
  const [searchStatus, setSearchStatus] = useState('idle'); 
  const [candidateDetails, setCandidateDetails] = useState(null);  

  const BASE_URL = import.meta.env.VITE_PORT;

const handleCheck = async (e) => {
  e.preventDefault();

  if (!epicNumber.trim()) return;

  setSearchStatus("searching");
  setCandidateDetails(null);

  try {
    // ✅ SUCCESS → 200 OK
    const res = await axios.post(
      `${BASE_URL}/api/officer/verify-epic`,
      {
        epicNo: epicNumber,
        constituencyNo: authData.constituencyNo,
        partNo: authData.partNo
      }
    );

    // Only verified voter comes here
    setCandidateDetails(res.data.voter);
    setSearchStatus("found");

  }catch (err) {
  const message = err.response?.data?.message;

  if (message === "Voter has already voted") {
    setCandidateDetails({ name: "This voter" }); // ✅ IMPORTANT
    setSearchStatus("already-voted");
    return;
  }

  if (message === "Voter not found for given EPIC number") {
    setSearchStatus("not-found");
    return;
  }

  if (message === "Constituency number or Part number does not match") {
    setSearchStatus("mismatch");
    return;
  }

  setSearchStatus("not-found");
}
};





  const handleProceed = () => {
    if (candidateDetails) {
      navigate('/voter/verification', { state: { candidate: candidateDetails } });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8 px-4">
     

      {/* MAIN CARD */}
      <div className="bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200 min-h-[600px] flex flex-col">
        
        {/* DECORATIVE TOP STRIP */}
        <div className="h-1.5 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>

        {/* HEADER SECTION */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-gray-50">
          <div className="flex items-center gap-4">
             <img 
               src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/1200px-Emblem_of_India.svg.png" 
               alt="Emblem" 
               className="h-14 w-auto" 
             />
             <div>
               <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Election Commission of India</h3>
               <h2 className="text-xl font-serif font-bold text-blue-900">Voter Identity Verification</h2>
             </div>
          </div>

          {/* DYNAMIC STATION CONTEXT BAR */}
          <div className="bg-blue-100 border border-blue-200 rounded-lg px-6 py-2 flex gap-8 shadow-sm">
             <div className="text-center">
                <span className="block text-[10px] font-bold text-blue-800 uppercase tracking-wide">Constituency</span>
                <span className="block text-lg font-bold text-blue-900">
                    {authData?.constituencyNo || "Unknown"}
                </span>
             </div>
             <div className="w-px bg-blue-300"></div>
             <div className="text-center">
                <span className="block text-[10px] font-bold text-blue-800 uppercase tracking-wide">Part No</span>
                <span className="block text-lg font-bold text-blue-900">
                    {authData?.partNo || "--"}
                </span>
             </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 p-8 md:p-12 flex flex-col items-center">
           
           <h1 className="text-lg font-medium text-gray-600 mb-6 text-center">
             Enter EPIC Number to Verify Voter
           </h1>

           {/* SEARCH FORM */}
           <form onSubmit={handleCheck} className="w-full max-w-xl relative mb-10">
              <div className="flex shadow-lg rounded-lg overflow-hidden border border-gray-300 focus-within:ring-2 focus-within:ring-blue-900 transition-all">
                <input 
                  type="text" 
                  className="flex-1 px-6 py-4 text-xl text-gray-800 focus:outline-none placeholder-gray-400 font-mono uppercase" 
                  placeholder="Enter EPIC No (e.g. ABC1234567)"
                  value={epicNumber}
                  onChange={(e) => setEpicNumber(e.target.value.toUpperCase())}
                />
                <button 
                  type="submit"
                  disabled={searchStatus === 'searching'}
                  className="bg-blue-900 text-white px-8 py-4 font-bold uppercase tracking-wider hover:bg-blue-800 transition disabled:bg-gray-400 flex items-center gap-2"
                >
                  {searchStatus === 'searching' ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing
                    </div>
                  ) : (
                    'Verify'
                  )}
                </button>
              </div>
           </form>

           {/* --- STATUS: IDLE --- */}
           {searchStatus === 'idle' && (
             <div className="text-center text-gray-400 mt-4 max-w-md">
                <p className="text-sm">
                    Ensure the physical ID card matches the EPIC number entered. 
                    <br/>System will verify details against <strong>Part {authData?.partNo || "..."}</strong> database.
                </p>
             </div>
           )}

           {/* --- STATUS: NOT FOUND --- */}
           {searchStatus === 'not-found' && (
             <div className="w-full max-w-lg bg-red-50 border-l-4 border-red-500 p-6 rounded shadow-md animate-fade-in flex items-start gap-4">
                <div className="bg-red-100 p-3 rounded-full text-red-600 shrink-0">
                   <FaExclamationTriangle className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="text-lg font-bold text-red-800">Record Not Found</h3>
                   <p className="text-red-700 text-sm mt-1">
                     EPIC No <strong>{epicNumber}</strong> does not exist in the electoral roll. Please check the number or refer to the manual list.
                   </p>
                </div>
             </div>
           )}

           {/* --- STATUS: MISMATCH --- */}
           {searchStatus === 'mismatch' && candidateDetails && (
             <div className="w-full max-w-lg bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded shadow-md animate-fade-in flex items-start gap-4">
                <div className="bg-yellow-100 p-3 rounded-full text-yellow-600 shrink-0">
                   <FaExclamationTriangle className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="text-lg font-bold text-yellow-800">Wrong Polling Station</h3>
                   <p className="text-yellow-700 text-sm mt-1">
                     Voter <strong>{candidateDetails.name}</strong> belongs to <strong>Part No: {candidateDetails.partNo}</strong>.
                     <br/>Please direct them to the correct room.
                   </p>
                </div>
             </div>
           )}
           {/* --- STATUS: ALREADY VOTED --- */}
{searchStatus === 'already-voted' && (
  <div className="w-full max-w-lg bg-blue-50 border-l-4 border-blue-600 p-6 rounded shadow-md animate-fade-in flex items-start gap-4">
    <div className="bg-blue-100 p-3 rounded-full text-blue-700 shrink-0">
      <FaFingerprint className="w-6 h-6" />
    </div>
    <div>
      <h3 className="text-lg font-bold text-blue-800">Vote Already Cast</h3>
      <p className="text-blue-700 text-sm mt-1">
        This voter has already voted.
        <br />
        No further action is permitted.
      </p>
    </div>
  </div>
)}



           {/* --- STATUS: FOUND (Voter Card Style) --- */}
           {searchStatus === 'found' && candidateDetails && (
             <div className="w-full max-w-md bg-white border border-gray-300 rounded-xl shadow-2xl animate-fade-in overflow-hidden relative">
                
                {/* Official Card Header */}
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-5 py-3 flex justify-between items-center text-white">
                   <div className="flex items-center gap-2">
                     <img 
                       src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/1200px-Emblem_of_India.svg.png" 
                       alt="Emblem" className="h-8 w-auto invert brightness-0 filter" 
                     />
                     <div>
                       <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">Election Commission</p>
                       <p className="text-sm font-bold leading-none">Voter Identity</p>
                     </div>
                   </div>
                   <div className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide shadow-sm">
                     Verified
                   </div>
                </div>
                
                <div className="p-6">
                   <div className="flex gap-5">
                      {/* Avatar Section */}
                      <div className="flex-shrink-0">
                        <div className="w-24 h-28 bg-blue-50 border-2 border-blue-100 rounded-lg flex items-center justify-center overflow-hidden shadow-inner">
                           {/* Colorful Human Avatar Template */}
                           <FaUserCircle className="text-blue-300 w-20 h-20" />
                        </div>
                      </div>
                      
                      {/* Details Section */}
                      <div className="flex-1 space-y-3 pt-1">
                         <div>
                           <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wide block mb-0.5">Voter Name</label>
                           <p className="text-lg font-bold text-gray-800 leading-tight">{candidateDetails.name}</p>
                         </div>
                         
                         <div>
                           <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wide block mb-0.5">Age</label>
                           <p className="text-sm font-bold text-gray-800">{candidateDetails.age} Years</p>
                         </div>

                         <div>
                           <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wide block mb-0.5">EPIC No</label>
                           <div className="flex items-center gap-2">
                              <FaIdCard className="text-blue-900 opacity-60 text-xs" />
                              <p className="text-sm font-mono font-bold text-blue-900 tracking-wide">{candidateDetails.epicNo}</p>
                           </div>
                         </div>
                      </div>
                   </div>

                   <div className="mt-5 pt-4 border-t border-dashed border-gray-200">
                      <div className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded border border-gray-100">
                         <span className="text-xs text-gray-500 font-bold flex items-center gap-2">
                           <FaFingerprint /> UID (Aadhar)
                         </span>
                         <span className="text-sm font-mono text-gray-800 tracking-widest">
                           XXXX-XXXX-{candidateDetails.aadharNo ? candidateDetails.aadharNo.slice(-4) : "XXXX"}
                         </span>
                      </div>
                   </div>
                </div>
                
                {/* Actions Footer */}
                <div className="bg-gray-50 px-5 py-4 border-t border-gray-200 flex justify-between gap-3">
                   <button 
                     onClick={() => setSearchStatus('idle')}
                     className="flex-1 px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded transition text-sm border border-gray-300"
                   >
                     Cancel
                   </button>
                   <button 
                     onClick={handleProceed}
                     className="flex-[1.5] px-4 py-2 bg-green-700 text-white font-bold rounded shadow hover:bg-green-800 transition text-sm flex items-center justify-center gap-2"
                   >
                     Proceed to Biometric
                   </button>
                </div>
             </div>
           )}

        </div>

        {/* FOOTER */}
        <div className="bg-gray-50 border-t border-gray-200 p-3 text-center">
           <p className="text-[10px] text-gray-400">
             Authorized Officer: <span className="font-bold text-gray-600">{authData?.username || "GUEST"}</span> | Session Active
           </p>
        </div>
      </div>
    </div>
  );
}

// Fallback Icon component just in case import fails or isn't desired
const FaExclamationTriangle = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

export default CandidateCheck;