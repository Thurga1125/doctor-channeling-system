import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUpload } from 'react-icons/fa';
import api from '../../services/api';

const DoctorForm = ({ doctor, onSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    qualification: '',
    hospitalName: '',
    city: '',
    consultationFee: '',
    experience: '',
    about: '',
    image: null,
    imagePreview: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (doctor) {
      setFormData({
        name: doctor.name || '',
        specialty: doctor.specialty || '',
        qualification: doctor.qualification || '',
        hospitalName: doctor.hospitalName || '',
        city: doctor.city || '',
        consultationFee: doctor.consultationFee || '',
        experience: doctor.experience || '',
        about: doctor.about || '',
        image: null,
        imagePreview: doctor.imageUrl || ''
      });
    }
  }, [doctor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'imagePreview' && formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (doctor) {
        // Update existing doctor
        await api.put(`/doctors/${doctor._id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Create new doctor
        await api.post('/doctors', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="doctor-form">
      <div className="form-header">
        <button 
          className="back-button"
          onClick={() => onSuccess()}
        >
          <FaArrowLeft /> Back to Doctors
        </button>
        <h2>{doctor ? 'Edit Doctor' : 'Add New Doctor'}</h2>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Specialty</label>
            <input
              type="text"
              name="specialty"
              value={formData.specialty}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Qualification</label>
            <input
              type="text"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Hospital Name</label>
            <input
              type="text"
              name="hospitalName"
              value={formData.hospitalName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Consultation Fee (Rs.)</label>
            <input
              type="number"
              name="consultationFee"
              value={formData.consultationFee}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="form-group">
            <label>Experience</label>
            <input
              type="text"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              placeholder="e.g., 5 years"
              required
            />
          </div>
          
          <div className="form-group full-width">
            <label>About Doctor</label>
            <textarea
              name="about"
              value={formData.about}
              onChange={handleChange}
              rows="4"
              required
            />
          </div>
          
          <div className="form-group image-upload">
            <label>Doctor's Photo</label>
            <div className="image-upload-container">
              <div className="image-preview">
                {formData.imagePreview ? (
                  <img 
                    src={formData.imagePreview} 
                    alt="Doctor Preview" 
                    className="preview-image"
                  />
                ) : (
                  <div className="no-image">No image selected</div>
                )}
              </div>
              <label className="upload-button">
                <FaUpload /> Choose Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => onSuccess()}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Doctor'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorForm;
