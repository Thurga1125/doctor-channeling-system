import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import api from '../../services/api';

const ScheduleManager = () => {
  const [schedules, setSchedules] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(null);

  useEffect(() => {
    fetchDoctors();
    fetchSchedules();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors');
      setDoctors(response.data);
      if (response.data.length > 0) {
        setSelectedDoctor(response.data[0]._id);
      }
    } catch (err) {
      setError('Failed to fetch doctors');
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await api.get('/schedules');
      setSchedules(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch schedules');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDoctor || !date || !startTime || !endTime) {
      setError('All fields are required');
      return;
    }

    const scheduleData = {
      doctor: selectedDoctor,
      date,
      startTime,
      endTime,
      isAvailable: true
    };

    try {
      if (isEditing) {
        await api.put(`/schedules/${isEditing}`, scheduleData);
      } else {
        await api.post('/schedules', scheduleData);
      }
      
      // Reset form
      setDate('');
      setStartTime('');
      setEndTime('');
      setIsEditing(null);
      
      // Refresh schedules
      fetchSchedules();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save schedule');
    }
  };

  const handleEdit = (schedule) => {
    setSelectedDoctor(schedule.doctor._id);
    setDate(schedule.date.split('T')[0]);
    setStartTime(schedule.startTime);
    setEndTime(schedule.endTime);
    setIsEditing(schedule._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await api.delete(`/schedules/${id}`);
        fetchSchedules();
      } catch (err) {
        setError('Failed to delete schedule');
      }
    }
  };

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d._id === doctorId);
    return doctor ? doctor.name : 'Unknown Doctor';
  };

  if (loading) return <div>Loading schedules...</div>;

  return (
    <div className="schedule-manager">
      <h2>Manage Doctor Schedules</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="schedule-form">
        <h3>{isEditing ? 'Edit Schedule' : 'Add New Schedule'}</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Doctor</label>
            <select 
              value={selectedDoctor} 
              onChange={(e) => setSelectedDoctor(e.target.value)}
              required
            >
              {doctors.map(doctor => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.name} - {doctor.specialty}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div className="time-inputs">
            <div className="form-group">
              <label>Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="form-actions">
            {isEditing && (
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => {
                  setIsEditing(null);
                  setDate('');
                  setStartTime('');
                  setEndTime('');
                }}
              >
                Cancel
              </button>
            )}
            <button type="submit" className="submit-button">
              {isEditing ? 'Update Schedule' : 'Add Schedule'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="schedules-list">
        <h3>Upcoming Schedules</h3>
        
        {schedules.length === 0 ? (
          <div className="no-schedules">No schedules found</div>
        ) : (
          <div className="schedules-grid">
            {schedules.map(schedule => (
              <div key={schedule._id} className="schedule-card">
                <div className="schedule-header">
                                    <h4>{new Date(schedule.date).toDateString()}</h4>
                </div>
                
                <div className="schedule-details">
                  <div className="doctor-info">
                    <strong>{getDoctorName(schedule.doctor)}</strong>
                  </div>
                  
                  <div className="time-slot">
                    {new Date(`1970-01-01T${schedule.startTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                    {new Date(`1970-01-01T${schedule.endTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  
                  <div className={`status ${schedule.isAvailable ? 'available' : 'booked'}`}>
                    {schedule.isAvailable ? 'Available' : 'Booked'}
                  </div>
                </div>
                
                <div className="schedule-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEdit(schedule)}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(schedule._id)}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleManager;
