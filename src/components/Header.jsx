import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'; // Import the useAuth hook with .jsx
import { DuolingoLogo } from './Icons';

const Header = () => {
  const { user, logout } = useAuth(); // Get user and logout function from context
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to home after logout
  };

  return (
    <header className="sticky top-0 bg-white border-b border-duo-gray h-20 flex items-center z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-4">
          <span className="text-2xl font-extrabold text-duo-blue tracking-tight">Hoshiyaar</span>
        </Link>
        <div>
          {user ? (
            // If user is logged in, show Account and Logout buttons
            <div className="flex items-center gap-4">
              <Link to="/account"> {/* You can create an /account page later */}
                <button className="w-full sm:w-auto bg-white text-duo-blue font-bold uppercase tracking-wider py-3 px-7 rounded-2xl border-2 border-duo-gray hover:bg-gray-100 transition">
                  Account
                </button>
              </Link>
              <button 
                onClick={handleLogout}
                className="w-full sm:w-auto bg-duo-blue text-white font-bold uppercase tracking-wider py-3 px-7 rounded-2xl border-b-4 border-duo-blue-dark hover:bg-blue-500 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            // If user is not logged in, show Login/Signup button
            <Link to="/login">
              <button className="w-full sm:w-auto bg-duo-blue text-white font-bold uppercase tracking-wider py-3 px-7 rounded-2xl border-b-4 border-duo-blue-dark hover:bg-blue-500 transition">
                Login / Signup
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

