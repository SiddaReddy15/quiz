import { db } from "./config/db";
import bcrypt from "bcryptjs";

async function testLogin() {
    const email = "pranay@gmail.com";
    const password = "admin123";

    try {
        const result = await db.execute({
            sql: "SELECT * FROM users WHERE email = ?",
            args: [email],
        });

        if (result.rows.length === 0) {
            console.log("TEST FAILED: User not found");
            return;
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password as string);
        
        if (isMatch) {
            console.log("TEST PASSED: Login successful for pranay@gmail.com with admin123");
        } else {
            console.log("TEST FAILED: Password mismatch");
            console.log("Provided password:", password);
            console.log("Stored hash:", user.password);
        }
    } catch (e) {
        console.error(e);
    }
}

testLogin();
