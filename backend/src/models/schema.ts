import { db } from "../config/db";

export const initDB = async () => {
  try {
    // Users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('ADMIN', 'STUDENT')) NOT NULL DEFAULT 'STUDENT',
        status TEXT DEFAULT 'VERIFIED',
        last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
        profile_photo TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Exams table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS exams (
        id TEXT PRIMARY KEY,
        category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
        title TEXT NOT NULL,
        duration INTEGER NOT NULL, -- in minutes
        passing_score INTEGER NOT NULL,
        start_time DATETIME,
        end_time DATETIME,
        is_published BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Categories table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Questions table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
        exam_id TEXT REFERENCES exams(id) ON DELETE CASCADE,
        type TEXT CHECK(type IN ('MCQ', 'SHORT', 'CODING')) NOT NULL,
        title TEXT,
        question_text TEXT NOT NULL,
        options TEXT, -- JSON string for MCQs or Config
        correct_answer TEXT,
        explanation TEXT,
        marks INTEGER NOT NULL DEFAULT 1,
        difficulty TEXT CHECK(difficulty IN ('EASY', 'MEDIUM', 'HARD')) DEFAULT 'MEDIUM',
        languages TEXT, -- JSON array
        starter_code TEXT,
        test_cases TEXT, -- JSON array
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Attempts table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS attempts (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        exam_id TEXT REFERENCES exams(id) ON DELETE CASCADE,
        start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        submit_time DATETIME,
        score INTEGER DEFAULT 0,
        auto_submitted BOOLEAN DEFAULT 0,
        status TEXT CHECK(status IN ('IN_PROGRESS', 'SUBMITTED')) DEFAULT 'IN_PROGRESS'
      )
    `);

    // Answers table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS answers (
        id TEXT PRIMARY KEY,
        attempt_id TEXT REFERENCES attempts(id) ON DELETE CASCADE,
        question_id TEXT REFERENCES questions(id) ON DELETE CASCADE,
        selected_option TEXT,
        answer_text TEXT,
        code_content TEXT,
        is_correct BOOLEAN,
        marks_awarded INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Activities table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        user_name TEXT NOT NULL,
        user_role TEXT NOT NULL,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_title TEXT,
        status TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Database initialized successfully.");
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
};
