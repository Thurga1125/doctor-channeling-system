import React, { useState } from 'react';
import DoctorManagement from './DoctorManagement';
import UserManagement from './UserManagement';  
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('doctors');

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <h2>Admin Panel</h2>
        <nav className="admin-nav">
          <button 
            className={activeTab === 'doctors' ? 'active' : ''}
            onClick={() => setActiveTab('doctors')}
          >
            👨‍⚕️ Manage Doctors
          </button>
          <button 
            className={activeTab === 'appointments' ? 'active' : ''}
            onClick={() => setActiveTab('appointments')}
          >
            📅 Appointments
          </button>
          <button 
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            👥 Users
          </button>
        </nav>
      </div>
      
      <div className="admin-content">
        {activeTab === 'doctors' && <DoctorManagement />}
        {activeTab === 'appointments' && <div>Appointments Management (To be implemented)</div>}
        {activeTab === 'users' && <UserManagement />}
      </div>
    </div>
  );
};

export default AdminDashboard;
