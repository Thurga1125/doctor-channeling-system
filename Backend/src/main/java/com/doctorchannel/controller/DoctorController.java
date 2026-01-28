package com.doctorchannel.controller;

import com.doctorchannel.model.Doctor;
import com.doctorchannel.service.DoctorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctors")
@Tag(name = "Doctor", description = "Doctor management APIs")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @Operation(summary = "Get all doctors", description = "Retrieves a list of all registered doctors")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved doctors list")
    @GetMapping
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @Operation(summary = "Get doctor by ID", description = "Retrieves a specific doctor by their ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Doctor found"),
        @ApiResponse(responseCode = "404", description = "Doctor not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getDoctorById(
            @Parameter(description = "Doctor ID") @PathVariable String id) {
        return doctorService.getDoctorById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Search doctors by specialty", description = "Find doctors by their medical specialty")
    @GetMapping("/search/specialty")
    public ResponseEntity<List<Doctor>> searchBySpecialty(
            @Parameter(description = "Specialty name (e.g., Cardiologist, Dermatologist)")
            @RequestParam String specialty) {
        return ResponseEntity.ok(doctorService.searchDoctorsBySpecialty(specialty));
    }

    @Operation(summary = "Search doctors by name", description = "Find doctors by their name")
    @GetMapping("/search/name")
    public ResponseEntity<List<Doctor>> searchByName(
            @Parameter(description = "Doctor name or partial name")
            @RequestParam String name) {
        return ResponseEntity.ok(doctorService.searchDoctorsByName(name));
    }

    @Operation(summary = "Search doctors by city", description = "Find doctors by city/location")
    @GetMapping("/search/city")
    public ResponseEntity<List<Doctor>> searchByCity(
            @Parameter(description = "City name")
            @RequestParam String city) {
        return ResponseEntity.ok(doctorService.searchDoctorsByCity(city));
    }

    @Operation(summary = "Create new doctor", description = "Add a new doctor to the system (Admin only)")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Doctor created successfully"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PostMapping
    public ResponseEntity<Map<String, Object>> createDoctor(@RequestBody Doctor doctor) {
        try {
            Doctor savedDoctor = doctorService.createDoctor(doctor);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Doctor added successfully");
            response.put("doctor", savedDoctor);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to add doctor: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @Operation(summary = "Update doctor", description = "Update an existing doctor's information (Admin only)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Doctor updated successfully"),
        @ApiResponse(responseCode = "404", description = "Doctor not found")
    })
    @PutMapping("/{id}")
    public ResponseEntity<Doctor> updateDoctor(
            @Parameter(description = "Doctor ID") @PathVariable String id,
            @RequestBody Doctor doctor) {
        return ResponseEntity.ok(doctorService.updateDoctor(id, doctor));
    }

    @Operation(summary = "Delete doctor", description = "Remove a doctor from the system (Admin only)")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Doctor deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Doctor not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDoctor(
            @Parameter(description = "Doctor ID") @PathVariable String id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.noContent().build();
    }
}
