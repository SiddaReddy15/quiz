import { createClient } from "@libsql/client/web";
import dotenv from "dotenv";

dotenv.config();

const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;

if (!url) {
  throw new Error("DATABASE_URL is not defined in .env");
}

export const db = createClient({
  url: url,
  authToken: authToken,
});

// Verify connection
db.execute("SELECT 1").catch((err) => {
  if (err.message.includes("401") || err.message.includes("UNAUTHORIZED")) {
    console.error("\x1b[31m%s\x1b[0m", "CRITICAL ERROR: Turso Authentication Failed (401).");
    console.error("\x1b[33m%s\x1b[0m", "Your DATABASE_AUTH_TOKEN in .env is likely invalid or expired.");
    console.error("\x1b[33m%s\x1b[0m", "Please update .env with a fresh token from the Turso dashboard.");
  } else {
    console.error("Database connection error:", err.message);
  }
});

