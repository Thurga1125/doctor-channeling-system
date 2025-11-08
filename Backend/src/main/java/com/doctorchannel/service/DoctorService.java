package com.doctorchannel.service;

import com.doctorchannel.model.Doctor;
import com.doctorchannel.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Optional<Doctor> getDoctorById(String id) {
        return doctorRepository.findById(id);
    }

    public List<Doctor> searchDoctorsBySpecialty(String specialty) {
        return doctorRepository.findBySpecialtyContainingIgnoreCase(specialty);
    }

    public List<Doctor> searchDoctorsByName(String name) {
        return doctorRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Doctor> searchDoctorsByCity(String city) {
        return doctorRepository.findByCityContainingIgnoreCase(city);
    }

    public Doctor createDoctor(Doctor doctor) {
        doctor.setIsActive(true);
        return doctorRepository.save(doctor);
    }

    public Doctor updateDoctor(String id, Doctor doctorDetails) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        doctor.setName(doctorDetails.getName());
        doctor.setSpecialty(doctorDetails.getSpecialty());
        doctor.setQualification(doctorDetails.getQualification());
        doctor.setEmail(doctorDetails.getEmail());
        doctor.setPhone(doctorDetails.getPhone());
        doctor.setHospitalName(doctorDetails.getHospitalName());
        doctor.setAddress(doctorDetails.getAddress());
        doctor.setCity(doctorDetails.getCity());
        doctor.setConsultationFee(doctorDetails.getConsultationFee());
        doctor.setImageUrl(doctorDetails.getImageUrl());
        doctor.setAvailableDays(doctorDetails.getAvailableDays());
        doctor.setStartTime(doctorDetails.getStartTime());
        doctor.setEndTime(doctorDetails.getEndTime());
        doctor.setSlotDuration(doctorDetails.getSlotDuration());

        return doctorRepository.save(doctor);
    }

    public void deleteDoctor(String id) {
        doctorRepository.deleteById(id);
    }
}
