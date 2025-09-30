import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx'; // Import the useAuth hook
import AuthLayout from './AuthLayout';
import { GoogleIcon, FacebookIcon } from '../Icons';
import authService from '../../services/authService.js';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); // Get the login function from our context

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    try {
      const response = await authService.login(formData);
      if (response.data && response.data.token) {
        // THE FIX: Use the login function from context to update global state
        login(response.data);
        // Mark entry type so Learn can decide flow
        try { sessionStorage.setItem('entryType', 'login'); } catch (_) {}
        // Redirect to the learn page
        navigate('/learn');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <AuthLayout title="Log in" linkTo="/signup" linkText="Sign up">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-8">Log in</h1>
        
        {error && <p className="bg-red-500 text-white p-3 rounded-md mb-4">{error}</p>}

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            placeholder="Email or username"
            className="w-full bg-[#3c3c3c] border-2 border-[#585858] rounded-2xl p-4 focus:outline-none focus:border-duo-blue"
            required
          />
          <div className="relative">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={onChange}
              placeholder="Password"
              className="w-full bg-[#3c3c3c] border-2 border-[#585858] rounded-2xl p-4 focus:outline-none focus:border-duo-blue"
              required
            />
            <a href="#" className="absolute right-4 top-1/2 -translate-y-1/2 text-duo-blue font-bold">FORGOT?</a>
          </div>
          <button type="submit" className="w-full bg-duo-blue text-white font-bold uppercase tracking-wider py-4 rounded-2xl border-b-4 border-duo-blue-dark hover:bg-blue-500 transition">
            Log In
          </button>
        </form>

        {/* <button
          type="button"
          onClick={() => navigate('/signup')}
          className="w-full mt-3 bg-transparent text-duo-blue font-bold uppercase tracking-wider py-3 rounded-2xl border-2 border-duo-blue hover:bg-duo-blue hover:text-white transition"
        >
          Create Account
        </button> */}

        {/* <div className="my-6 text-gray-400">OR</div> */}

        {/* <div className="space-y-4">
          <button className="w-full flex items-center justify-center bg-[#3c3c3c] border-2 border-[#585858] rounded-2xl p-4 hover:bg-[#4c4c4c] transition">
            <GoogleIcon />
            <span>Google</span>
          </button>
          <button className="w-full flex items-center justify-center bg-[#3c3c3c] border-2 border-[#585858] rounded-2xl p-4 hover:bg-[#4c4c4c] transition">
            <FacebookIcon />
            <span>Facebook</span>
          </button>
        </div> */}

        <p className="text-xs text-gray-400 mt-8">
          By signing in to Hoshiyaar, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;

