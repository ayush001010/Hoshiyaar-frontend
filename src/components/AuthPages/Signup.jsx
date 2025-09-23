import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { GoogleIcon, FacebookIcon } from '../Icons';
import authService from '../../services/authService';

const Signup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: '',
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { age, name, email, password } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAgeSubmit = (e) => {
    e.preventDefault();
    if (age >= 5) {
      setError('');
      setStep(2);
    } else {
      setError('You must be at least 5 years old to sign up.');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await authService.register({ name, email, password, age });
      if (response.data && response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const AgeStep = () => (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4">How old are you?</h1>
      <form onSubmit={handleAgeSubmit}>
        <input
          type="number"
          name="age"
          value={age}
          onChange={onChange}
          placeholder="Age"
          min="0"
          className="w-full bg-[#3c3c3c] border-2 border-[#585858] rounded-2xl p-4 mb-4 focus:outline-none focus:border-duo-blue"
          required
        />
        <p className="text-sm text-gray-400 mb-8">
            Providing your age ensures you get the right Hoshiyaar experience. For more details, please visit our <a href="#" className="text-duo-blue">Privacy Policy</a>.
        </p>
        <button type="submit" className="w-full bg-duo-blue text-white font-bold uppercase tracking-wider py-4 rounded-2xl border-b-4 border-duo-blue-dark hover:bg-blue-500 transition">
          Next
        </button>
      </form>
    </div>
  );

  const ProfileStep = () => (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-8">Create your profile</h1>
      <form onSubmit={handleProfileSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          value={name}
          onChange={onChange}
          placeholder="Name (optional)"
          className="w-full bg-[#3c3c3c] border-2 border-[#585858] rounded-2xl p-4 focus:outline-none focus:border-duo-blue"
        />
        <input
          type="email"
          name="email"
          value={email}
          onChange={onChange}
          placeholder="Email"
          className="w-full bg-[#3c3c3c] border-2 border-[#585858] rounded-2xl p-4 focus:outline-none focus:border-duo-blue"
          required
        />
        <input
          type="password"
          name="password"
          value={password}
          onChange={onChange}
          placeholder="Password"
          className="w-full bg-[#3c3c3c] border-2 border-[#585858] rounded-2xl p-4 focus:outline-none focus:border-duo-blue"
          required
        />
        <button type="submit" className="w-full bg-duo-blue text-white font-bold uppercase tracking-wider py-4 rounded-2xl border-b-4 border-duo-blue-dark hover:bg-blue-500 transition">
          Create Account
        </button>
      </form>
    </div>
  );

  return (
    <AuthLayout title="Sign up" linkTo="/login" linkText="Log in">
      <div className="text-center">
        {error && <p className="bg-red-500 text-white p-3 rounded-md mb-4 text-center">{error}</p>}
        
        {step === 1 && <AgeStep />}
        {step === 2 && <ProfileStep />}
        
        <div className="my-6 text-gray-400">OR</div>

        <div className="space-y-4">
          <button className="w-full flex items-center justify-center bg-[#3c3c3c] border-2 border-[#585858] rounded-2xl p-4 hover:bg-[#4c4c4c] transition">
            <GoogleIcon />
            <span>Google</span>
          </button>
          <button className="w-full flex items-center justify-center bg-[#3c3c3c] border-2 border-[#585858] rounded-2xl p-4 hover:bg-[#4c4c4c] transition">
            <FacebookIcon />
            <span>Facebook</span>
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-8">
          By signing up for Hoshiyaar, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </AuthLayout>
  );
};

export default Signup;
