import { Response } from "express";
import { db } from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";
import { generateId } from "../utils/idGenerator";
import { logActivity } from "../utils/activityLogger";

export const getStudentDashboard = async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const userId = req.user.id;
    console.log(`Fetching dashboard for student: ${userId}`);
    try {
        const totalExams = await db.execute("SELECT COUNT(*) as count FROM exams WHERE is_published = 1");
        console.log(`Total Available Exams: ${totalExams.rows[0].count}`);
        
        const completedExams = await db.execute({
            sql: "SELECT COUNT(*) as count FROM attempts WHERE user_id = ? AND status = 'SUBMITTED'",
            args: [userId]
        });
        
        const latestAttempt = await db.execute({
            sql: `
                SELECT a.score, e.title as exam_title, a.submit_time 
                FROM attempts a 
                JOIN exams e ON a.exam_id = e.id 
                WHERE a.user_id = ? AND a.status = 'SUBMITTED' 
                ORDER BY a.submit_time DESC LIMIT 1
            `,
            args: [userId]
        });

        // Global Rank Calculation
        const ranks = await db.execute(`
            SELECT user_id, SUM(score) as total_score 
            FROM attempts 
            WHERE status = 'SUBMITTED' 
            GROUP BY user_id 
            ORDER BY total_score DESC
        `);
        console.log(`Global Ranks Count: ${ranks.rows.length}`);
        
        const myRank = ranks.rows.findIndex(r => r.user_id === userId) + 1;

        const response = {
            summary: {
                totalAvailable: Number(totalExams.rows[0].count),
                completed: Number(completedExams.rows[0].count),
                latestScore: latestAttempt.rows[0]?.score || 0,
                rank: myRank > 0 ? myRank : 0
            },
            latestExam: latestAttempt.rows[0] || null
        };
        console.log("Dashboard response:", JSON.stringify(response));
        res.json(response);
    } catch (error) {
        console.error("Dashboard Controller Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getAvailableExams = async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const userId = req.user.id;
    try {
        const exams = await db.execute({
            sql: `
                SELECT e.*, c.name as category_name, a.status as attempt_status, a.id as attempt_id, a.score
                FROM exams e
                LEFT JOIN categories c ON e.category_id = c.id
                LEFT JOIN attempts a ON e.id = a.exam_id AND a.user_id = ?
                WHERE e.is_published = 1
                ORDER BY e.created_at DESC
            `,
            args: [userId]
        });

        res.json(exams.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const startAttempt = async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { exam_id } = req.body;
    const userId = req.user.id;

    try {
        // Check if already attempted
        const existing = await db.execute({
            sql: "SELECT id, status FROM attempts WHERE user_id = ? AND exam_id = ?",
            args: [userId, exam_id]
        });

        if (existing.rows.length > 0) {
            if (existing.rows[0].status === 'SUBMITTED') {
                return res.status(400).json({ message: "Exam already submitted" });
            }
            return res.json({ attemptId: existing.rows[0].id, message: "Resuming attempt" });
        }

        const attemptId = generateId();
        await db.execute({
            sql: "INSERT INTO attempts (id, user_id, exam_id, status, start_time) VALUES (?, ?, ?, 'IN_PROGRESS', CURRENT_TIMESTAMP)",
            args: [attemptId, userId, exam_id]
        });

        res.status(201).json({ attemptId, message: "Attempt started" });

        if (req.user) {
            const exam = await db.execute({ sql: "SELECT title FROM exams WHERE id = ?", args: [exam_id] });
            const title = exam.rows[0]?.title || "Unknown Exam";
            await logActivity(req.user.id, "STARTED_ATTEMPT", `Started Attempt - ${title}`, "SUCCESS");
        }
    } catch (error: any) {
        console.error("CRITICAL ERROR in startAttempt:", error);
        res.status(500).json({ 
            message: "Internal server error", 
            error: error.message,
            detail: error.message?.includes("FOREIGN KEY") ? "User session out of sync. Please logout and login again." : undefined
        });
    }
};

export const saveAnswer = async (req: AuthRequest, res: Response) => {
    const { attempt_id, question_id, selected_option, answer_text, code_content } = req.body;
    
    try {
        // Check if attempt is still in progress
        const attempt = await db.execute({
            sql: "SELECT status FROM attempts WHERE id = ?",
            args: [attempt_id]
        });

        if (!attempt.rows[0] || attempt.rows[0].status !== 'IN_PROGRESS') {
            return res.status(400).json({ message: "Attempt is not in progress" });
        }

        // Upsert answer
        const existing = await db.execute({
            sql: "SELECT id FROM answers WHERE attempt_id = ? AND question_id = ?",
            args: [attempt_id, question_id]
        });

        if (existing.rows.length > 0) {
            await db.execute({
                sql: "UPDATE answers SET selected_option = ?, answer_text = ?, code_content = ? WHERE id = ?",
                args: [selected_option || null, answer_text || null, code_content || null, existing.rows[0].id]
            });
        } else {
            const answerId = generateId();
            await db.execute({
                sql: "INSERT INTO answers (id, attempt_id, question_id, selected_option, answer_text, code_content) VALUES (?, ?, ?, ?, ?, ?)",
                args: [answerId, attempt_id, question_id, selected_option || null, answer_text || null, code_content || null]
            });
        }

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const submitAttempt = async (req: AuthRequest, res: Response) => {
    const { attempt_id } = req.body;
    
    try {
        const attemptRes = await db.execute({
            sql: "SELECT exam_id FROM attempts WHERE id = ?",
            args: [attempt_id]
        });

        if (attemptRes.rows.length === 0) return res.status(404).json({ message: "Attempt not found" });
        const examId = attemptRes.rows[0].exam_id;

        // Get the exam and its category
        const exam = await db.execute({
            sql: "SELECT category_id, passing_score FROM exams WHERE id = ?",
            args: [examId]
        });
        const categoryId = exam.rows[0]?.category_id;

        // Fetch questions and answers to calculate score
        const questions = await db.execute({
            sql: "SELECT id, correct_answer, type, marks FROM questions WHERE exam_id = ? OR category_id = ?",
            args: [examId, categoryId]
        });

        const answers = await db.execute({
            sql: "SELECT question_id, selected_option, answer_text FROM answers WHERE attempt_id = ?",
            args: [attempt_id]
        });

        let totalScore = 0;
        let totalPossible = 0;
        const answerMap = new Map(answers.rows.map(a => [a.question_id, a]));

        for (const q of questions.rows) {
            totalPossible += Number(q.marks || 0);
            const ans = answerMap.get(q.id);
            if (!ans) continue;

            let isCorrect = false;
            if (q.type === 'MCQ') {
                isCorrect = ans.selected_option === q.correct_answer;
            } else if (q.type === 'SHORT') {
                const ansText = String(ans.answer_text || "").trim().toLowerCase();
                const correctText = String(q.correct_answer || "").trim().toLowerCase();
                isCorrect = ansText === correctText;
            }

            if (isCorrect) {
                const marks = Number(q.marks || 1);
                totalScore += marks;
                await db.execute({
                    sql: "UPDATE answers SET is_correct = 1, marks_awarded = ? WHERE attempt_id = ? AND question_id = ?",
                    args: [marks, attempt_id, q.id]
                });
            } else {
                await db.execute({
                    sql: "UPDATE answers SET is_correct = 0, marks_awarded = 0 WHERE attempt_id = ? AND question_id = ?",
                    args: [attempt_id, q.id]
                });
            }
        }

        const passMark = Number(exam.rows[0]?.passing_score || 40);
        const percentage = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;
        const status = percentage >= passMark ? 'PASSED' : 'FAILED';

        const roundedPercentage = Math.round(percentage);

        await db.execute({
            sql: "UPDATE attempts SET status = 'SUBMITTED', submit_time = CURRENT_TIMESTAMP, score = ? WHERE id = ?",
            args: [roundedPercentage, attempt_id]
        });

        res.json({ 
            success: true, 
            score: totalScore, 
            percentage: Number(percentage.toFixed(2)),
            status: status
        });

        if (req.user) {
            const examData = await db.execute({ sql: "SELECT title FROM exams WHERE id = ?", args: [exam.rows[0].id] });
            const title = examData.rows[0]?.title || "Unknown Exam";
            await logActivity(req.user.id, "SUBMITTED_ATTEMPT", `Completed Exam - ${title}`, status === 'PASSED' ? "SUCCESS" : "COMPLETED");
        }
    } catch (error) {
        console.error("Submit Attempt Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getResult = async (req: AuthRequest, res: Response) => {
    const { attemptId } = req.params;
    try {
        const attempt = await db.execute({
            sql: `
                SELECT a.*, e.title as exam_title, e.passing_score
                FROM attempts a
                JOIN exams e ON a.exam_id = e.id
                WHERE a.id = ?
            `,
            args: [attemptId]
        });

        if (attempt.rows.length === 0) return res.status(404).json({ message: "Result not found" });

        const answers = await db.execute({
            sql: `
                SELECT ans.*, q.question_text, q.correct_answer, q.explanation, q.type, q.options
                FROM answers ans
                JOIN questions q ON ans.question_id = q.id
                WHERE ans.attempt_id = ?
            `,
            args: [attemptId]
        });

        res.json({
            attempt: attempt.rows[0],
            answers: answers.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getAttemptQuestions = async (req: AuthRequest, res: Response) => {
    const { attemptId } = req.params;
    try {
        const attemptRes = await db.execute({
            sql: "SELECT exam_id, status, start_time FROM attempts WHERE id = ?",
            args: [attemptId]
        });

        if (attemptRes.rows.length === 0) return res.status(404).json({ message: "Attempt not found" });
        if (attemptRes.rows[0].status === 'SUBMITTED') return res.status(400).json({ message: "Exam already submitted" });

        const examId = attemptRes.rows[0].exam_id;
        
        const exam = await db.execute({
            sql: "SELECT title, duration, category_id FROM exams WHERE id = ?",
            args: [examId]
        });

        if (exam.rows.length === 0) return res.status(404).json({ message: "Exam not found" });

        const categoryId = exam.rows[0].category_id;

        let remainingSeconds = 0;
        try {
            const startTimeStr = String(attemptRes.rows[0].start_time).replace(' ', 'T') + (String(attemptRes.rows[0].start_time).includes('T') ? '' : 'Z');
            const startTime = new Date(startTimeStr);
            const durationMinutes = Number(exam.rows[0].duration || 0);
            const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
            const now = new Date();
            remainingSeconds = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
        } catch (timerError) {
            console.error("Timer calculation error:", timerError);
            remainingSeconds = 3600; // Default to 1 hour if calculation fails
        }

        console.log(`[DEBUG] Attempt ID: ${attemptId} -> Exam ID: ${examId}, Category ID: ${categoryId}`);
        
        const questions = await db.execute({
            sql: "SELECT * FROM questions WHERE exam_id = ? OR category_id = ?",
            args: [examId, categoryId || '']
        });
        
        console.log(`[DEBUG] Found ${questions.rows.length} questions for this assessment.`);
        if (questions.rows.length === 0) {
            console.warn(`[WARN] No questions found for exam_id=${examId} or category_id=${categoryId}`);
        }

        // Get existing answers to resume
        const answers = await db.execute({
            sql: "SELECT question_id, selected_option, answer_text, code_content FROM answers WHERE attempt_id = ?",
            args: [attemptId]
        });

        const parsedQuestions = questions.rows.map((q: any) => {
            let parsedOptions = [];
            let parsedLanguages = [];
            let parsedTestCases = [];

            try {
                parsedOptions = typeof q.options === 'string' ? JSON.parse(q.options || '[]') : (q.options || []);
            } catch (e) {
                console.error(`Error parsing options for question ${q.id}:`, e);
                parsedOptions = String(q.options || '').split(',').map((s: string) => s.trim());
            }

            try {
                parsedLanguages = typeof q.languages === 'string' ? JSON.parse(q.languages || '[]') : (q.languages || []);
            } catch (e) {
                parsedLanguages = ["javascript"];
            }

            try {
                parsedTestCases = typeof q.test_cases === 'string' ? JSON.parse(q.test_cases || '[]') : (q.test_cases || []);
            } catch (e) {
                parsedTestCases = [];
            }

            return {
                ...q,
                options: parsedOptions,
                languages: parsedLanguages,
                test_cases: parsedTestCases
            };
        });

        res.json({
            exam: exam.rows[0],
            questions: parsedQuestions,
            answers: answers.rows,
            remaining_seconds: remainingSeconds
        });
    } catch (error: any) {
        console.error("CRITICAL ERROR in getAttemptQuestions:", error);
        res.status(500).json({ 
            message: "Internal server error", 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
        });
    }
};

export const runCode = async (req: AuthRequest, res: Response) => {
    const { code, language } = req.body;
    // Mocking code execution
    try {
        res.json({
            output: "Program executed successfully.\nOutput: Hello World",
            status: "success"
        });
    } catch (error) {
        res.status(500).json({ message: "Execution error" });
    }
};
