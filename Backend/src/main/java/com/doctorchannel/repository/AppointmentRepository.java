package com.doctorchannel.repository;

import com.doctorchannel.model.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends MongoRepository<Appointment, String> {
    List<Appointment> findByUserId(String userId);
    List<Appointment> findByDoctorId(String doctorId);
    List<Appointment> findByStatus(String status);
    List<Appointment> findByDoctorIdAndAppointmentDateTimeBetween(
            String doctorId, LocalDateTime start, LocalDateTime end);
}
