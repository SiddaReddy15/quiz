import { db } from "./config/db";

async function checkUsers() {
    try {
        const result = await db.execute("SELECT name, email, role FROM users");
        console.log("Users in database:");
        console.table(result.rows);
    } catch (error) {
        console.error("Error checking users:", error);
    }
}

checkUsers();
