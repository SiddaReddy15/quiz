const { createClient } = require('@libsql/client');
require('dotenv').config({ path: './backend/.env' });

const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN
});

const pythonQuestions = [
    {
        id: 'py_q1',
        title: 'Python Memory Management',
        text: 'Which component is responsible for memory management and garbage collection in Python?',
        options: ['PVM (Python Virtual Machine)', 'Interpreter', 'Garbage Collector', 'Operating System'],
        ans: 'PVM (Python Virtual Machine)',
        diff: 'MEDIUM',
        marks: 4
    },
    {
        id: 'py_q2',
        title: 'Python Generators',
        text: 'What keyword is used to create a generator function in Python?',
        options: ['yield', 'return', 'generate', 'provide'],
        ans: 'yield',
        diff: 'EASY',
        marks: 2
    },
    {
        id: 'py_q3',
        title: 'List vs Tuple',
        text: 'Which of the following statements about Lists and Tuples is TRUE?',
        options: ['Lists are immutable, Tuples are mutable', 'Lists are mutable, Tuples are immutable', 'Both are immutable', 'Both are mutable'],
        ans: 'Lists are mutable, Tuples are immutable',
        diff: 'EASY',
        marks: 2
    },
    {
        id: 'py_q4',
        title: 'Global Interpreter Lock (GIL)',
        text: 'What is the primary effect of the GIL in CPython?',
        options: ['It speeds up multi-threaded execution', 'It prevents multiple native threads from executing Python bytecodes at once', 'It handles file system locks', 'It manages global variables'],
        ans: 'It prevents multiple native threads from executing Python bytecodes at once',
        diff: 'HARD',
        marks: 5
    },
    {
        id: 'py_q5',
        title: 'Python Slicing',
        text: 'What is the result of [1, 2, 3, 4, 5][::-2]?',
        options: ['[5, 3, 1]', '[1, 3, 5]', '[4, 2]', '[5, 4, 3, 2, 1]'],
        ans: '[5, 3, 1]',
        diff: 'MEDIUM',
        marks: 4
    },
    {
        id: 'py_q6',
        title: 'Dictionary Keys',
        text: 'Which of these CANNOT be used as a dictionary key in Python?',
        options: ['Strings', 'Integers', 'Tuples', 'Lists'],
        ans: 'Lists',
        diff: 'MEDIUM',
        marks: 4
    },
    {
        id: 'py_q7',
        title: 'Prime Number Function',
        text: 'Write a Python function to check if a number is prime.',
        lang: ['python'],
        code: "def is_prime(n):\n    if n < 2: return False\n    for i in range(2, int(n**0.5) + 1):\n        if n % i == 0: return False\n    return True",
        diff: 'MEDIUM',
        marks: 10
    },
    {
        id: 'py_q8',
        title: 'Fibonacci Sequence',
        text: 'Write a recursive function to find the nth Fibonacci number.',
        lang: ['python'],
        code: "def fib(n):\n    if n <= 1: return n\n    return fib(n-1) + fib(n-2)",
        diff: 'HARD',
        marks: 10
    }
];

async function run() {
    try {
        console.log('Cleaning up old questions...');
        await client.execute("DELETE FROM questions WHERE category_id = 'devops'");
        
        console.log('Inserting Python questions...');
        for (const q of pythonQuestions) {
            await client.execute({
                sql: `INSERT INTO questions (
                    id, category_id, type, title, question_text, options, 
                    correct_answer, marks, difficulty, languages, starter_code
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    q.id, 
                    'devops', 
                    q.lang ? 'CODING' : 'MCQ', 
                    q.title, 
                    q.text, 
                    q.options ? JSON.stringify(q.options) : null, 
                    q.ans || null, 
                    q.marks, 
                    q.diff, 
                    q.lang ? JSON.stringify(q.lang) : null, 
                    q.code || null
                ]
            });
        }
        console.log('Successfully updated Python questions!');
    } catch (e) {
        console.error('Error during update:', e);
    }
}

run();
