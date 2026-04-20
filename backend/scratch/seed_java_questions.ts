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

    const questions = [
      // 5 MCQs
      {
        id: crypto.randomUUID(),
        category_id: categoryId,
        type: 'MCQ',
        question_text: 'Which of the following is not a Java features?',
        options: JSON.stringify(['Dynamic', 'Architecture Neutral', 'Use of pointers', 'Object-oriented']),
        correct_answer: 'Use of pointers',
        marks: 2,
        difficulty: 'EASY'
      },
      {
        id: crypto.randomUUID(),
        category_id: categoryId,
        type: 'MCQ',
        question_text: 'What is the return type of the hashCode() method in the Object class?',
        options: JSON.stringify(['Object', 'int', 'long', 'void']),
        correct_answer: 'int',
        marks: 2,
        difficulty: 'MEDIUM'
      },
      {
        id: crypto.randomUUID(),
        category_id: categoryId,
        type: 'MCQ',
        question_text: 'Which of the following tool is used to generate API documentation in HTML format from Java source code?',
        options: JSON.stringify(['javap tool', 'javaw tool', 'javadoc tool', 'javah tool']),
        correct_answer: 'javadoc tool',
        marks: 2,
        difficulty: 'MEDIUM'
      },
      {
        id: crypto.randomUUID(),
        category_id: categoryId,
        type: 'MCQ',
        question_text: 'Which package contains the Random class?',
        options: JSON.stringify(['java.util package', 'java.lang package', 'java.awt package', 'java.io package']),
        correct_answer: 'java.util package',
        marks: 2,
        difficulty: 'EASY'
      },
      {
        id: crypto.randomUUID(),
        category_id: categoryId,
        type: 'MCQ',
        question_text: 'Which of the following is a reserved keyword in Java?',
        options: JSON.stringify(['object', 'strictfp', 'main', 'system']),
        correct_answer: 'strictfp',
        marks: 2,
        difficulty: 'HARD'
      },
      // 5 Coding Questions
      {
        id: crypto.randomUUID(),
        category_id: categoryId,
        type: 'CODING',
        question_text: 'Write a Java program to check if a number is Palindrome.',
        correct_answer: '',
        marks: 10,
        difficulty: 'MEDIUM',
        test_cases: JSON.stringify([
          { input: '121', expected: 'true' },
          { input: '123', expected: 'false' }
        ])
      },
      {
        id: crypto.randomUUID(),
        category_id: categoryId,
        type: 'CODING',
        question_text: 'Implement a function to find the Factorial of a number using recursion.',
        correct_answer: '',
        marks: 10,
        difficulty: 'MEDIUM',
        test_cases: JSON.stringify([
          { input: '5', expected: '120' },
          { input: '0', expected: '1' }
        ])
      },
      {
        id: crypto.randomUUID(),
        category_id: categoryId,
        type: 'CODING',
        question_text: 'Write a function to reverse a String without using built-in reverse method.',
        correct_answer: '',
        marks: 10,
        difficulty: 'MEDIUM',
        test_cases: JSON.stringify([
          { input: 'hello', expected: 'olleh' },
          { input: 'java', expected: 'avaj' }
        ])
      },
      {
        id: crypto.randomUUID(),
        category_id: categoryId,
        type: 'CODING',
        question_text: 'Find the largest element in an array.',
        correct_answer: '',
        marks: 10,
        difficulty: 'EASY',
        test_cases: JSON.stringify([
          { input: '[1, 5, 3, 9, 2]', expected: '9' }
        ])
      },
      {
        id: crypto.randomUUID(),
        category_id: categoryId,
        type: 'CODING',
        question_text: 'Check if two strings are Anagrams.',
        correct_answer: '',
        marks: 15,
        difficulty: 'HARD',
        test_cases: JSON.stringify([
          { input: 'listen, silent', expected: 'true' },
          { input: 'hello, world', expected: 'false' }
        ])
      }
    ];

    for (const q of questions) {
      await client.execute({
        sql: "INSERT INTO questions (id, category_id, type, question_text, options, correct_answer, marks, difficulty, test_cases) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        args: [q.id, q.category_id, q.type, q.question_text, q.options || null, q.correct_answer, q.marks, q.difficulty, q.test_cases || null]
      });
    }

    console.log("Successfully added 10 Java questions");
  } catch (e) {
    console.error(e);
  }
}

run();
