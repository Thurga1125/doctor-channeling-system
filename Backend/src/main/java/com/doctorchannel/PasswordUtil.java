package com.doctorchannel;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordUtil {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String rawPassword = "admin123"; // Change this to your desired password
        String encodedPassword = encoder.encode(rawPassword);
        System.out.println("Encoded password for '" + rawPassword + "': " + encodedPassword);
    }
}
