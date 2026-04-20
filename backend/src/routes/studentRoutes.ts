import { Router } from "express";
import { 
    getStudentDashboard, getAvailableExams, startAttempt, 
    saveAnswer, submitAttempt, getResult, runCode, getAttemptQuestions, exportResultPDF
} from "../controllers/studentController";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = Router();

router.use(authenticate);
router.use(authorize(["STUDENT"]));

router.get("/dashboard", getStudentDashboard);
router.get("/exams", getAvailableExams);
router.get("/questions/:attemptId", getAttemptQuestions);
router.post("/attempt/start", startAttempt);
router.post("/answer/save", saveAnswer);
router.post("/attempt/submit", submitAttempt);
router.get("/results/:attemptId", getResult);
router.get("/results/:attemptId/pdf", exportResultPDF);
router.post("/code/run", runCode);

export default router;
