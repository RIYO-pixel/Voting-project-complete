import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function VerificationSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { candidate } = location.state || {};

  const [secondsLeft, setSecondsLeft] = useState(15);

  // 🔒 Fallback if accessed directly
  useEffect(() => {
    if (!candidate) {
      navigate('/admin-dashboard');
    }
  }, [candidate, navigate]);

  // ⏳ Auto redirect timer
  useEffect(() => {
    if (secondsLeft === 0) {
      navigate('/admin-dashboard');
      return;
    }

    const timer = setTimeout(() => {
      setSecondsLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft, navigate]);

  if (!candidate) return null;

  return (
    <div className="w-full max-w-3xl mx-auto my-8 px-4">
      <div className="bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200 flex flex-col">

        {/* TOP STRIP */}
        <div className="h-1.5 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>

        {/* HEADER */}
        <div className="p-6 border-b border-gray-100 flex items-center gap-4">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/1200px-Emblem_of_India.svg.png"
            alt="Emblem"
            className="h-12"
          />
          <div>
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Election Commission of India
            </h3>
            <h2 className="text-lg font-serif font-bold text-blue-900">
              Biometric Registration
            </h2>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center animate-fade-in">

          {/* SUCCESS ICON */}
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          {/* MESSAGE */}
          <h1 className="text-3xl font-serif font-bold text-green-700 mb-2">
            Thank You!
          </h1>

          <p className="text-gray-600 text-base mb-6 max-w-md">
            Your biometric data has been successfully registered and securely
            linked with your voter identity.
          </p>

          {/* VOTER SUMMARY */}
          <div className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs">Voter Name</p>
                <p className="font-bold text-gray-800">{candidate.name}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">EPIC No</p>
                <p className="font-mono font-bold text-gray-800">{candidate.epicNo}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Constituency</p>
                <p className="font-bold text-gray-800">{candidate.constituencyNo}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Part No</p>
                <p className="font-bold text-gray-800">{candidate.partNo}</p>
              </div>
            </div>
          </div>

          {/* TIMER */}
          <p className="text-sm text-gray-500 mb-4">
            Redirecting to Admin Dashboard in{' '}
            <span className="font-bold text-blue-900">{secondsLeft}</span> seconds
          </p>

          {/* MANUAL BUTTON */}
          <button
            onClick={() => navigate('/admin-dashboard')}
            className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded shadow-lg font-bold uppercase tracking-wider transition-all transform hover:scale-105 text-sm"
          >
            Go to Dashboard Now →
          </button>
        </div>

        {/* FOOTER */}
        <div className="bg-gray-50 border-t border-gray-200 p-2 text-center">
          <p className="text-[10px] text-gray-400">
            Reference ID: <span className="font-mono text-gray-600">BIO-{candidate.slNo}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default VerificationSuccess;
