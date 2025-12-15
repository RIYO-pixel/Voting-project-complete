import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';

function VotingFailed() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200 text-center">
        
        {/* Top Strip */}
        <div className="h-2 bg-red-600"></div>

        <div className="p-12 flex flex-col items-center animate-fade-in">
           
           <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mb-8 shadow-inner">
              <FaExclamationTriangle className="text-red-600 text-6xl" />
           </div>

           <h1 className="text-3xl font-serif font-bold text-red-700 mb-2">Session Expired</h1>
           <p className="text-lg text-gray-600 mb-6 max-w-md">
             The 5-minute time limit for casting the vote has been exceeded. The session has been terminated for security reasons.
           </p>

           <div className="bg-red-50 border border-red-200 px-8 py-4 rounded-lg mb-10">
              <p className="text-red-800 font-bold uppercase tracking-wider text-sm">
                 Status: VOTING FAILED / TIMEOUT
              </p>
           </div>

           <button 
             onClick={() => navigate('/check-candidate')}
             className="bg-gray-800 text-white px-8 py-3 rounded shadow-lg font-bold uppercase tracking-wider hover:bg-gray-900 transition flex items-center gap-2"
           >
             <FaArrowLeft /> Return to Verification Page
           </button>

        </div>
      </div>
    </div>
  );
}

export default VotingFailed;