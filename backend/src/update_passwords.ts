import { db } from "./config/db";
import bcrypt from "bcryptjs";

async function updatePasswords() {
    console.log("Updating student passwords to 'student123'...");
    const hashedPassword = await bcrypt.hash("student123", 10);
    
    await db.execute({
        sql: "UPDATE users SET password = ? WHERE role = 'STUDENT'",
        args: [hashedPassword]
    });
    
    console.log("✅ All student passwords updated to 'student123'");
    process.exit(0);
}

updatePasswords().catch(console.error);
