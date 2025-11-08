package com.doctorchannel.controller;

import com.doctorchannel.model.User;
import com.doctorchannel.service.AuthService;
import com.doctorchannel.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthService authService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        System.out.println("=== LOGIN ATTEMPT ===");
        System.out.println("Email: " + email);
        System.out.println("Password provided: " + password);

        Optional<User> userOpt = userService.getUserByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            System.out.println("User found: " + user.getEmail());
            System.out.println("Stored password hash: " + user.getPassword());
            System.out.println("Password matches: " + passwordEncoder.matches(password, user.getPassword()));
            
            if (passwordEncoder.matches(password, user.getPassword())) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("user", user);
                response.put("message", "Login successful");
                return ResponseEntity.ok(response);
            }
        } else {
            System.out.println("User NOT found for email: " + email);
        }

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("success", false);
        errorResponse.put("message", "Invalid credentials");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody User user) {
        User createdUser = authService.registerUser(user);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("user", createdUser);
        response.put("message", "Registration successful");

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // TEST ENDPOINT - Generate correct hash
    @GetMapping("/test-hash")
    public ResponseEntity<Map<String, String>> testHash() {
        String plainPassword = "admin123";
        String hashedPassword = passwordEncoder.encode(plainPassword);
        
        Map<String, String> response = new HashMap<>();
        response.put("plainPassword", plainPassword);
        response.put("hashedPassword", hashedPassword);
        response.put("hashLength", String.valueOf(hashedPassword.length()));
        response.put("matches", String.valueOf(passwordEncoder.matches(plainPassword, hashedPassword)));
        
        return ResponseEntity.ok(response);
    }

    // TEST ENDPOINT - Verify existing hash
    @PostMapping("/verify-hash")
    public ResponseEntity<Map<String, Object>> verifyHash(@RequestBody Map<String, String> request) {
        String plainPassword = request.get("password");
        String hash = request.get("hash");
        
        Map<String, Object> response = new HashMap<>();
        response.put("plainPassword", plainPassword);
        response.put("hash", hash);
        response.put("hashLength", hash.length());
        response.put("matches", passwordEncoder.matches(plainPassword, hash));
        
        return ResponseEntity.ok(response);
    }
}
