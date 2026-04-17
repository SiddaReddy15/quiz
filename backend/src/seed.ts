import { db } from "./config/db";
import { generateId } from "./utils/idGenerator";

const SECTORS = [
  { slug: "frontend", name: "Frontend Development", description: "Modern UI & Logic (HTML, CSS, React, Next.js)" },
  { slug: "backend", name: "Backend Development", description: "APIs & Core Systems (Node, Express, Auth)" },
  { slug: "database", name: "Database Management", description: "Data Strategy & SQL (Prisma, Turso, PostgreSQL)" },
  { slug: "devops", name: "Python Programming", description: "Advanced scripting & logic (Django, FastAPI, Data Science)" },
  { slug: "dsa", name: "DSA & Logic", description: "Problem Solving (Arrays, Trees, Algorithms)" }
];

const EXAMS = [
  { title: "Frontend Development", category: "frontend", duration: 60, passing: 70 },
  { title: "Backend Development", category: "backend", duration: 60, passing: 70 },
  { title: "Database Management", category: "database", duration: 45, passing: 65 },
  { title: "Python Programming", category: "devops", duration: 45, passing: 60 },
  { title: "DSA & Logic", category: "dsa", duration: 90, passing: 75 },
];

const QUESTIONS = [
  // 1. Frontend Development - MCQs
  { category: "frontend", type: "MCQ", text: "What does HTML stand for?", opts: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyperlink and Text Markup Language", "Home Tool Markup Language"], ans: "Hyper Text Markup Language" },
  { category: "frontend", type: "MCQ", text: "Which CSS property controls layout in Flexbox?", opts: ["flex-direction", "grid-template", "position", "display-block"], ans: "flex-direction" },
  { category: "frontend", type: "MCQ", text: "What is the virtual DOM in React?", opts: ["A lightweight copy of the real DOM", "A direct replacement for the browser DOM", "A database for components", "A CSS rendering engine"], ans: "A lightweight copy of the real DOM" },
  { category: "frontend", type: "MCQ", text: "Which hook is used for state management in React?", opts: ["useState", "useEffect", "useContext", "useRef"], ans: "useState" },
  { category: "frontend", type: "MCQ", text: "What is the purpose of Next.js?", opts: ["Server-side rendering and static site generation", "Client-side only routing", "Database management", "Styling components"], ans: "Server-side rendering and static site generation" },
  { category: "frontend", type: "MCQ", text: "Which Tailwind class applies margin?", opts: ["m-4", "p-4", "border-4", "bg-4"], ans: "m-4" },
  
  // 1. Frontend Development - Coding
  { category: "frontend", type: "CODING", text: "Build a responsive navigation bar using HTML and CSS.", difficulty: "EASY", lang: ["html", "css"] },
  { category: "frontend", type: "CODING", text: "Create a React counter using the useState hook.", difficulty: "MEDIUM", lang: ["javascript", "typescript"] },
  { category: "frontend", type: "CODING", text: "Fetch and display data from an API using JavaScript.", difficulty: "MEDIUM", lang: ["javascript"] },
  { category: "frontend", type: "CODING", text: "Build a Next.js page that displays dynamic user data.", difficulty: "HARD", lang: ["typescript"] },
  { category: "frontend", type: "CODING", text: "Design a responsive card using Tailwind CSS.", difficulty: "EASY", lang: ["html", "css"] },

  // 2. Backend Development - MCQs
  { category: "backend", type: "MCQ", text: "What is Node.js primarily used for?", opts: ["Server-side scripting", "Client-side styling", "Database design", "Browser rendering"], ans: "Server-side scripting" },
  { category: "backend", type: "MCQ", text: "Which method is used to create a server in Express?", opts: ["express()", "createServer()", "listen()", "init()"], ans: "express()" },
  { category: "backend", type: "MCQ", text: "What does REST stand for?", opts: ["Representational State Transfer", "Request Send Transfer", "Relational State Technical", "Remote System Terminal"], ans: "Representational State Transfer" },
  { category: "backend", type: "MCQ", text: "Which HTTP status code indicates success?", opts: ["200", "404", "500", "201"], ans: "200" },
  { category: "backend", type: "MCQ", text: "What is JWT used for?", opts: ["Securely transmitting information as a JSON object", "Database querying", "Styling forms", "Compiling code"], ans: "Securely transmitting information as a JSON object" },

  // 2. Backend Development - Coding
  { category: "backend", type: "CODING", text: "Create a REST API using Express.js.", difficulty: "MEDIUM", lang: ["javascript"] },
  { category: "backend", type: "CODING", text: "Implement JWT authentication in Node.js.", difficulty: "HARD", lang: ["javascript"] },
  { category: "backend", type: "CODING", text: "Build a CRUD API for managing users.", difficulty: "MEDIUM", lang: ["javascript"] },
  { category: "backend", type: "CODING", text: "Create middleware for request logging.", difficulty: "EASY", lang: ["javascript"] },
  { category: "backend", type: "CODING", text: "Connect a Node.js app to a database.", difficulty: "MEDIUM", lang: ["javascript"] },

  // 3. Database Management - MCQs
  { category: "database", type: "MCQ", text: "What does SQL stand for?", opts: ["Structured Query Language", "Simple Query Language", "Sequential Query Logic", "System Query Link"], ans: "Structured Query Language" },
  { category: "database", type: "MCQ", text: "Which SQL clause is used to filter records?", opts: ["WHERE", "FROM", "SELECT", "ORDER BY"], ans: "WHERE" },
  { category: "database", type: "MCQ", text: "What is a primary key?", opts: ["Unique identifier for a record", "A key for encryption", "The first column in a table", "A foreign link"], ans: "Unique identifier for a record" },
  { category: "database", type: "MCQ", text: "Which MongoDB method retrieves documents?", opts: ["find()", "get()", "select()", "fetch()"], ans: "find()" },
  { category: "database", type: "MCQ", text: "What is Prisma used for?", opts: ["ORM for database access", "Frontend framework", "Backend styling", "API testing"], ans: "ORM for database access" },

  // 3. Database Management - Coding
  { category: "database", type: "CODING", text: "Write an SQL query to fetch the top 5 students by score.", difficulty: "EASY", lang: ["sql"] },
  { category: "database", type: "CODING", text: "Design a student database schema.", difficulty: "MEDIUM", lang: ["sql", "prisma"] },
  { category: "database", type: "CODING", text: "Perform CRUD operations using MongoDB.", difficulty: "MEDIUM", lang: ["javascript"] },
  { category: "database", type: "CODING", text: "Connect Prisma ORM to a database.", difficulty: "EASY", lang: ["typescript"] },
  { category: "database", type: "CODING", text: "Write a query to calculate the average score.", difficulty: "EASY", lang: ["sql"] },

  // 4. Python Programming - MCQs
  { category: "devops", type: "MCQ", text: "Which component is responsible for memory management and garbage collection in Python?", opts: ["PVM (Python Virtual Machine)", "Interpreter", "Garbage Collector", "Operating System"], ans: "PVM (Python Virtual Machine)" },
  { category: "devops", type: "MCQ", text: "What keyword is used to create a generator function in Python?", opts: ["yield", "return", "generate", "provide"], ans: "yield" },
  { category: "devops", type: "MCQ", text: "Which of the following statements about Lists and Tuples is TRUE?", opts: ["Lists are mutable, Tuples are immutable", "Lists are immutable, Tuples are mutable", "Both are immutable", "Both are mutable"], ans: "Lists are mutable, Tuples are immutable" },
  { category: "devops", type: "MCQ", text: "What is the primary effect of the GIL in CPython?", opts: ["It prevents multiple native threads from executing Python bytecodes at once", "It speeds up multi-threaded execution", "It handles file system locks", "It manages global variables"], ans: "It prevents multiple native threads from executing Python bytecodes at once" },
  { category: "devops", type: "MCQ", text: "What is the result of [1, 2, 3, 4, 5][::-2]?", opts: ["[5, 3, 1]", "[1, 3, 5]", "[4, 2]", "[5, 4, 3, 2, 1]"], ans: "[5, 3, 1]" },

  // 4. Python Programming - Coding
  { category: "devops", type: "CODING", text: "Write a Python function to check if a number is prime.", difficulty: "MEDIUM", lang: ["python"] },
  { category: "devops", type: "CODING", text: "Write a recursive function to find the nth Fibonacci number.", difficulty: "HARD", lang: ["python"] },
  { category: "devops", type: "CODING", text: "Reverse a string in Python without using built-in reverse functions.", difficulty: "MEDIUM", lang: ["python"] },
  { category: "devops", type: "CODING", text: "Implement a basic Stack using a Python list.", difficulty: "MEDIUM", lang: ["python"] },
  { category: "devops", type: "CODING", text: "Calculate the factorial of a number using recursion.", difficulty: "EASY", lang: ["python"] },

  // 5. DSA & Logic - MCQs
  { category: "dsa", type: "MCQ", text: "What is the time complexity of binary search?", opts: ["O(log n)", "O(n)", "O(n^2)", "O(1)"], ans: "O(log n)" },
  { category: "dsa", type: "MCQ", text: "Which data structure uses FIFO?", opts: ["Queue", "Stack", "Tree", "Graph"], ans: "Queue" },
  { category: "dsa", type: "MCQ", text: "Which algorithm is used for sorting?", opts: ["Quick Sort", "Binary Search", "Dijkstra", "BFS"], ans: "Quick Sort" },
  { category: "dsa", type: "MCQ", text: "What is a stack?", opts: ["LIFO data structure", "FIFO data structure", "Hierarchical tree", "Cyclic graph"], ans: "LIFO data structure" },
  { category: "dsa", type: "MCQ", text: "Which traversal uses recursion?", opts: ["In-order tree traversal", "Linear scan", "Jump search", "Array mapping"], ans: "In-order tree traversal" },

  // 5. DSA & Logic - Coding
  { category: "dsa", type: "CODING", text: "Reverse an array.", difficulty: "EASY", lang: ["javascript", "python", "cpp"] },
  { category: "dsa", type: "CODING", text: "Check if a string is a palindrome.", difficulty: "EASY", lang: ["javascript", "python"] },
  { category: "dsa", type: "CODING", text: "Implement a stack using an array.", difficulty: "MEDIUM", lang: ["javascript", "cpp"] },
  { category: "dsa", type: "CODING", text: "Find the factorial using recursion.", difficulty: "EASY", lang: ["python", "javascript"] },
  { category: "dsa", type: "CODING", text: "Implement binary search.", difficulty: "MEDIUM", lang: ["javascript", "python"] }
];

async function seed() {
  console.log("🌱 Starting seed...");

  try {
    // 1. Categories
    for (const cat of SECTORS) {
      await db.execute({
        sql: "INSERT OR REPLACE INTO categories (id, slug, name, description) VALUES (?, ?, ?, ?)",
        args: [cat.slug, cat.slug, cat.name, cat.description]
      });
      console.log(`✅ Category seeded: ${cat.name}`);
    }

    // 2. Exams
    for (const exam of EXAMS) {
      const examId = generateId();
      await db.execute({
        sql: "INSERT OR REPLACE INTO exams (id, title, duration, passing_score, is_published, category_id) VALUES (?, ?, ?, ?, 1, ?)",
        args: [examId, exam.title, exam.duration, exam.passing, exam.category]
      });
      console.log(`✅ Exam seeded: ${exam.title}`);
      
      // Seed 5 random questions for each exam
      const categoryQuestions = QUESTIONS.filter(q => q.category === exam.category);
      for (const q of categoryQuestions) {
        const qId = generateId();
        await db.execute({
          sql: `INSERT INTO questions (
            id, exam_id, category_id, type, question_text, options, correct_answer, 
            difficulty, marks, languages, starter_code
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            qId, 
            examId,
            exam.category,
            q.type, 
            q.text, 
            q.opts ? JSON.stringify(q.opts) : null,
            q.ans || null,
            q.difficulty || "MEDIUM",
            q.type === 'CODING' ? 10 : 4,
            q.lang ? JSON.stringify(q.lang) : null,
            q.type === 'CODING' ? `// Implement ${q.text}` : null
          ]
        });
      }
    }

    console.log("✨ Seed completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seed();
