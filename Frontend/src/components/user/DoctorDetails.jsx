import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import { getDoctorImage } from '../../utils/doctorImages';
import './DoctorDetails.css';

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDoctor = useCallback(async () => {
    try {
      const data = await doctorService.getDoctorById(id);
      setDoctor(data);
    } catch (error) {
      console.error('Error loading doctor:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDoctor();
  }, [loadDoctor]);

  // Auto-refresh when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadDoctor();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadDoctor]);

  if (loading) return <div className="doctor-details-container"><div className="loading">Loading...</div></div>;
  if (!doctor) return <div className="doctor-details-container"><div className="not-found">Doctor not found</div></div>;

  return (
    <div className="doctor-details-container">
      <div className="doctor-details-card">
        <div className="doctor-details-header">
          <div className="doctor-details-image">
            <img src={getDoctorImage(doctor.imageUrl)} alt={doctor.name} />
          </div>
          <div className="doctor-details-info">
            <h1>{doctor.name}</h1>
            <p><strong>Specialty:</strong> {doctor.specialty}</p>
            <p><strong>Qualification:</strong> {doctor.qualification}</p>
            <p><strong>Hospital:</strong> {doctor.hospitalName}</p>
            <p><strong>City:</strong> {doctor.city}</p>
            <p><strong>Consultation Fee:</strong> Rs. {doctor.consultationFee}</p>
            <button
              className="book-button"
              onClick={() => navigate(`/book-appointment/${doctor.id}`)}
            >
              Book Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetails;
