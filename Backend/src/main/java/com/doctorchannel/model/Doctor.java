package com.doctorchannel.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Document(collection = "doctors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {

    @Id
    private String id;
    
    private String name;
    private String specialty;
    private String qualification;
    
    @Indexed(unique = true)
    private String email;
    
    private String phone;
    
    @Field("hospital_name")
    private String hospitalName;
    
    private String address;
    private String city;
    
    @Field("consultation_fee")
    private Double consultationFee;
    
    @Field("image_url")
    private String imageUrl;
    
    @Field("available_days")
    private List<String> availableDays;
    
    @Field("start_time")
    private String startTime;
    
    @Field("end_time")
    private String endTime;
    
    @Field("slot_duration")
    private Integer slotDuration; // in minutes
    
    @Field("is_active")
    private Boolean isActive = true;
}
