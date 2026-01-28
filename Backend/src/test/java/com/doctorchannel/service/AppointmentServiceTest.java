package com.doctorchannel.service;

import com.doctorchannel.model.Appointment;
import com.doctorchannel.repository.AppointmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @InjectMocks
    private AppointmentService appointmentService;

    private Appointment testAppointment;

    @BeforeEach
    void setUp() {
        testAppointment = new Appointment();
        testAppointment.setId("apt123");
        testAppointment.setUserId("user123");
        testAppointment.setDoctorId("doc123");
        testAppointment.setPatientName("John Doe");
        testAppointment.setPatientEmail("john@example.com");
        testAppointment.setPatientPhone("0771234567");
        testAppointment.setAppointmentDateTime(LocalDateTime.now().plusDays(1));
        testAppointment.setStatus("PENDING");
        testAppointment.setPaymentOption("PAY_AT_VISIT");
        testAppointment.setPaymentStatus("PENDING");
    }

    @Test
    void getAllAppointments_ShouldReturnAllAppointments() {
        List<Appointment> appointments = Arrays.asList(testAppointment);
        when(appointmentRepository.findAll()).thenReturn(appointments);

        List<Appointment> result = appointmentService.getAllAppointments();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("John Doe", result.get(0).getPatientName());
    }

    @Test
    void getAppointmentById_WhenExists_ShouldReturnAppointment() {
        when(appointmentRepository.findById("apt123")).thenReturn(Optional.of(testAppointment));

        Optional<Appointment> result = appointmentService.getAppointmentById("apt123");

        assertTrue(result.isPresent());
        assertEquals("apt123", result.get().getId());
    }

    @Test
    void getAppointmentsByUserId_ShouldReturnUserAppointments() {
        List<Appointment> appointments = Arrays.asList(testAppointment);
        when(appointmentRepository.findByUserId("user123")).thenReturn(appointments);

        List<Appointment> result = appointmentService.getAppointmentsByUserId("user123");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("user123", result.get(0).getUserId());
    }

    @Test
    void getAppointmentsByDoctorId_ShouldReturnDoctorAppointments() {
        List<Appointment> appointments = Arrays.asList(testAppointment);
        when(appointmentRepository.findByDoctorId("doc123")).thenReturn(appointments);

        List<Appointment> result = appointmentService.getAppointmentsByDoctorId("doc123");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("doc123", result.get(0).getDoctorId());
    }

    @Test
    void createAppointment_ShouldSaveAndReturnAppointment() {
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(testAppointment);

        Appointment result = appointmentService.createAppointment(testAppointment);

        assertNotNull(result);
        assertEquals("John Doe", result.getPatientName());
        verify(appointmentRepository, times(1)).save(any(Appointment.class));
    }

    @Test
    void updateAppointmentStatus_ShouldUpdateAndReturnAppointment() {
        when(appointmentRepository.findById("apt123")).thenReturn(Optional.of(testAppointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(testAppointment);

        Appointment result = appointmentService.updateAppointmentStatus("apt123", "CONFIRMED");

        assertNotNull(result);
        verify(appointmentRepository, times(1)).save(any(Appointment.class));
    }

    @Test
    void deleteAppointment_ShouldCallRepositoryDelete() {
        doNothing().when(appointmentRepository).deleteById("apt123");

        appointmentService.deleteAppointment("apt123");

        verify(appointmentRepository, times(1)).deleteById("apt123");
    }
}
