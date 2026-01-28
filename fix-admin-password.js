// MongoDB script to fix admin password
// Run this in MongoDB Compass or mongosh

// Connect to your database first, then run:

db.users.updateOne(
  { email: "admin@doctorchannel.com" },
  { 
    $set: { 
      password: "$2a$10$YourBCryptHashWillGoHere"
    } 
  }
);

// To generate the correct BCrypt hash:
// 1. Make sure your Spring Boot backend is running
// 2. Visit: http://localhost:8080/api/auth/test-hash
// 3. Copy the "hashedPassword" value from the response
// 4. Replace "$2a$10$YourBCryptHashWillGoHere" above with that value
// 5. Run this script in MongoDB

// Alternative: Use the backend endpoint to verify
// POST http://localhost:8080/api/auth/verify-hash
// Body: { "password": "admin123", "hash": "<admin123>" }
// This will show you if the current hash matches
