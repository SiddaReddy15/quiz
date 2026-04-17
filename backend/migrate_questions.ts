import { db } from "./src/config/db";

async function migrate() {
    console.log("🚀 Starting questions table migration...");
    try {
        const columnsToAdd = [
            { name: "title", type: "TEXT" },
            { name: "languages", type: "TEXT" },
            { name: "starter_code", type: "TEXT" },
            { name: "test_cases", type: "TEXT" }
        ];

        for (const col of columnsToAdd) {
            try {
                await db.execute(`ALTER TABLE questions ADD COLUMN ${col.name} ${col.type}`);
                console.log(`✅ Added ${col.name}`);
            } catch (e: any) {
                console.log(`⏭️ ${col.name} already exists or error: ${e.message}`);
            }
        }

        console.log("✨ Migration completed successfully!");
    } catch (error) {
        console.error("❌ Migration failed:", error);
    }
}

migrate();
