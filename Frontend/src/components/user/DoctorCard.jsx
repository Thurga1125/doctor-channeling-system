import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctorImage } from '../../utils/doctorImages';
import './DoctorCard.css';

const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate();

  return (
    <div className="doctor-card">
      <div className="doctor-image">
        <img 
          src={getDoctorImage(doctor.imageUrl)} 
          alt={doctor.name} 
        />
      </div>
      
      <div className="doctor-info">
        <h3>{doctor.name}</h3>
        <p className="specialty">{doctor.specialty}</p>
        <p className="qualification">{doctor.qualification}</p>
        
        <div className="doctor-details">
          <span className="detail-item">
            🏥 {doctor.hospitalName}
          </span>
          <span className="detail-item">
            📍 {doctor.city}
          </span>
          <span className="detail-item">
            💰 ${doctor.consultationFee}
          </span>
        </div>
        
        <button 
          className="book-button"
          onClick={() => navigate(`/doctors/${doctor.id}`)}
        >
          View Profile & Book
        </button>
      </div>
    </div>
  );
};

export default DoctorCard;
