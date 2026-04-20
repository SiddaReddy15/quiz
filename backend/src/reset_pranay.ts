import { db } from "./config/db";
import bcrypt from "bcryptjs";

async function reset() {
    try {
        const adminPassword = await bcrypt.hash("admin123", 10);
        await db.execute({
            sql: "UPDATE users SET password = ?, role = 'ADMIN' WHERE email = 'pranay@gmail.com'",
            args: [adminPassword]
        });
        console.log("Successfully reset password for pranay@gmail.com to 'admin123' and role to 'ADMIN'");
        
        const check = await db.execute({
            sql: "SELECT * FROM users WHERE email = 'pranay@gmail.com'",
            args: []
        });
        console.log("Current user record:", JSON.stringify(check.rows[0], null, 2));
    } catch (e) {
        console.error(e);
    }
}

reset();
