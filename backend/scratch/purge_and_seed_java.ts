import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const client = createClient({
  url: process.env.DATABASE_URL!.replace("libsql://", "https://"),
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function run() {
  try {
    // 1. Get Java Category ID
    const catRes = await client.execute({
      sql: "SELECT id FROM categories WHERE name LIKE '%Java%' OR slug = 'java' LIMIT 1",
      args: []
    });

    if (catRes.rows.length === 0) {
      console.error("Java category not found");
      return;
    }

    const categoryId = catRes.rows[0].id;
    console.log("Found Java category:", categoryId);

    // 2. Remove all existing questions in Java
    const delRes = await client.execute({
      sql: "DELETE FROM questions WHERE category_id = ?",
      args: [categoryId]
    });
    console.log("Removed existing Java questions:", delRes.rowsAffected);

    const questions = [
      // 5 MCQs
      {
        id: crypto.randomUUID(),
        category_id: categoryId,
        type: 'MCQ',
        question_text: 'Which statement is true about Java inheritance?',
        options: JSON.stringify(['Private members are inherited', 'A class can extend multiple classes', 'Java supports single inheritance only for classes', 'A subclass cannot override static methods']),
        correct_answer: 'Java supports single inheritance only for classes',
        marks: 2,
        difficulty: 'MEDIUM'
      },
      {
        id: crypto.randomUUID(),
        category_id: categoryId,
        type: 'MCQ',
        question_text: 'What is the default value of a local variable in Java?',
        options: JSON.stringify(['null', '0', 'Depends on data type', 'No default value (must be initialized)']),
        correct_answer: 'No default value (must be initialized)',
        marks: 2,
        difficulty: 'MEDIUM'
      },
      {
        id: crypto.randomUUID(),
        category_id: categoryId,
        type: 'MCQ',
        question_text: 'Which of these is used to prevent a class from being inherited?',
        options: JSON.stringify(['static', 'final', 'abstract', 'private']),
        correct_answer: 'final',
        marks: 2,
        difficulty: 'EASY'
      },
      {
        id: crypto.randomUUID(),
        category_id: categoryId,
        type: 'MCQ',
        question_text: 'What does the JVM do?',
        options: JSON.stringify(['Compiles Java code', 'Executes Java bytecode', 'Manages hardware directly', 'Formats the source code']),
        correct_answer: 'Executes Java bytecode',
        marks: 2,
        difficulty: 'EASY'
      },
      {
        id: crypto.randomUUID(),
        category_id: categoryId,
        type: 'MCQ',
        question_text: 'Which collection type does not allow duplicate elements?',
        options: JSON.stringify(['ArrayList', 'LinkedList', 'Set', 'Stack']),
        correct_answer: 'Set',
        marks: 2,
        difficulty: 'MEDIUM'
      },
      // 5 Coding Questions
      {
        id: crypto.randomUUID(),
        category_id: categoryId,
        type: 'CODING',
        question_text: 'Write a Java program to find the second largest number in an array.',
        correct_answer: '',
        marks: 15,
        difficulty: 'MEDIUM',
        test_cases: JSON.stringify([
          { input: '[1, 5, 8, 3, 2]', expected: '5' }
        ])
      },
      {
        id: crypto.randomUUID(),
        category_id: categoryId,
        type: 'CODING',
        question_text: 'Implement a function to check if a string contains only digits.',
        correct_answer: '',
        marks: 10,
        difficulty: 'EASY',
        test_cases: JSON.stringify([
          { input: '12345', expected: 'true' },
          { input: '12a34', expected: 'false' }
        ])
      },
      {
        id: crypto.randomUUID(),
        category_id: categoryId,
        type: 'CODING',
        question_text: 'Write a program to find the GCD of two numbers.',
        correct_answer: '',
        marks: 10,
        difficulty: 'MEDIUM',
        test_cases: JSON.stringify([
          { input: '12, 18', expected: '6' }
        ])
      },
      {
        id: crypto.randomUUID(),
        category_id: categoryId,
        type: 'CODING',
        question_text: 'Count the number of vowels in a string.',
        correct_answer: '',
        marks: 5,
        difficulty: 'EASY',
        test_cases: JSON.stringify([
          { input: 'education', expected: '5' }
        ])
      },
      {
        id: crypto.randomUUID(),
        category_id: categoryId,
        type: 'CODING',
        question_text: 'Sort an array of integers using Bubble Sort algorithm.',
        correct_answer: '',
        marks: 20,
        difficulty: 'HARD',
        test_cases: JSON.stringify([
          { input: '[5, 2, 8, 1, 3]', expected: '[1, 2, 3, 5, 8]' }
        ])
      }
    ];

    for (const q of questions) {
      await client.execute({
        sql: "INSERT INTO questions (id, category_id, type, question_text, options, correct_answer, marks, difficulty, test_cases) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        args: [q.id, q.category_id, q.type, q.question_text, q.options || null, q.correct_answer, q.marks, q.difficulty, q.test_cases || null]
      });
    }

    console.log("Successfully replaced Java repository with 10 fresh questions");
  } catch (e) {
    console.error(e);
  }
}

run();
