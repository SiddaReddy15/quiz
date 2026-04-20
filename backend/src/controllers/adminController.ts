import { Response } from "express";
import { db } from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";
import { generateId } from "../utils/idGenerator";
import { Parser } from "json2csv";
import * as xlsx from "xlsx";
import { logActivity } from "../utils/activityLogger";

export const getCategories = async (req: AuthRequest, res: Response) => {
  try {
    const result = await db.execute("SELECT * FROM categories ORDER BY name ASC");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getQuestionsByCategory = async (req: AuthRequest, res: Response) => {
  const { categorySlug } = req.params;
  try {
    const category = await db.execute({
      sql: "SELECT id FROM categories WHERE slug = ?",
      args: [categorySlug]
    });

    if (category.rows.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    const categoryId = category.rows[0].id;
    const result = await db.execute({
      sql: "SELECT * FROM questions WHERE category_id = ?",
      args: [categoryId]
    });

    const parsedQuestions = result.rows.map((q: any) => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options || '[]') : q.options,
      languages: typeof q.languages === 'string' ? JSON.parse(q.languages || '[]') : q.languages,
      test_cases: typeof q.test_cases === 'string' ? JSON.parse(q.test_cases || '[]') : q.test_cases
    }));
    res.json(parsedQuestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createExam = async (req: AuthRequest, res: Response) => {
  const { title, duration, passing_score, start_time, end_time, is_published } = req.body;

  try {
    const examId = generateId();
    
    // Smart Category Inference: Find or create category based on title
    // 1. Try to find an existing category that is mentioned in the title
    const categoriesResult = await db.execute("SELECT * FROM categories");
    const categories = categoriesResult.rows;
    
    let inferredCategoryId = null;
    const titleLower = title.toLowerCase();
    
    for (const cat of categories as any[]) {
      if (titleLower.includes(cat.name.toLowerCase()) || titleLower.includes(cat.slug.toLowerCase())) {
        inferredCategoryId = cat.id;
        break;
      }
    }
    
    // 2. If no category found, create a new one based on the first word or full title
    if (!inferredCategoryId) {
      const categoryId = generateId();
      const slug = title.toLowerCase().split(' ')[0].replace(/[^a-z0-9]/g, '');
      await db.execute({
        sql: "INSERT INTO categories (id, slug, name) VALUES (?, ?, ?)",
        args: [categoryId, slug, title]
      });
      inferredCategoryId = categoryId;
    }

    await db.execute({
      sql: "INSERT INTO exams (id, title, duration, passing_score, start_time, end_time, category_id, is_published) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: [examId, title, duration, passing_score, start_time, end_time, inferredCategoryId, is_published ? 1 : 0],
    });

    if (req.user) {
        await logActivity(req.user.id, "CREATED_EXAM", `Created Exam - ${title} (Auto-categorized)`, "SUCCESS");
    }

    res.status(201).json({ id: examId, message: "Exam created and auto-categorized successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getExams = async (req: AuthRequest, res: Response) => {
  const { categoryId } = req.query;
  try {
    let sql = "SELECT e.*, c.name as category_name FROM exams e LEFT JOIN categories c ON e.category_id = c.id";
    let args: any[] = [];
    
    if (categoryId) {
        sql += " WHERE e.category_id = ?";
        args.push(categoryId);
    }
    
    sql += " ORDER BY e.created_at DESC";
    
    const result = await db.execute({ sql, args });
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addQuestion = async (req: AuthRequest, res: Response) => {
  console.log("[DEBUG] addQuestion request body:", JSON.stringify(req.body));
  const exam_id = req.body.exam_id || req.body.examId;
  const category_id = req.body.category_id || req.body.categoryId || req.body.category;
  const type = req.body.type;
  const title = req.body.title;
  const question_text = req.body.question_text || req.body.questionText;
  const options = req.body.options;
  const correct_answer = req.body.correct_answer || req.body.correctAnswer;
  const explanation = req.body.explanation;
  const marks = req.body.marks || 1;
  const difficulty = req.body.difficulty || 'MEDIUM';
  const languages = req.body.languages || req.body.lang;
  const starter_code = req.body.starter_code || req.body.starterCode;
  const test_cases = req.body.test_cases || req.body.testCases;

  let finalCategoryId = category_id;
  try {
    if (!finalCategoryId && exam_id) {
        const exam = await db.execute({
            sql: "SELECT category_id FROM exams WHERE id = ?",
            args: [exam_id]
        });
        finalCategoryId = exam.rows[0]?.category_id;
    }

    const id = generateId();
    await db.execute({
      sql: `INSERT INTO questions (
        id, exam_id, category_id, type, title, question_text, 
        options, correct_answer, explanation, marks, 
        difficulty, languages, starter_code, test_cases
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id, 
        exam_id || null, 
        finalCategoryId || null, 
        type, 
        title || null,
        question_text, 
        typeof options === 'string' ? options : JSON.stringify(options || []), 
        correct_answer || null, 
        explanation || null, 
        Number(marks), 
        difficulty.toUpperCase(),
        languages ? JSON.stringify(languages) : null,
        starter_code || null,
        test_cases ? JSON.stringify(test_cases) : null
      ],
    });

    res.status(201).json({ id, message: "Question added successfully" });
    
    if (req.user) {
        await logActivity(req.user.id, "ADDED_QUESTION", `Added Question - ${question_text.substring(0, 30)}...`, "SUCCESS");
    }
  } catch (error: any) {
    console.error("CRITICAL ERROR in addQuestion:", error);
    res.status(500).json({ 
        message: "Internal server error", 
        error: error.message
    });
  }
};

export const updateExam = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { title, duration, passing_score, start_time, end_time } = req.body;

    try {
        // Smart Category Inference: Find or create category based on title
        const categoriesResult = await db.execute("SELECT * FROM categories");
        const categories = categoriesResult.rows;
        
        let inferredCategoryId = null;
        const titleLower = title.toLowerCase();
        
        for (const cat of categories as any[]) {
          if (titleLower.includes(cat.name.toLowerCase()) || titleLower.includes(cat.slug.toLowerCase())) {
            inferredCategoryId = cat.id;
            break;
          }
        }
        
        if (!inferredCategoryId) {
          const categoryId = generateId();
          const slug = title.toLowerCase().split(' ')[0].replace(/[^a-z0-9]/g, '');
          await db.execute({
            sql: "INSERT INTO categories (id, slug, name) VALUES (?, ?, ?)",
            args: [categoryId, slug, title]
          });
          inferredCategoryId = categoryId;
        }

        await db.execute({
            sql: `UPDATE exams SET 
                title = ?, duration = ?, passing_score = ?, 
                start_time = ?, end_time = ?, category_id = ? 
                WHERE id = ?`,
            args: [title, duration, passing_score, start_time, end_time, inferredCategoryId, id]
        });
        res.json({ message: "Exam updated and re-categorized successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const publishExam = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { is_published } = req.body;
  
  try {
    const before = await db.execute({
        sql: "SELECT is_published FROM exams WHERE id = ?",
        args: [id]
    });
    
    await db.execute({
      sql: "UPDATE exams SET is_published = ? WHERE id = ?",
      args: [is_published ? 1 : 0, id],
    });

    const after = await db.execute({
        sql: "SELECT is_published FROM exams WHERE id = ?",
        args: [id]
    });

    console.log(`Exam ${id} publication status changed from ${before.rows[0]?.is_published} to ${after.rows[0]?.is_published}`);

    if (req.user) {
        const exam = await db.execute({ sql: "SELECT title FROM exams WHERE id = ?", args: [id] });
        const title = exam.rows[0]?.title || "Unknown Exam";
        await logActivity(req.user.id, is_published ? "PUBLISHED_EXAM" : "UNPUBLISHED_EXAM", `${is_published ? "Go Live" : "Unpublished"} - ${title}`, "SUCCESS");
    }

    res.json({ 
        message: `Exam ${is_published ? "published" : "unpublished"} successfully`,
        is_published: after.rows[0]?.is_published
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getExamStats = async (req: AuthRequest, res: Response) => {
    try {
        const totalExams = await db.execute("SELECT COUNT(*) as count FROM exams");
        const totalUsers = await db.execute("SELECT COUNT(*) as count FROM users WHERE role = 'STUDENT'");
        const totalAttempts = await db.execute("SELECT COUNT(*) as count FROM attempts WHERE status = 'SUBMITTED'");
        const upcomingExams = await db.execute("SELECT COUNT(*) as count FROM exams WHERE start_time > datetime('now')");
        
        // Attempts over the last 7 days
        const last7Days = await db.execute(`
            SELECT date(submit_time) as date, COUNT(*) as count 
            FROM attempts 
            WHERE status = 'SUBMITTED' 
            AND submit_time > date('now', '-7 days')
            GROUP BY date(submit_time)
            ORDER BY date ASC
        `);

        // Performance Trends (Avg score over time)
        const performanceTrends = await db.execute(`
            SELECT date(submit_time) as date, AVG(score) as avg_score
            FROM attempts
            WHERE status = 'SUBMITTED'
            AND submit_time > date('now', '-30 days')
            GROUP BY date(submit_time)
            ORDER BY date ASC
        `);

        // Pass/Fail stats
        const passFail = await db.execute(`
            SELECT 
                SUM(CASE WHEN a.score >= e.passing_score THEN 1 ELSE 0 END) as passed,
                SUM(CASE WHEN a.score < e.passing_score THEN 1 ELSE 0 END) as failed
            FROM attempts a
            JOIN exams e ON a.exam_id = e.id
            WHERE a.status = 'SUBMITTED'
        `);

        // Recent Live Activity
        const recentActivity = await db.execute(`
            SELECT al.action, al.details as entityTitle, al.status, al.created_at as createdAt, u.name as userName, u.role as userRole
            FROM activity_log al
            JOIN users u ON al.user_id = u.id
            ORDER BY al.created_at DESC
            LIMIT 10
        `);

        res.json({
            totalExams: totalExams.rows[0].count,
            totalUsers: totalUsers.rows[0].count,
            totalAttempts: totalAttempts.rows[0].count,
            upcomingExams: upcomingExams.rows[0].count,
            dailyAttempts: last7Days.rows,
            performanceTrends: performanceTrends.rows,
            passRate: {
                passed: passFail.rows[0].passed || 0,
                failed: passFail.rows[0].failed || 0
            },
            recentActivity: recentActivity.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const exportStudentsToCSV = async (req: AuthRequest, res: Response) => {
    try {
        const query = `
            SELECT
                u.id AS "Student ID",
                u.name AS "Full Name",
                u.email AS "Email Address",
                u.created_at AS "Joined Date",
                COUNT(DISTINCT a.id) AS "Total Exams Taken",
                ROUND(
                    COALESCE(SUM(ans.marks_awarded) * 100.0 /
                    NULLIF(SUM(q.marks), 0), 0),
                    2
                ) AS "Average Percentage (%)",
                ROUND(MAX(lb.score), 2) AS "Highest Score (%)",
                ROUND(MAX(a.score), 2) AS "Last Exam Score (%)",
                MAX(a.submit_time) AS "Last Exam Date"
            FROM users u
            LEFT JOIN attempts a ON u.id = a.user_id
            LEFT JOIN answers ans ON ans.attempt_id = a.id
            LEFT JOIN questions q ON q.id = ans.question_id
            LEFT JOIN leaderboard lb ON lb.user_id = u.id
            WHERE u.role = 'STUDENT'
            GROUP BY u.id
            ORDER BY "Average Percentage (%)" DESC
        `;
        
        const result = await db.execute(query);
        const data = result.rows;

        const json2csvParser = new Parser({ withBOM: true });
        const csv = json2csvParser.parse(data);

        res.header("Content-Type", "text/csv; charset=utf-8");
        res.attachment(`exampro_academic_report_${new Date().toISOString().split('T')[0]}.csv`);
        res.send(csv);
    } catch (error) {
        console.error("CSV Export error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

import { sendEnrollmentEmail } from "../utils/emailService";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export const enrollStudent = async (req: AuthRequest, res: Response) => {
    const { name, email } = req.body;

    try {
        // Validation
        if (!name || !email) {
            return res.status(400).json({ message: "Name and email are required" });
        }

        // Check for existing user
        const existingUser = await db.execute({
            sql: "SELECT id FROM users WHERE email = ?",
            args: [email]
        });

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const id = generateId();
        
        // Use permanent password for all students
        const tempPassword = "student123"; 
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        await db.execute({
            sql: "INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, 'STUDENT')",
            args: [id, name, email, hashedPassword]
        });

        // Send Email (Async)
        try {
            await sendEnrollmentEmail(email, name, tempPassword);
        } catch (emailError) {
            console.error("Failed to send email:", emailError);
            // We still return success but log the error
        }

        res.json({ message: "Student enrolled successfully. Credentials sent to email." });

        if (req.user) {
            await logActivity(req.user.id, "ENROLLED_STUDENT", `Enrolled Student - ${name}`, "SUCCESS");
        }
    } catch (error) {
        console.error("Enrollment error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getStudents = async (req: AuthRequest, res: Response) => {
    try {
        const result = await db.execute("SELECT id, name, email, profile_photo, created_at, status, last_active FROM users WHERE role = 'STUDENT' ORDER BY created_at DESC");
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteExam = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        await db.execute({
            sql: "DELETE FROM exams WHERE id = ?",
            args: [id]
        });
        res.json({ message: "Exam deleted successfully" });

        if (req.user) {
            await logActivity(req.user.id, "DELETED_EXAM", `Deleted Exam ID: ${id}`, "SUCCESS");
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateQuestion = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { 
        type, title, question_text, options, correct_answer, 
        explanation, marks, difficulty, languages, starter_code, test_cases 
    } = req.body;

    try {
        await db.execute({
            sql: `UPDATE questions SET 
                type = ?, title = ?, question_text = ?, options = ?, 
                correct_answer = ?, explanation = ?, marks = ?, difficulty = ?, 
                languages = ?, starter_code = ?, test_cases = ? 
                WHERE id = ?`,
            args: [
                type, title, question_text, JSON.stringify(options), 
                correct_answer, explanation, marks, difficulty, 
                JSON.stringify(languages), starter_code, JSON.stringify(test_cases), id
            ]
        });
        res.json({ message: "Question updated successfully" });

        if (req.user) {
            await logActivity(req.user.id, "UPDATED_QUESTION", `Updated Question - ${question_text.substring(0, 30)}...`, "SUCCESS");
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getQuestionById = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        const result = await db.execute({
            sql: "SELECT * FROM questions WHERE id = ?",
            args: [id]
        });

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Question not found" });
        }

        const q = result.rows[0] as any;
        const parsedQuestion = {
            ...q,
            options: typeof q.options === 'string' ? JSON.parse(q.options || '[]') : q.options,
            languages: typeof q.languages === 'string' ? JSON.parse(q.languages || '[]') : q.languages,
            test_cases: typeof q.test_cases === 'string' ? JSON.parse(q.test_cases || '[]') : q.test_cases
        };

        res.json(parsedQuestion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteQuestion = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        await db.execute({
            sql: "DELETE FROM questions WHERE id = ?",
            args: [id]
        });
        res.json({ message: "Question deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getQuestionsByExam = async (req: AuthRequest, res: Response) => {
    const { examId } = req.params;
    try {
        const exam = await db.execute({
            sql: "SELECT category_id FROM exams WHERE id = ?",
            args: [examId]
        });
        const categoryId = exam.rows[0]?.category_id;

        const result = await db.execute({
            sql: "SELECT * FROM questions WHERE exam_id = ? OR category_id = ?",
            args: [examId, categoryId || '']
        });

        const parsedQuestions = result.rows.map((q: any) => ({
            ...q,
            options: typeof q.options === 'string' ? JSON.parse(q.options || '[]') : q.options,
            languages: typeof q.languages === 'string' ? JSON.parse(q.languages || '[]') : q.languages,
            test_cases: typeof q.test_cases === 'string' ? JSON.parse(q.test_cases || '[]') : q.test_cases
        }));
        res.json(parsedQuestions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const uploadQuestionsExcel = async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const { exam_id, category_id } = req.body;

  try {
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data: any[] = xlsx.utils.sheet_to_json(sheet);

    if (data.length === 0) {
      return res.status(400).json({ message: "Excel file is empty" });
    }

    let finalCategoryId = category_id;
    if (!finalCategoryId && exam_id) {
        const exam = await db.execute({
            sql: "SELECT category_id FROM exams WHERE id = ?",
            args: [exam_id]
        });
        finalCategoryId = exam.rows[0]?.category_id;
    }

    let successCount = 0;

    for (const item of data) {
      // Validate mandatory fields
      if (!item.question_text) continue;

      const id = generateId();
      
      // Safe option parsing: handle strings, numbers, or arrays
      let parsedOptions: string[] = [];
      if (item.options) {
          if (typeof item.options === 'string') {
            parsedOptions = item.options.split(",").map((s: string) => s.trim());
          } else if (Array.isArray(item.options)) {
            parsedOptions = item.options;
          } else {
            parsedOptions = [String(item.options)];
          }
      }

      await db.execute({
        sql: `INSERT INTO questions (
                id, exam_id, category_id, type, question_text, options, 
                correct_answer, explanation, marks, difficulty
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          exam_id || null,
          finalCategoryId || null,
          item.type || "MCQ",
          item.question_text,
          JSON.stringify(parsedOptions),
          String(item.correct_answer || ""),
          String(item.explanation || ""),
          Number(item.marks) || 1,
          String(item.difficulty || 'MEDIUM').toUpperCase()
        ],
      });
      successCount++;
    }

    res.json({ message: `${successCount} questions uploaded successfully` });

    if (req.user) {
        await logActivity(req.user.id, "BULK_IMPORT", `Bulk Imported ${successCount} Questions`, "SUCCESS");
    }
  } catch (error: any) {
    console.error("EXCEL_IMPORT_ERROR:", error);
    res.status(500).json({ 
        error: "Document Processing Failed",
        message: error.message || "Please ensure the Excel follows the required schema."
    });
  }
};

export const getAllResults = async (req: AuthRequest, res: Response) => {
    try {
        const results = await db.execute(`
            SELECT a.id, a.exam_id, u.name as student_name, e.title as exam_title, a.score, 
                   e.passing_score, a.submit_time, a.status
            FROM attempts a
            JOIN users u ON a.user_id = u.id
            JOIN exams e ON a.exam_id = e.id
            WHERE a.status = 'SUBMITTED'
            ORDER BY a.submit_time DESC
        `);
        res.json(results.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const exportQuestionsTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const template = [
      {
        question_text: "What is React?",
        type: "MCQ",
        options: "Library, Framework, Language, Database",
        correct_answer: "Library",
        explanation: "React is a JavaScript library for building user interfaces.",
        marks: 5,
        difficulty: "EASY"
      },
      {
        question_text: "Implement a function that adds two numbers.",
        type: "CODING",
        options: "",
        correct_answer: "",
        explanation: "Basic addition function.",
        marks: 10,
        difficulty: "MEDIUM"
      }
    ];

    const worksheet = xlsx.utils.json_to_sheet(template);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Template");
    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", 'attachment; filename="questions_template.xlsx"');
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


