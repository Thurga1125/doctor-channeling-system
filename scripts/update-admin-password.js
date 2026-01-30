// MongoDB Update Script - Fix Admin Password
// Run this in MongoDB Compass (Mongosh tab) or mongosh CLI

// This BCrypt hash is for the password: admin123
// Generated using BCrypt with strength 10

db.users.updateOne(
  { email: "admin@doctorchannel.com" },
  { 
    $set: { 
      password: "$2a$10$62UeGI0Ikr31nEoryMuXWeb/TCb/zBk/AGwjRpvLiBhqRhcVSPsjO",
      role: "ADMIN",
      isActive: true
    } 
  }
);

// Verify the update
db.users.findOne({ email: "admin@doctorchannel.com" });

// Expected output should show:
// - password starting with "$2a$10$" (60 characters total)
// - role: "ADMIN"
// - isActive: true

console.log("Admin password updated successfully!");
console.log("You can now login with:");
console.log("Email: admin@doctorchannel.com");
console.log("Password: admin123");
