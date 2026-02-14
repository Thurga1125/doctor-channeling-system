import React, { useState, useEffect, useCallback } from 'react';
import { appointmentService } from '../../services/appointmentService';
import { useAuth } from '../../context/AuthContext';
import './MyAppointments.css';

const MyAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAppointments = useCallback(async () => {
    try {
      const data = await appointmentService.getUserAppointments(user.id);
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadAppointments();
    }
  }, [user, loadAppointments]);

  if (loading) return <div className="my-appointments-container"><div className="loading">Loading...</div></div>;

  return (
    <div className="my-appointments-container">
      <div className="appointments-content">
        <h2>My Appointments</h2>
        {appointments.length === 0 ? (
          <div className="no-appointments">No appointments found</div>
        ) : (
          <div className="appointments-list">
            {appointments.map(apt => (
              <div key={apt.id} className="appointment-item">
                <p><strong>Date:</strong> {new Date(apt.appointmentDateTime).toLocaleString()}</p>
                <p><strong>Status:</strong> {apt.status}</p>
                <p><strong>Symptoms:</strong> {apt.symptoms}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
