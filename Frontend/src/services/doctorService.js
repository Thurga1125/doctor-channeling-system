import api from './api';

export const doctorService = {
  getAllDoctors: async () => {
    const response = await api.get('/doctors');
    return response.data;
  },

  getDoctorById: async (id) => {
    const response = await api.get(`/doctors/${id}`);
    return response.data;
  },

  searchBySpecialty: async (specialty) => {
    const response = await api.get('/doctors/search/specialty', {
      params: { specialty }
    });
    return response.data;
  },

  searchByName: async (name) => {
    const response = await api.get('/doctors/search/name', {
      params: { name }
    });
    return response.data;
  },

  searchByCity: async (city) => {
    const response = await api.get('/doctors/search/city', {
      params: { city }
    });
    return response.data;
  },

  createDoctor: async (doctorData) => {
    const response = await api.post('/doctors', doctorData);
    return response.data;
  },

  updateDoctor: async (id, doctorData) => {
    const response = await api.put(`/doctors/${id}`, doctorData);
    return response.data;
  },

  deleteDoctor: async (id) => {
    const response = await api.delete(`/doctors/${id}`);
    return response.data;
  }
};
