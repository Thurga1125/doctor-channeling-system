package com.doctorchannel.repository;

import com.doctorchannel.model.Doctor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorRepository extends MongoRepository<Doctor, String> {
    List<Doctor> findBySpecialtyContainingIgnoreCase(String specialty);
    List<Doctor> findByNameContainingIgnoreCase(String name);
    List<Doctor> findByCityContainingIgnoreCase(String city);
    List<Doctor> findByIsActive(Boolean isActive);
}
