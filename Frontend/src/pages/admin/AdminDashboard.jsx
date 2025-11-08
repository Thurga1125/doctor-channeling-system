import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import DoctorList from '../../components/admin/DoctorList';
import DoctorForm from '../../components/admin/DoctorForm';
import ScheduleManager from '../../components/admin/ScheduleManager';
import '../../components/admin/AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('doctors');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated() || !authService.isAdmin()) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleEditDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setActiveTab('addDoctor');
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <h2>Admin Panel</h2>
        <div className="admin-nav">
          <button 
            className={activeTab === 'doctors' ? 'active' : ''}
            onClick={() => {
              setActiveTab('doctors');
              setSelectedDoctor(null);
            }}
          >
            Manage Doctors
          </button>
          <button 
            className={activeTab === 'addDoctor' ? 'active' : ''}
            onClick={() => {
              setActiveTab('addDoctor');
              setSelectedDoctor(null);
            }}
          >
            {selectedDoctor ? 'Edit Doctor' : 'Add New Doctor'}
          </button>
          <button 
            className={activeTab === 'schedules' ? 'active' : ''}
            onClick={() => setActiveTab('schedules')}
          >
            Manage Schedules
          </button>
          <button onClick={handleLogout} style={{ marginTop: 'auto' }}>
            Logout
          </button>
        </div>
      </div>
      
      <div className="admin-content">
        {activeTab === 'doctors' && <DoctorList onEdit={handleEditDoctor} />}
        {activeTab === 'addDoctor' && (
          <DoctorForm doctor={selectedDoctor} onSuccess={() => setActiveTab('doctors')} />
        )}
        {activeTab === 'schedules' && <ScheduleManager />}
      </div>
    </div>
  );
};

export default AdminDashboard;
