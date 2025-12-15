import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/Context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSignOutAlt } from 'react-icons/fa';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authData, logout } = useAuth();

  const isAdminPage = location.pathname.startsWith('/admin');
  const isLoginPage = location.pathname === '/admin-login';

  // ---------------- LOGOUT CONFIRMATION ----------------
  const confirmLogout = (onConfirm) => {
    const toastId = "logout-confirm-toast";

    toast.info(
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-red-600 font-bold">
          <FaSignOutAlt /> Confirm Logout
        </div>
        <p className="text-xs text-gray-600">
          Are you sure you want to sign out?
        </p>
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={() => toast.dismiss(toastId)}
            className="px-3 py-1 bg-gray-100 border rounded text-xs font-bold"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(toastId);
              onConfirm();
            }}
            className="px-3 py-1 bg-red-600 text-white rounded text-xs font-bold"
          >
            Logout
          </button>
        </div>
      </div>,
      {
        toastId,
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        hideProgressBar: true,
        position: "top-right",
      }
    );
  };

  // ---------------- BUTTON HANDLER ----------------
  const handleButtonClick = () => {
    if (authData || isAdminPage) {
      confirmLogout(() => (authData ? logout() : navigate('/')));
    } else {
      navigate('/admin-login');
    }
  };

  // ---------------- ACTIVE LINK STYLE ----------------
  const navLink = (path, label) => (
    <button
      onClick={() => navigate(path)}
      className={`text-sm font-semibold px-3 py-1 rounded transition
        ${location.pathname === path
          ? "bg-blue-100 text-blue-900"
          : "text-gray-600 hover:text-blue-900 hover:bg-gray-100"}
      `}
    >
      {label}
    </button>
  );

  return (
    <header className="relative flex items-center p-4 bg-white shadow-md border-b z-50">
  <ToastContainer />

  {/* LEFT: LOGO */}
  <div
    className="flex items-center gap-4 cursor-pointer"
    onClick={() => navigate('/')}
  >
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/1200px-Emblem_of_India.svg.png"
      alt="Emblem"
      className="w-10"
    />
    <div>
      <h1 className="text-xl font-bold text-gray-800">
        Government of India
      </h1>
      <h2 className="text-sm font-semibold text-gray-600">
        Election Commission
      </h2>
    </div>
  </div>

  {/* CENTER: NAVIGATION (TRUE CENTER) */}
  {!isLoginPage && (
    <nav className="absolute left-1/2 -translate-x-1/2 flex gap-2 items-center">
      {navLink('/', 'Home')}
      {authData && navLink('/check-candidate', 'Check Candidate')}
      {isAdminPage && navLink('/admin-dashboard', 'Dashboard')}
    </nav>
  )}

  {/* RIGHT: ACTION BUTTON */}
  {!isLoginPage && (
    <div className="ml-auto">
      <button
        onClick={handleButtonClick}
        className={`px-4 py-2 text-white rounded font-medium transition
          ${authData || isAdminPage
            ? "bg-red-600 hover:bg-red-700"
            : "bg-blue-900 hover:bg-blue-800"}
        `}
      >
        {authData || isAdminPage ? "Logout" : "Admin Panel"}
      </button>
    </div>
  )}
</header>

  );
}

export default Header;
