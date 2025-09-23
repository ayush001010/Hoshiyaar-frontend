import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx'; // Import the AuthProvider with .jsx
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import Login from './components/AuthPages/Login';
import Signup from './components/AuthPages/Signup';

const MainLayout = ({ children }) => (
  <div className="font-sans">
    <Header />
    <main>{children}</main>
    <Footer />
  </div>
);

function App() {
  return (
    // Wrap the Router with AuthProvider
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

