#!/bin/bash

# Generate BCrypt hash for admin123 password
# This script will output the hash that needs to be updated in MongoDB

echo "Generating BCrypt hash for 'admin123'..."
echo ""
echo "Run this command to generate the hash:"
echo "cd Backend && mvn exec:java -Dexec.mainClass=\"com.doctorchannel.PasswordUtil\" -q"
echo ""
echo "Then update MongoDB with:"
echo "db.users.updateOne("
echo "  { email: 'admin@doctorchannel.com' },"
echo "  { \$set: { password: 'PASTE_GENERATED_HASH_HERE' } }"
echo ")"
