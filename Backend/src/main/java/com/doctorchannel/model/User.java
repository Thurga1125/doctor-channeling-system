package com.doctorchannel.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String id;
    
    @Indexed(unique = true)
    @Field("email")
    private String email;
    
    @Field("password")
    private String password;
    
    @Field("full_name")
    private String fullName;
    
    private String phone;
    private String role; // "USER" or "ADMIN"
    
    @Field("is_active")
    private Boolean isActive = true;
}
