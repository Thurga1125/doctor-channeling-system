import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import api from '../../services/api';

const DoctorList = ({ onEdit }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors');
      setDoctors(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch doctors');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await api.delete(`/doctors/${id}`);
        setDoctors(doctors.filter(doctor => doctor._id !== id));
      } catch (err) {
        setError('Failed to delete doctor');
      }
    }
  };

  if (loading) return <div>Loading doctors...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="doctor-list">
      <div className="header">
        <h2>Manage Doctors</h2>
        <button 
          className="add-button"
          onClick={() => onEdit(null)}
        >
          <FaPlus /> Add New Doctor
        </button>
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Photo</th>
              <th>Name</th>
              <th>Specialty</th>
              <th>Qualification</th>
              <th>Hospital</th>
              <th>City</th>
              <th>Fee</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map(doctor => (
              <tr key={doctor._id}>
                <td>
                  <img 
                    src={doctor.imageUrl || '/images/default-doctor.png'} 
                    alt={doctor.name}
                    className="doctor-avatar"
                  />
                </td>
                <td>{doctor.name}</td>
                <td>{doctor.specialty}</td>
                <td>{doctor.qualification}</td>
                <td>{doctor.hospitalName}</td>
                <td>{doctor.city}</td>
                <td>${doctor.consultationFee}</td>
                <td className="actions">
                  <button 
                    className="edit-btn"
                    onClick={() => onEdit(doctor)}
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(doctor._id)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DoctorList;
