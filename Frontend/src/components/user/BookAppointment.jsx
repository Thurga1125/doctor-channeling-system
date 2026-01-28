import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { appointmentService } from '../../services/appointmentService';
import { doctorService } from '../../services/doctorService';
import { useAuth } from '../../context/AuthContext';
import './BookAppointment.css';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [formData, setFormData] = useState({
    patientName: user?.fullName || '',
    patientEmail: user?.email || '',
    patientPhone: user?.phone || '',
    appointmentDateTime: '',
    symptoms: '',
    paymentOption: 'PAY_AT_VISIT'
  });

  useEffect(() => {
    loadDoctor();
  }, [doctorId]);

  const loadDoctor = async () => {
    try {
      const data = await doctorService.getDoctorById(doctorId);
      setDoctor(data);
    } catch (error) {
      console.error('Error loading doctor:', error);
    }
  };

  const calculatePaymentAmount = () => {
    if (!doctor) return 0;
    const fee = doctor.consultationFee;
    switch (formData.paymentOption) {
      case 'FULL':
        return fee;
      case 'HALF':
        return fee / 2;
      case 'PAY_AT_VISIT':
        return 0;
      default:
        return 0;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const appointmentData = {
        ...formData,
        userId: user?.id,
        doctorId: doctorId,
        appointmentDateTime: new Date(formData.appointmentDateTime).toISOString()
      };
      
      const response = await appointmentService.createAppointment(appointmentData);
      
      // Set booking details for confirmation
      setBookingDetails({
        appointmentId: response.id || 'Pending',
        doctorName: doctor?.name || 'Doctor',
        patientName: formData.patientName,
        appointmentDateTime: new Date(formData.appointmentDateTime).toLocaleString(),
        paymentOption: formData.paymentOption,
        paymentAmount: calculatePaymentAmount(),
        consultationFee: doctor?.consultationFee || 0
      });
      
      setShowConfirmation(true);
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    }
  };

  const getPaymentOptionLabel = (option) => {
    switch (option) {
      case 'FULL':
        return 'Full Payment';
      case 'HALF':
        return 'Half Payment (50%)';
      case 'PAY_AT_VISIT':
        return 'Pay at Visit';
      default:
        return option;
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

  if (showConfirmation && bookingDetails) {
    return (
      <div className="book-appointment-container">
        <div className="confirmation-card">
          <div className="confirmation-header">
            <div className="success-icon">✓</div>
            <h2>Appointment Booked Successfully!</h2>
          </div>
          
          <div className="booking-details">
            <h3>Booking Details</h3>
            <div className="detail-row">
              <span className="detail-label">Appointment ID:</span>
              <span className="detail-value">{bookingDetails.appointmentId}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Doctor:</span>
              <span className="detail-value">{bookingDetails.doctorName}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Patient:</span>
              <span className="detail-value">{bookingDetails.patientName}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Date & Time:</span>
              <span className="detail-value">{bookingDetails.appointmentDateTime}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Consultation Fee:</span>
              <span className="detail-value">Rs. {bookingDetails.consultationFee}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Payment Option:</span>
              <span className="detail-value">{getPaymentOptionLabel(bookingDetails.paymentOption)}</span>
            </div>
            {bookingDetails.paymentAmount > 0 && (
              <div className="detail-row highlight">
                <span className="detail-label">Amount to Pay Now:</span>
                <span className="detail-value">Rs. {bookingDetails.paymentAmount}</span>
              </div>
            )}
          </div>

          <div className="important-notice">
            <h4>Important Notice</h4>
            <p>Your appointment has been confirmed. For any changes or cancellations, please contact the admin.</p>
            <p className="contact-info">📞 Contact Admin: 0776975495</p>
          </div>

          <div className="confirmation-actions">
            <button 
              className="btn-primary"
              onClick={() => navigate('/my-appointments')}
            >
              View My Appointments
            </button>
            <button 
              className="btn-secondary"
              onClick={() => navigate('/doctors')}
            >
              Book Another Appointment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="book-appointment-container">
      <div className="appointment-card">
        <h2>Book Appointment</h2>
        {doctor && (
          <div className="doctor-info-summary">
            <p><strong>Doctor:</strong> {doctor.name}</p>
            <p><strong>Specialty:</strong> {doctor.specialty}</p>
            <p><strong>Consultation Fee:</strong> Rs. {doctor.consultationFee}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="appointment-form">
          <div className="form-group">
            <label>Your Name *</label>
            <input
              type="text"
              placeholder="Your Name"
              value={formData.patientName}
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Your Email *</label>
            <input
              type="email"
              placeholder="Your Email"
              value={formData.patientEmail}
              onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Your Phone *</label>
            <input
              type="tel"
              placeholder="Your Phone"
              value={formData.patientPhone}
              onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Appointment Date & Time *</label>
            <input
              type="datetime-local"
              value={formData.appointmentDateTime}
              onChange={(e) => setFormData({ ...formData, appointmentDateTime: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Symptoms</label>
            <textarea
              placeholder="Describe your symptoms"
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              rows="4"
            />
          </div>

          <div className="form-group payment-options">
            <label>Payment Option *</label>
            <div className="payment-radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="paymentOption"
                  value="FULL"
                  checked={formData.paymentOption === 'FULL'}
                  onChange={(e) => setFormData({ ...formData, paymentOption: e.target.value })}
                />
                <span className="radio-label">
                  <strong>Full Payment</strong>
                  {doctor && <span className="payment-amount"> - Rs. {doctor.consultationFee}</span>}
                </span>
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  name="paymentOption"
                  value="HALF"
                  checked={formData.paymentOption === 'HALF'}
                  onChange={(e) => setFormData({ ...formData, paymentOption: e.target.value })}
                />
                <span className="radio-label">
                  <strong>Half Payment (50%)</strong>
                  {doctor && <span className="payment-amount"> - Rs. {doctor.consultationFee / 2}</span>}
                </span>
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  name="paymentOption"
                  value="PAY_AT_VISIT"
                  checked={formData.paymentOption === 'PAY_AT_VISIT'}
                  onChange={(e) => setFormData({ ...formData, paymentOption: e.target.value })}
                />
                <span className="radio-label">
                  <strong>Pay at Visit</strong>
                  <span className="payment-amount"> - Pay when you arrive</span>
                </span>
              </label>
            </div>
          </div>

          <button type="submit" className="btn-book">
            Book Appointment
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;
