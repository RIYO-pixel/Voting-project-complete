import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaExclamationTriangle, FaBan, FaSearch, FaArrowLeft } from 'react-icons/fa';

function VerificationFailed() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the specific error reason passed from the previous page
  // Default to 'generic' if no state is provided
  const { reason, epicNo } = location.state || { reason: 'generic', epicNo: 'Unknown' };

  // Dynamic Content Logic
  const getErrorContent = () => {
    switch(reason) {
      case 'ALREADY_VOTED':
        return {
          title: "Duplicate Vote Detected",
          message: "This voter has already cast their vote. Multiple voting is a punishable offense.",
          color: "red",
          icon: <FaBan className="h-12 w-12 text-red-600" />,
          code: "ERR_DUPLICATE_ENTRY"
        };
      case 'WRONG_BOOTH':
        return {
          title: "Wrong Polling Station",
          message: "This voter belongs to a different constituency or part number. Please direct them to the correct booth.",
          color: "orange",
          icon: <FaExclamationTriangle className="h-12 w-12 text-orange-600" />,
          code: "ERR_WRONG_STATION"
        };
      case 'NOT_FOUND':
      default:
        return {
          title: "Record Not Found Or Biometric Failed",
          message: "No matching record found for the provided EPIC Number. Please verify the ID card manually.",
          color: "gray",
          icon: <FaSearch className="h-12 w-12 text-gray-600" />,
          code: "ERR_NO_RECORD"
        };
    }
  };

  const content = getErrorContent();
  const themeColor = content.color === 'red' ? 'red' : content.color === 'orange' ? 'orange' : 'gray';

  // Helper for dynamic Tailwind classes (Tailwind doesn't support dynamic string interpolation well for all classes, so we explicit maps or safe lists are better, but simple concatenation works for standard colors often)
  // Safest approach: consistent class structures.

  return (
    <div className="w-full max-w-3xl mx-auto my-8 px-4">
      
      {/* MAIN CARD */}
      <div className="bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200 flex flex-col">
        
        {/* DECORATIVE TOP STRIP */}
        <div className="h-1.5 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>

        {/* HEADER SECTION */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50">
          <div className="flex items-center gap-3">
             <img 
               src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/1200px-Emblem_of_India.svg.png" 
               alt="Emblem" 
               className="h-12 w-auto" 
             />
             <div>
               <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Election Commission of India</h3>
               <h2 className="text-lg font-serif font-bold text-blue-900">Verification System</h2>
             </div>
          </div>

          {/* CONTEXT BAR */}
          <div className={`bg-${themeColor}-50 border border-${themeColor}-200 rounded-lg px-4 py-2 flex gap-6 shadow-sm`}>
             <div className="text-center">
                <span className={`block text-[10px] font-bold text-${themeColor}-800 uppercase tracking-wide`}>EPIC No</span>
                <span className={`block text-base font-bold text-${themeColor}-900`}>{epicNo}</span>
             </div>
          </div>
        </div>

        {/* CENTER FAILED MESSAGE */}
        <div className="flex-1 flex flex-col items-center justify-center p-10 animate-fade-in">
           
           {/* Dynamic Icon */}
           <div className={`w-24 h-24 bg-${themeColor}-100 rounded-full flex items-center justify-center mb-6 shadow-inner`}>
              {content.icon}
           </div>

           <h1 className={`text-3xl font-serif font-bold text-${themeColor}-700 mb-2 text-center`}>
             {content.title}
           </h1>
           
           <p className="text-base text-gray-600 font-medium tracking-wide text-center max-w-md leading-relaxed">
             {content.message}
           </p>

           {/* Reason Box / Disclaimer */}
           <div className={`mt-8 w-full max-w-md bg-${themeColor}-50 border border-${themeColor}-200 px-6 py-4 rounded-lg text-center`}>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Action Required</p>
              <p className={`text-sm font-bold text-${themeColor}-800`}>
                {reason === 'ALREADY_VOTED' ? "Detain voter for inquiry if necessary." : "Re-check documents or refer to Presiding Officer."}
              </p>
           </div>

           {/* Action Buttons */}
           <div className="mt-8 flex gap-4">
             <button 
                onClick={() => navigate('/check-candidate')}
                className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded shadow font-bold uppercase tracking-wider transition-all text-sm"
             >
               <FaArrowLeft /> Back to Search
             </button>
             {reason !== 'ALREADY_VOTED' && (
                 <button 
                    onClick={() => navigate('/check-candidate')}
                    className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-2 rounded shadow-lg font-bold uppercase tracking-wider transition-all transform hover:scale-105 text-sm"
                 >
                   Retry
                 </button>
             )}
           </div>

        </div>

        {/* FOOTER STRIP */}
        <div className="bg-gray-50 border-t border-gray-200 p-2 text-center">
           <p className="text-[10px] text-gray-400">
             System Log Code: <span className={`font-mono font-bold text-${themeColor}-600`}>{content.code}</span>
           </p>
        </div>
      </div>
    </div>
  );
}

export default VerificationFailed;