import { Router } from "express";
import { 
    createExam, getExams, addQuestion, publishExam, 
    getExamStats, uploadQuestionsExcel, deleteExam, 
    getStudents, getQuestionsByExam, enrollStudent, exportStudentsToCSV,
    getAllResults, getCategories, getQuestionsByCategory,
    updateQuestion, deleteQuestion, updateExam, exportQuestionsTemplate, getQuestionById
} from "../controllers/adminController";
import { authenticate, authorize } from "../middleware/authMiddleware";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.use(authenticate);
router.use(authorize(["ADMIN"]));

router.post("/exams", createExam);
router.get("/exams", getExams);
router.put("/exams/:id", updateExam);
router.delete("/exams/:id", deleteExam);
router.post("/questions", addQuestion);
router.patch("/questions/:id", updateQuestion);
router.get("/questions/single/:id", getQuestionById);
router.delete("/questions/:id", deleteQuestion);
router.get("/questions/:examId", getQuestionsByExam);
router.post("/questions/upload", upload.single("file"), uploadQuestionsExcel);
router.get("/questions/template", exportQuestionsTemplate);
router.patch("/exams/:id/publish", publishExam);
router.get("/stats", getExamStats);
router.get("/students", getStudents);
router.get("/students/export", exportStudentsToCSV);
router.post("/students", enrollStudent);
router.get("/results", getAllResults);

router.get("/categories", getCategories);
router.get("/questions/category/:categorySlug", getQuestionsByCategory);

export default router;
