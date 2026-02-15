import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import doctorImage from '../assets/images/Doctor.jpg.webp';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home">
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Book Your Doctor <span className="highlight">In Minutes</span>
            </h1>
            <p className="hero-description">
              Connect with trusted healthcare professionals. Schedule appointments,
              manage your health records, and get the care you deserve.
            </p>
            <div className="hero-buttons">
              <button 
                className="btn-primary" 
                onClick={() => navigate('/doctors')}
              >
                <span className="btn-icon"></span> Find Doctors
              </button>
              <button 
                className="btn-secondary"
                onClick={() => navigate('/register')}
              >
                Get Started
              </button>
            </div>
          </div>
          <div className="hero-image">
            <img src={doctorImage} alt="Doctor" />
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">THURGA</h2>
        <p className="section-subtitle">
          We make healthcare accessible, convenient, and reliable for everyone
        </p>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Easy Booking</h3>
            <p>Book appointments 24/7 with just a few clicks</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⏰</div>
            <h3>Save Time</h3>
            <p>No more waiting in long queues or phone calls</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Verified Doctors</h3>
            <p>All doctors are certified and verified professionals</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Trusted Care</h3>
            <p>Join thousands of satisfied patients</p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">Simple steps to better healthcare</p>
        
        <div className="steps-container">
          <div className="step">
            <div className="step-number">01</div>
            <h3>Search Doctors</h3>
            <p>Find specialists by name, specialty, or location</p>
          </div>
          
          <div className="step">
            <div className="step-number">02</div>
            <h3>Choose Time</h3>
            <p>Select a convenient date and time slot</p>
          </div>
          
          <div className="step">
            <div className="step-number">03</div>
            <h3>Book Appointment</h3>
            <p>Confirm your booking and receive confirmation</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Get Started?</h2>
        <p>Join thousands of patients who trust DoctorChannel for their healthcare needs</p>
        <button 
          className="btn-cta"
          onClick={() => navigate('/register')}
        >
          Create Free Account
        </button>
      </section>
    </div>
  );
};

export default Home;
