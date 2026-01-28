import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/doctorService';
import AddDoctor from './AddDoctor';
import EditDoctor from './EditDoctor';
import './DoctorManagement.css';

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const data = await doctorService.getAllDoctors();
      setDoctors(data);
    } catch (error) {
      console.error('Error loading doctors:', error);
      alert('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await doctorService.deleteDoctor(id);
        loadDoctors();
        alert('Doctor deleted successfully');
      } catch (error) {
        console.error('Error deleting doctor:', error);
        alert('Failed to delete doctor');
      }
    }
  };

  const handleAddSuccess = () => {
    setShowAddModal(false);
    loadDoctors();
  };

  const handleEditSuccess = () => {
    setEditingDoctor(null);
    loadDoctors();
  };

  return (
    <div className="doctor-management">
      <div className="management-header">
        <h2>Doctor Management</h2>
        <button 
          className="btn-add"
          onClick={() => setShowAddModal(true)}
        >
          ➕ Add New Doctor
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="doctors-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Specialty</th>
                <th>Hospital</th>
                <th>City</th>
                <th>Fee</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map(doctor => (
                <tr key={doctor.id}>
                  <td>{doctor.name}</td>
                  <td>{doctor.specialty}</td>
                  <td>{doctor.hospitalName}</td>
                  <td>{doctor.city}</td>
                  <td>Rs. {doctor.consultationFee}</td>
                  <td className="actions">
                    <button 
                      className="btn-edit"
                      onClick={() => setEditingDoctor(doctor)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(doctor.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <AddDoctor 
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}

      {editingDoctor && (
        <EditDoctor 
          doctor={editingDoctor}
          onClose={() => setEditingDoctor(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default DoctorManagement;
