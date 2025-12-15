import React, { useState } from 'react';
import { useAuth } from '@/Context/AuthContext';
import { useNavigate } from 'react-router-dom'; // Added for redirection
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";

function OfficerLogin() {
  const BASE_URL = import.meta.env.VITE_PORT;
  const { login } = useAuth();
  const navigate = useNavigate(); // Hook for navigation

  const [formData, setFormData] = useState({
    constituencyNo: '', // Matching your state naming
    partNo: '',
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleLogin = async (e) => {
  e.preventDefault();

  if (!formData.constituencyNo || !formData.partNo || !formData.username || !formData.password) {
    toast.error("Please fill in all details");
    return;
  }

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_PORT}/api/officer/login`,
      formData
    );

    if (res.data.status && res.data.officer) {
      const officer = res.data.officer;

      // ✅ PASS STRINGS ONLY
      login(
        officer.constituencyNo,
        officer.partNo,
        officer.username
      );

      toast.success("Login successful");
    } else {
      toast.error(res.data.message || "Login failed");
    }

  } catch (err) {
    toast.error(
      err.response?.data?.message || "Invalid credentials"
    );
  }
};


  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-gray-50">
      <ToastContainer />
      
      {/* MAIN CARD */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200">
        
        {/* DECORATIVE TOP STRIP */}
        <div className="h-2 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>

        <div className="p-8">
          {/* HEADER SECTION */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/1200px-Emblem_of_India.svg.png" 
                alt="Emblem of India" 
                className="h-20 w-auto"
              />
            </div>
            
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">
              Government of India
            </h3>
            <h4 className="text-2xl font-serif font-bold text-blue-900">
              Election Commission
            </h4>
            <p className="text-xs text-gray-400 mt-1 italic">Officer Authentication Portal</p>
          </div>

          {/* FORM SECTION */}
          <form className="space-y-5" onSubmit={handleLogin}>
            
            {/* Constituency & Part No */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-xs font-bold uppercase mb-2 tracking-wide">
                  Constituency No
                </label>
                <input 
                  type="text" 
                  name="constituencyNo"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition text-sm font-medium" 
                  placeholder="AC-123"
                  value={formData.constituencyNo}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-xs font-bold uppercase mb-2 tracking-wide">
                  Part No
                </label>
                <input 
                  type="text" 
                  name="partNo"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition text-sm font-medium" 
                  placeholder="15" 
                  value={formData.partNo}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-gray-700 text-xs font-bold uppercase mb-2 tracking-wide">
                Officer User Name
              </label>
              <input 
                type="text" 
                name="username"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition text-sm" 
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter Username"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 text-xs font-bold uppercase mb-2 tracking-wide">
                Password
              </label>
              <input 
                type="password" 
                name="password"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition text-sm" 
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded shadow-md hover:shadow-lg transform active:scale-[0.98] transition-all duration-200 mt-4 uppercase tracking-wider text-sm"
            >
              Secure Sign In
            </button>
          </form>
          
          {/* Footer Text */}
          <div className="mt-6 text-center border-t border-gray-100 pt-4">
             <p className="text-xs text-gray-400">
               Authorized Personnel Only. <br/> 
               Check your credentials before login.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfficerLogin;