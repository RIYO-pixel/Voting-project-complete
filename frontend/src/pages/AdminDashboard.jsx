import React from 'react';
import { Link } from 'react-router-dom';

function AdminDashboard() {
  // Configuration for the 4 dashboard options
  const dashboardOptions = [
    {
      title: "Create Credential",
      description: "Generate new officer logins and access roles.",
      path: "/admin/create-credential", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
      )
    },
    {
      title: "Entry Voter Details",
      description: "Add or update voter information records.",
      path: "/admin/enter-voter", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
      )
    },
    {
      title: "Credential List",
      description: "View and manage existing system users.",
      path: "/admin/credential-list", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
      )
    },
    {
      title: "Added Candidate Details",
      description: "Review registered election candidates.",
      path: "/admin/voter-list", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
      )
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      
      {/* HEADER SECTION */}
      <div className="mb-10">
        <h2 className="text-3xl font-serif font-bold text-blue-900 mb-2">
          Admin Dashboard
        </h2>
        <p className="text-gray-500 mb-4">
          Welcome to the Election Commission Control Panel. Select a module to proceed.
        </p>
        
        {/* Decorative Tricolor Strip */}
        <div className="h-1 w-full max-w-xs bg-gradient-to-r from-orange-500 via-white to-green-600 rounded"></div>
      </div>
      
      {/* GRID SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {dashboardOptions.map((option, index) => (
          <Link 
            to={option.path} 
            key={index} 
            className="group relative bg-white border border-gray-200 rounded-lg p-6 flex items-start transition-all duration-300 hover:shadow-lg hover:border-orange-400 overflow-hidden"
          >
            {/* Hover Accent Bar (Orange for Admin) */}
            <div className="absolute left-0 top-0 h-full w-1 bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Icon Container */}
            <div className="bg-blue-50 p-4 rounded-full mr-6 text-blue-900 group-hover:bg-blue-900 group-hover:text-white transition-colors duration-300 flex-shrink-0">
              {React.cloneElement(option.icon, { className: "w-6 h-6" })}
            </div>
            
            {/* Text Content */}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-900 transition-colors">
                {option.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {option.description}
              </p>
            </div>
            
            {/* Arrow Indicator */}
            <div className="self-center ml-4 text-2xl text-gray-300 font-bold opacity-0 transform -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-orange-500 transition-all duration-300">
              →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;