import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { appointmentService } from '../../services/appointmentService';
import { useAuth } from '../../context/AuthContext';
import './BookAppointment.css';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    patientName: user?.fullName || '',
    patientEmail: user?.email || '',
    patientPhone: user?.phone || '',
    appointmentDateTime: '',
    symptoms: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const appointmentData = {
        ...formData,
        userId: user?.id,
        doctorId: doctorId,
        appointmentDateTime: new Date(formData.appointmentDateTime).toISOString()
      };
      
      await appointmentService.createAppointment(appointmentData);
      alert('Appointment booked successfully!');
      navigate('/my-appointments');
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    }
  };

  if (!user) {
    return (
      <div className="book-appointment-container">
        <div className="login-prompt">
          <p>Please login to book an appointment</p>
          <button onClick={() => navigate('/login')}>Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="book-appointment-container">
      <div className="appointment-card">
        <h2>Book Appointment</h2>
        <form onSubmit={handleSubmit} className="appointment-form">
          <input
            type="text"
            placeholder="Your Name"
            value={formData.patientName}
            onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Your Email"
            value={formData.patientEmail}
            onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
            required
          />
          <input
            type="tel"
            placeholder="Your Phone"
            value={formData.patientPhone}
            onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
            required
          />
          <input
            type="datetime-local"
            value={formData.appointmentDateTime}
            onChange={(e) => setFormData({ ...formData, appointmentDateTime: e.target.value })}
            required
          />
          <textarea
            placeholder="Describe your symptoms"
            value={formData.symptoms}
            onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
            rows="4"
          />
          <button type="submit">
            Book Appointment
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;
