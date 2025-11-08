package com.doctorchannel.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

    @Id
    private String id;
    
    @Field("user_id")
    private String userId;
    
    @Field("doctor_id")
    private String doctorId;
    
    private String patientName;
    private String patientEmail;
    private String patientPhone;
    
    @Field("appointment_date_time")
    private LocalDateTime appointmentDateTime;
    
    private String status; // "PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"
    private String symptoms;
    
    @Field("created_at")
    private LocalDateTime createdAt;
    
    @Field("updated_at")
    private LocalDateTime updatedAt;
    
    // MongoDB doesn't support @PrePersist/@PreUpdate, use lifecycle methods or service layer
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
