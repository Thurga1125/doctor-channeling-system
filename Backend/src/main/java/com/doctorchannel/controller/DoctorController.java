package com.doctorchannel.controller;

import com.doctorchannel.model.Doctor;
import com.doctorchannel.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctors")
// Remove @CrossOrigin (let global config handle CORS)
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @GetMapping
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable String id) {
        return doctorService.getDoctorById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search/specialty")
    public ResponseEntity<List<Doctor>> searchBySpecialty(@RequestParam String specialty) {
        return ResponseEntity.ok(doctorService.searchDoctorsBySpecialty(specialty));
    }

    @GetMapping("/search/name")
    public ResponseEntity<List<Doctor>> searchByName(@RequestParam String name) {
        return ResponseEntity.ok(doctorService.searchDoctorsByName(name));
    }

    @GetMapping("/search/city")
    public ResponseEntity<List<Doctor>> searchByCity(@RequestParam String city) {
        return ResponseEntity.ok(doctorService.searchDoctorsByCity(city));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createDoctor(@RequestBody Doctor doctor) {
        try {
            System.out.println("=== Received Doctor Data ===");
            System.out.println("Name: " + doctor.getName());
            System.out.println("Specialty: " + doctor.getSpecialty());
            System.out.println("City: " + doctor.getCity());
            System.out.println("Full Doctor: " + doctor);

            Doctor savedDoctor = doctorService.createDoctor(doctor);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Doctor added successfully");
            response.put("doctor", savedDoctor);

            System.out.println("✅ Doctor saved successfully: " + savedDoctor.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            System.err.println("❌ Error creating doctor: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to add doctor: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Doctor> updateDoctor(
            @PathVariable String id,
            @RequestBody Doctor doctor) {
        return ResponseEntity.ok(doctorService.updateDoctor(id, doctor));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDoctor(@PathVariable String id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.noContent().build();
    }
}
