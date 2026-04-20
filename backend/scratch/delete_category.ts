import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config();

const client = createClient({
  url: process.env.DATABASE_URL!.replace("libsql://", "https://"),
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function run() {
  try {
    const res = await client.execute({
      sql: "DELETE FROM categories WHERE name = 'Programming Fundamentals' OR slug = 'programming';",
      args: []
    });
    console.log("Deleted:", res.rowsAffected);
  } catch (e) {
    console.error(e);
  }
}

run();
