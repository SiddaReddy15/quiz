import { db } from "./src/config/db";

async function migrate() {
    console.log("🚀 Starting database migration...");
    try {
        console.log("Adding missing columns to 'answers' table...");
        
        try {
            await db.execute("ALTER TABLE answers ADD COLUMN selected_option TEXT");
            console.log("✅ Added selected_option");
        } catch (e: any) {
            console.log("⏭️ selected_option already exists or error: " + e.message);
        }

        try {
            await db.execute("ALTER TABLE answers ADD COLUMN answer_text TEXT");
            console.log("✅ Added answer_text");
        } catch (e: any) {
            console.log("⏭️ answer_text already exists or error: " + e.message);
        }

        try {
            await db.execute("ALTER TABLE answers ADD COLUMN code_content TEXT");
            console.log("✅ Added code_content");
        } catch (e: any) {
            console.log("⏭️ code_content already exists or error: " + e.message);
        }

        try {
            await db.execute("ALTER TABLE answers ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP");
            console.log("✅ Added created_at");
        } catch (e: any) {
            console.log("⏭️ created_at already exists or error: " + e.message);
        }

        console.log("✨ Migration completed successfully!");
    } catch (error) {
        console.error("❌ Migration failed:", error);
    }
}

migrate();
