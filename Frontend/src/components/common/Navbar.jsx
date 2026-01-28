import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/images/logo.jpg';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="Mediland Hospital Logo" className="logo-image" />
          <div className="logo-text">
            <span className="logo-title">DoctorChannel</span>
            <span className="logo-subtitle">Mediland Hospital - Kalmunai</span>
          </div>
        </Link>
        
        <div className="navbar-menu">
          <Link to="/doctors" className="navbar-link">Find Doctors</Link>
          
          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <Link to="/admin" className="navbar-link">Admin Dashboard</Link>
              )}
              <Link to="/my-appointments" className="navbar-link">My Appointments</Link>
              <span className="navbar-user">Hi, {user.fullName}</span>
              <button onClick={handleLogout} className="navbar-button navbar-button-logout">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/admin-login" className="navbar-link navbar-admin-link">
                 Admin Login
              </Link>
              <Link to="/login" className="navbar-button">Sign In</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
