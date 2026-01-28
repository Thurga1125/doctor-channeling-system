import React, { useState, useEffect } from 'react';
import { appointmentService } from '../../services/appointmentService';
import { doctorService } from '../../services/doctorService';
import './AppointmentManagement.css';

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, doctorsData] = await Promise.all([
        appointmentService.getAllAppointments(),
        doctorService.getAllDoctors()
      ]);

      // Create a lookup map for doctors
      const doctorMap = {};
      doctorsData.forEach(doctor => {
        doctorMap[doctor.id] = doctor;
      });

      setDoctors(doctorMap);
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, newStatus);
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update appointment status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await appointmentService.deleteAppointment(id);
        loadData();
      } catch (error) {
        console.error('Error deleting appointment:', error);
        alert('Failed to delete appointment');
      }
    }
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'N/A';
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'status-confirmed';
      case 'PENDING': return 'status-pending';
      case 'CANCELLED': return 'status-cancelled';
      case 'COMPLETED': return 'status-completed';
      default: return '';
    }
  };

  const getPaymentStatusClass = (status) => {
    switch (status) {
      case 'PAID': return 'payment-paid';
      case 'PARTIALLY_PAID': return 'payment-partial';
      case 'PENDING': return 'payment-pending';
      default: return '';
    }
  };

  const filteredAppointments = filterStatus === 'ALL'
    ? appointments
    : appointments.filter(apt => apt.status === filterStatus);

  return (
    <div className="appointment-management">
      <div className="management-header">
        <h2>Appointments Management</h2>
        <div className="filter-section">
          <label>Filter by Status: </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading appointments...</div>
      ) : filteredAppointments.length === 0 ? (
        <div className="no-appointments">No appointments found</div>
      ) : (
        <div className="appointments-table">
          <table>
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Doctor</th>
                <th>Date & Time</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map(appointment => (
                <tr key={appointment.id}>
                  <td>
                    <div className="patient-info">
                      <strong>{appointment.patientName}</strong>
                      <small>{appointment.patientEmail}</small>
                    </div>
                  </td>
                  <td>
                    <div className="doctor-info">
                      {doctors[appointment.doctorId] ? (
                        <>
                          <strong>{doctors[appointment.doctorId].name}</strong>
                          <small>{doctors[appointment.doctorId].specialty}</small>
                        </>
                      ) : (
                        <span>Unknown Doctor</span>
                      )}
                    </div>
                  </td>
                  <td>{formatDateTime(appointment.appointmentDateTime)}</td>
                  <td>{appointment.patientPhone}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td>
                    <div className="payment-info">
                      <span className={`payment-badge ${getPaymentStatusClass(appointment.paymentStatus)}`}>
                        {appointment.paymentStatus || 'PENDING'}
                      </span>
                      <small>{appointment.paymentOption}</small>
                    </div>
                  </td>
                  <td className="actions">
                    <select
                      className="status-select"
                      value={appointment.status}
                      onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(appointment.id)}
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

      <div className="appointments-summary">
        <div className="summary-card">
          <span className="summary-count">{appointments.length}</span>
          <span className="summary-label">Total</span>
        </div>
        <div className="summary-card pending">
          <span className="summary-count">
            {appointments.filter(a => a.status === 'PENDING').length}
          </span>
          <span className="summary-label">Pending</span>
        </div>
        <div className="summary-card confirmed">
          <span className="summary-count">
            {appointments.filter(a => a.status === 'CONFIRMED').length}
          </span>
          <span className="summary-label">Confirmed</span>
        </div>
        <div className="summary-card completed">
          <span className="summary-count">
            {appointments.filter(a => a.status === 'COMPLETED').length}
          </span>
          <span className="summary-label">Completed</span>
        </div>
      </div>
    </div>
  );
};

export default AppointmentManagement;
