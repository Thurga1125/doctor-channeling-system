package com.doctorchannel.controller;

import com.doctorchannel.model.Doctor;
import com.doctorchannel.service.DoctorService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DoctorController.class)
class DoctorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DoctorService doctorService;

    @Autowired
    private ObjectMapper objectMapper;

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
        testDoctor.setIsActive(true);
    }

    @Test
    @WithMockUser
    void getAllDoctors_ShouldReturnDoctorsList() throws Exception {
        when(doctorService.getAllDoctors()).thenReturn(Arrays.asList(testDoctor));

        mockMvc.perform(get("/api/doctors"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Dr. John Smith"))
                .andExpect(jsonPath("$[0].specialty").value("Cardiologist"));
    }

    @Test
    @WithMockUser
    void getDoctorById_WhenExists_ShouldReturnDoctor() throws Exception {
        when(doctorService.getDoctorById("doc123")).thenReturn(Optional.of(testDoctor));

        mockMvc.perform(get("/api/doctors/doc123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Dr. John Smith"));
    }

    @Test
    @WithMockUser
    void getDoctorById_WhenNotExists_ShouldReturn404() throws Exception {
        when(doctorService.getDoctorById("invalid")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/doctors/invalid"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void searchBySpecialty_ShouldReturnMatchingDoctors() throws Exception {
        when(doctorService.searchDoctorsBySpecialty("Cardio")).thenReturn(Arrays.asList(testDoctor));

        mockMvc.perform(get("/api/doctors/search/specialty")
                        .param("specialty", "Cardio"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].specialty").value("Cardiologist"));
    }

    @Test
    @WithMockUser
    void createDoctor_ShouldReturnCreatedDoctor() throws Exception {
        when(doctorService.createDoctor(any(Doctor.class))).thenReturn(testDoctor);

        mockMvc.perform(post("/api/doctors")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testDoctor)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser
    void deleteDoctor_ShouldReturn204() throws Exception {
        mockMvc.perform(delete("/api/doctors/doc123")
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }
}
