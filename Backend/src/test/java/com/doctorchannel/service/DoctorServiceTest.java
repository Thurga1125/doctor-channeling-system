package com.doctorchannel.service;

import com.doctorchannel.model.Doctor;
import com.doctorchannel.repository.DoctorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DoctorServiceTest {

    @Mock
    private DoctorRepository doctorRepository;

    @InjectMocks
    private DoctorService doctorService;

    private Doctor testDoctor;

    @BeforeEach
    void setUp() {
        testDoctor = new Doctor();
        testDoctor.setId("doc123");
        testDoctor.setName("Dr. John Smith");
        testDoctor.setSpecialty("Cardiologist");
        testDoctor.setCity("Kalmunai");
        testDoctor.setHospitalName("Mediland Hospital");
        testDoctor.setConsultationFee(2500.0);
        testDoctor.setEmail("john.smith@mediland.com");
        testDoctor.setPhone("0771234567");
        testDoctor.setIsActive(true);
    }

    @Test
    void getAllDoctors_ShouldReturnAllDoctors() {
        List<Doctor> doctors = Arrays.asList(testDoctor);
        when(doctorRepository.findAll()).thenReturn(doctors);

        List<Doctor> result = doctorService.getAllDoctors();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Dr. John Smith", result.get(0).getName());
        verify(doctorRepository, times(1)).findAll();
    }

    @Test
    void getDoctorById_WhenExists_ShouldReturnDoctor() {
        when(doctorRepository.findById("doc123")).thenReturn(Optional.of(testDoctor));

        Optional<Doctor> result = doctorService.getDoctorById("doc123");

        assertTrue(result.isPresent());
        assertEquals("Dr. John Smith", result.get().getName());
    }

    @Test
    void getDoctorById_WhenNotExists_ShouldReturnEmpty() {
        when(doctorRepository.findById("invalid")).thenReturn(Optional.empty());

        Optional<Doctor> result = doctorService.getDoctorById("invalid");

        assertFalse(result.isPresent());
    }

    @Test
    void createDoctor_ShouldSaveAndReturnDoctor() {
        when(doctorRepository.save(any(Doctor.class))).thenReturn(testDoctor);

        Doctor result = doctorService.createDoctor(testDoctor);

        assertNotNull(result);
        assertEquals("Dr. John Smith", result.getName());
        verify(doctorRepository, times(1)).save(any(Doctor.class));
    }

    @Test
    void searchDoctorsBySpecialty_ShouldReturnMatchingDoctors() {
        List<Doctor> doctors = Arrays.asList(testDoctor);
        when(doctorRepository.findBySpecialtyContainingIgnoreCase("Cardio")).thenReturn(doctors);

        List<Doctor> result = doctorService.searchDoctorsBySpecialty("Cardio");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Cardiologist", result.get(0).getSpecialty());
    }

    @Test
    void searchDoctorsByCity_ShouldReturnMatchingDoctors() {
        List<Doctor> doctors = Arrays.asList(testDoctor);
        when(doctorRepository.findByCityContainingIgnoreCase("Kalmunai")).thenReturn(doctors);

        List<Doctor> result = doctorService.searchDoctorsByCity("Kalmunai");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Kalmunai", result.get(0).getCity());
    }

    @Test
    void deleteDoctor_ShouldCallRepositoryDelete() {
        doNothing().when(doctorRepository).deleteById("doc123");

        doctorService.deleteDoctor("doc123");

        verify(doctorRepository, times(1)).deleteById("doc123");
    }
}
