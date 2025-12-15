// src/pages/AdminLogin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminLogin() {
  const navigate = useNavigate();
  
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();

    const STATIC_USER = import.meta.env.VITE_ADMIN_USER;
    const STATIC_PASS = import.meta.env.VITE_ADMIN_PASS;

    if (credentials.username === STATIC_USER && credentials.password === STATIC_PASS) {
      toast.success("Login Successful", { autoClose: 1000 });
      
      // Redirect to dashboard after 1 second
      setTimeout(() => {
        navigate('/admin-dashboard');
      }, 1000);
      
    } else {
      toast.error("Invalid Admin Credentials");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-gray-50">
      <ToastContainer />
      
      {/* MAIN CARD */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200 relative">
        
        {/* DECORATIVE TOP STRIP (Indian Flag Colors) */}
        <div className="h-2 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>

        <div className="p-10">
          
          {/* HEADER SECTION */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/1200px-Emblem_of_India.svg.png" 
                alt="National Emblem" 
                className="h-16 w-auto"
              />
            </div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">
              Government of India
            </h3>
            <h4 className="text-2xl font-serif font-bold text-blue-900">
              Election Commission
            </h4>
            <div className="mt-2 inline-block px-3 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded-full uppercase tracking-wide">
              Admin Control Panel
            </div>
          </div>

          {/* FORM SECTION */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-xs font-bold uppercase mb-2 tracking-wide">
                Admin ID
              </label>
              <input 
                type="text" 
                name="username"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition text-sm font-medium" 
                value={credentials.username}
                onChange={handleChange}
                placeholder="Enter Admin ID"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-xs font-bold uppercase mb-2 tracking-wide">
                Password
              </label>
              <input 
                type="password" 
                name="password"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition text-sm font-medium" 
                value={credentials.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded shadow-md hover:shadow-lg transform active:scale-[0.98] transition-all duration-200 uppercase tracking-wider text-sm"
            >
              Secure Login
            </button>
          </form>

          {/* FOOTER DISCLAIMER */}
          <div className="mt-8 text-center border-t border-gray-100 pt-4">
             <p className="text-xs text-gray-400">
               <span className="font-semibold text-red-500">Restricted Access:</span> Unauthorized access is a punishable offense under the IT Act, 2000.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;