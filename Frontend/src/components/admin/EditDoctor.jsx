import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/doctorService';
import { doctorImageOptions, getDoctorImage } from '../../utils/doctorImages';

const EditDoctor = ({ doctor, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    qualification: '',
    email: '',
    phone: '',
    hospitalName: '',
    address: '',
    city: '',
    consultationFee: '',
    imageUrl: '',
    availableDays: [],
    startTime: '',
    endTime: '',
    slotDuration: 30
  });

  useEffect(() => {
    if (doctor) {
      setFormData({
        name: doctor.name || '',
        specialty: doctor.specialty || '',
        qualification: doctor.qualification || '',
        email: doctor.email || '',
        phone: doctor.phone || '',
        hospitalName: doctor.hospitalName || '',
        address: doctor.address || '',
        city: doctor.city || '',
        consultationFee: doctor.consultationFee || '',
        imageUrl: doctor.imageUrl || '',
        availableDays: doctor.availableDays || [],
        startTime: doctor.startTime || '',
        endTime: doctor.endTime || '',
        slotDuration: doctor.slotDuration || 30
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

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await doctorService.updateDoctor(doctor.id, {
        ...formData,
        consultationFee: parseFloat(formData.consultationFee),
        slotDuration: parseInt(formData.slotDuration)
      });
      alert('Doctor updated successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error updating doctor:', error);
      alert('Failed to update doctor');
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      overflow: 'auto',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        maxWidth: '700px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>Edit Doctor</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2c3e50' }}>
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '2px solid #e0e0e0' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2c3e50' }}>
                Specialty *
              </label>
              <input
                type="text"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '2px solid #e0e0e0' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2c3e50' }}>
              Qualification *
            </label>
            <input
              type="text"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '2px solid #e0e0e0' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2c3e50' }}>
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '2px solid #e0e0e0' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2c3e50' }}>
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '2px solid #e0e0e0' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2c3e50' }}>
              Hospital Name *
            </label>
            <input
              type="text"
              name="hospitalName"
              value={formData.hospitalName}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '2px solid #e0e0e0' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2c3e50' }}>
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '2px solid #e0e0e0' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2c3e50' }}>
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '2px solid #e0e0e0' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2c3e50' }}>
                Consultation Fee *
              </label>
              <input
                type="number"
                name="consultationFee"
                value={formData.consultationFee}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '2px solid #e0e0e0' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2c3e50' }}>
              Doctor Image
            </label>
            <select
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '2px solid #e0e0e0' }}
            >
              <option value="">Select an image</option>
              {doctorImageOptions.map((img) => (
                <option key={img.id} value={img.id}>{img.label}</option>
              ))}
            </select>
            {formData.imageUrl && (
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <img 
                  src={getDoctorImage(formData.imageUrl)} 
                  alt="Preview" 
                  style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', objectFit: 'cover' }}
                />
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2c3e50' }}>
              Available Days
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {days.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(day)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: '2px solid #4A90E2',
                    background: formData.availableDays.includes(day) ? '#4A90E2' : 'white',
                    color: formData.availableDays.includes(day) ? 'white' : '#4A90E2',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2c3e50' }}>
                Start Time
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '2px solid #e0e0e0' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2c3e50' }}>
                End Time
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '2px solid #e0e0e0' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2c3e50' }}>
                Slot Duration (min)
              </label>
              <input
                type="number"
                name="slotDuration"
                value={formData.slotDuration}
                onChange={handleChange}
                min="15"
                step="15"
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '2px solid #e0e0e0' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" style={{
              flex: 1,
              background: '#4A90E2',
              color: 'white',
              padding: '1rem',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem'
            }}>
              Update Doctor
            </button>
            <button type="button" onClick={onClose} style={{
              flex: 1,
              background: '#e0e0e0',
              color: '#2c3e50',
              padding: '1rem',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem'
            }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDoctor;
