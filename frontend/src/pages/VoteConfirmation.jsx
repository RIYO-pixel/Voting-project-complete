import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaClock, FaCheckDouble, FaUserCheck, FaInfoCircle } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

function VoteConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { candidate } = location.state || {}; // Voter details passed from previous page

  // 5 Minutes = 300 Seconds
  const [timeLeft, setTimeLeft] = useState(60); 

  // --- TIMER LOGIC ---
  useEffect(() => {
    // If timer reaches 0, Redirect to Failed Page
    if (timeLeft === 0) {
      navigate('/voting-failed');
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, navigate]);

  // Format Time (MM:SS)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- HANDLER: MANUAL VOTE CONFIRMATION ---
  const handleManualVoteConfirmed = async () => {

    const BASE_URL=import.meta.env.VITE_PORT
  try {
    const payload = {
      epicNo: candidate.epicNo,
      hasVoted: true
    };

    const response = await axios.post(
  `${BASE_URL}/api/officer/update-vote`,
  payload,
  {
    headers: {
      "Content-Type": "application/json"
    },
    withCredentials: true
  }
);
console.log("Vote Update Response:", response.data);

    if (response.data.status) {
      toast.success("Vote recorded successfully");
      navigate('/voting-success');
    } else {
      toast.error(response.data.message || "Vote update failed");
    }

  } catch (error) {
    console.error(error);

    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Server error while updating vote");
    }
  }
};


  return (
    <div className="w-full max-w-5xl mx-auto my-8 px-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200 min-h-[500px] flex flex-col relative">
        
        {/* Top Strip */}
        <div className="h-1.5 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>

        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center bg-gray-50">
          <div className="flex items-center gap-4">
             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/1200px-Emblem_of_India.svg.png" alt="Emblem" className="h-14 w-auto" />
             <div>
               <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Election Commission of India</h3>
               <h2 className="text-xl font-serif font-bold text-blue-900">Voting Session Active</h2>
             </div>
          </div>

          {/* TIMER DISPLAY */}
          <div className={`px-6 py-2 rounded-lg border flex items-center gap-3 shadow-sm transition-colors duration-500
            ${timeLeft < 60 ? 'bg-red-50 border-red-200 text-red-700 animate-pulse' : 'bg-blue-50 border-blue-200 text-blue-900'}`}>
             <FaClock className={timeLeft < 60 ? "animate-spin" : ""} />
             <div className="text-center">
                <span className="block text-[10px] font-bold uppercase tracking-wide opacity-70">Session Expires In</span>
                <span className="block text-2xl font-mono font-bold leading-none">{formatTime(timeLeft)}</span>
             </div>
          </div>
        </div>

        {/* Active Voter Info Banner */}
        {candidate && (
            <div className="bg-blue-900 text-white px-6 py-3 flex justify-between items-center text-sm shadow-md relative z-10">
                <span className="flex items-center gap-2"><FaUserCheck /> Active Voter:</span>
                <span className="font-bold uppercase tracking-wider text-lg">{candidate.name} <span className="opacity-70 text-sm font-normal">({candidate.epicNo})</span></span>
            </div>
        )}

        {/* Voting Content (Manual Instruction) */}
        <div className="flex-1 p-10 flex flex-col items-center justify-center text-center">
            
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg max-w-2xl mb-10 text-left w-full shadow-sm">
                <div className="flex items-start gap-4">
                    <FaInfoCircle className="text-blue-600 text-3xl mt-1" />
                    <div>
                        <h3 className="text-lg font-bold text-blue-900 mb-2">Officer Instructions</h3>
                        <p className="text-blue-800 leading-relaxed">
                            1. Direct the voter to the voting compartment.<br/>
                            2. Allow the voter to cast their vote using the EVM or Ballot Paper.<br/>
                            3. <strong>Once the voter exits the compartment</strong>, click the button below to mark the status as 'VOTED'.
                        </p>
                    </div>
                </div>
            </div>

            {/* CONFIRM BUTTON (Manual "Done" Button) */}
            <button 
                onClick={handleManualVoteConfirmed}
                className="bg-green-700 text-white px-12 py-5 rounded-lg font-bold text-xl uppercase tracking-wider shadow-lg hover:bg-green-800 hover:shadow-xl transform active:scale-[0.98] transition-all flex items-center gap-4 border-2 border-green-600"
            >
                <div className="bg-white text-green-700 rounded-full p-1">
                    <FaCheckDouble size={20} />
                </div>
                Confirm Vote Cast
            </button>
            
            <p className="mt-4 text-xs text-gray-400">
                Click only after the voter has successfully cast their vote.
            </p>
        </div>

      </div>
    </div>
  );
}

export default VoteConfirmation;