import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

function VotingSuccess() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    // 1. Timer to update the countdown text every second
    const intervalId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    // 2. Timer to redirect after 5 seconds
    const timeoutId = setTimeout(() => {
      navigate('/check-candidate'); // Redirects to the Check Candidate / Admin Dashboard page
    }, 5000);

    // Cleanup timers if user leaves page early
    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200 text-center">
        
        {/* Top Strip */}
        <div className="h-2 bg-green-500"></div>

        <div className="p-12 flex flex-col items-center animate-fade-in">
           
           <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mb-8 shadow-inner">
              <FaCheckCircle className="text-green-600 text-7xl" />
           </div>

           <h1 className="text-4xl font-serif font-bold text-gray-800 mb-2">Voting Successful</h1>
           <p className="text-xl text-gray-500 mb-8 font-medium">Thank you for exercising your right to vote.</p>

           <div className="bg-green-50 border border-green-200 px-8 py-4 rounded-lg mb-10">
              <p className="text-green-800 font-bold uppercase tracking-wider text-sm">
                 Status Updated: VOTE CASTED
              </p>
           </div>

           {/* Redirect Message */}
           <div className="text-gray-400 text-sm font-medium animate-pulse">
             Redirecting to dashboard in {timeLeft} seconds...
           </div>

        </div>
        
        <div className="bg-gray-50 p-4 border-t border-gray-200">
           <p className="text-xs text-gray-400">Election Commission of India</p>
        </div>
      </div>
    </div>
  );
}

export default VotingSuccess;