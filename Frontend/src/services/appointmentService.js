import api from './api';

export const appointmentService = {
  getAllAppointments: async () => {
    const response = await api.get('/appointments');
    return response.data;
  },

  getAppointmentById: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  getUserAppointments: async (userId) => {
    const response = await api.get(`/appointments/user/${userId}`);
    return response.data;
  },

  getDoctorAppointments: async (doctorId) => {
    const response = await api.get(`/appointments/doctor/${doctorId}`);
    return response.data;
  },

  createAppointment: async (appointmentData) => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },

  updateAppointmentStatus: async (id, status) => {
    const response = await api.put(`/appointments/${id}/status`, null, {
      params: { status }
    });
    return response.data;
  },

  deleteAppointment: async (id) => {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  }
};
