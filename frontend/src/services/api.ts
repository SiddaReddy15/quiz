import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export const authApi = {
  login: (data: any) => api.post("/auth/login", data),
  register: (data: any) => api.post("/auth/register", data),
  updateProfile: (data: any) => api.put("/auth/update-profile", data),
  changePassword: (data: any) => api.put("/auth/change-password", data),
};

export const adminApi = {
  createExam: (data: any) => api.post("/admin/exams", data),
  updateExam: (id: string, data: any) => api.put(`/admin/exams/${id}`, data),
  getExams: (categoryId?: string) => api.get("/admin/exams", { params: { categoryId } }),
  deleteExam: (id: string) => api.delete(`/admin/exams/${id}`),
  addQuestion: (data: any) => api.post("/admin/questions", data),
  getQuestionById: (id: string) => api.get(`/admin/questions/single/${id}`),
  getQuestionsByExam: (examId: string) => api.get(`/admin/questions/${examId}`),
  updateQuestion: (id: string, data: any) => api.patch(`/admin/questions/${id}`, data),
  deleteQuestion: (id: string) => api.delete(`/admin/questions/${id}`),
  uploadExcel: (formData: FormData) => api.post("/admin/questions/upload", formData),
  bulkImport: (formData: FormData) => api.post("/admin/questions/upload", formData),
  publishExam: (id: string, isPublished: boolean) => api.patch(`/admin/exams/${id}/publish`, { is_published: isPublished }),
  getStats: () => api.get("/admin/stats"),
  getStudents: () => api.get("/admin/students"),
  exportStudentsCSV: () => api.get("/admin/students/export", { responseType: "blob" }),
  enrollStudent: (data: any) => api.post("/admin/students", data),
  getAllResults: () => api.get("/admin/results"),
  getQuestionsByCategory: (categoryId: string) => api.get(`/admin/questions/category/${categoryId}`),
  getCategories: () => api.get("/admin/categories"),
  downloadTemplate: () => api.get("/admin/questions/template", { responseType: "blob" }),
};

export const studentApi = {
  getDashboard: () => api.get("/student/dashboard"),
  getExams: () => api.get("/student/exams"),
  getAttemptQuestions: (attemptId: string) => api.get(`/student/questions/${attemptId}`),
  startAttempt: (data: any) => api.post("/student/attempt/start", data),
  saveAnswer: (data: any) => api.post("/student/answer/save", data),
  submitAttempt: (data: any) => api.post("/student/attempt/submit", data),
  getResult: (attemptId: string) => api.get(`/student/results/${attemptId}`),
  exportResultPDF: (attemptId: string) => api.get(`/student/results/${attemptId}/pdf`, { responseType: "blob" }),
  runCode: (data: any) => api.post("/student/code/run", data),
};

export const publicApi = {
  getPlatformStats: () => api.get("/public/stats"),
};
