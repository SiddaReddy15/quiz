"use client";

import { useForm } from "react-hook-form";
import { adminApi, studentApi } from "@/services/api";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Upload, Trash2, Save, Loader2, FileText, CheckCircle2, Code2, Layers, Info, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

interface QuestionFormData {
  type: string;
  marks: number;
  difficulty: string;
  question_text: string;
  options?: string;
  correct_answer: string;
}

export default function ManageQuestions() {
  const { id: examId } = useParams();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ["examQuestions", examId],
    queryFn: () => adminApi.getQuestionsByExam(examId as string).then(res => res.data),
  });

  const { register, handleSubmit, reset, watch } = useForm<QuestionFormData>({
    defaultValues: { 
      type: "MCQ", 
      marks: 1, 
      difficulty: "MEDIUM",
      question_text: "",
      options: "",
      correct_answer: ""
    }
  });
  
  const questionType = watch("type");

  const addMutation = useMutation({
    mutationFn: (data: any) => {
      const options = data.type === "MCQ" ? (typeof data.options === 'string' ? data.options.split(",").map((o: string) => o.trim()) : data.options) : [];
      return adminApi.addQuestion({ ...data, exam_id: examId, options });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["examQuestions", examId] });
      reset();
    }
  });

  const onAddQuestion = async (data: any) => {
    addMutation.mutate(data);
  };

  const onExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const xlsx = await import("xlsx");
      const workbook = xlsx.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json: any[] = xlsx.utils.sheet_to_json(sheet);
      setPreviewQuestions(json);
      setShowPreview(true);
    };
    reader.readAsArrayBuffer(file);
  };

  const confirmExcelUpload = async () => {
    setUploadLoading(true);
    try {
      for (const q of previewQuestions) {
        await addMutation.mutateAsync(q);
      }
      setShowPreview(false);
      setPreviewQuestions([]);
    } catch (err) {
      alert("Error uploading some questions");
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <Link href="/admin/exams" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-brand-indigo mb-4 transition">
            <ArrowLeft size={16} className="mr-2" />
            Back to Exams
          </Link>
          <h1 className="text-4xl font-heading font-extrabold tracking-tight">Curate Questions</h1>
          <p className="text-muted-foreground font-body">Build your assessment by adding multiple-choice, short-answer, or coding tasks.</p>
        </div>
        
        <div className="flex items-center gap-4">
            <label className="cursor-pointer bg-white border border-border px-6 py-3 rounded-2xl hover:bg-slate-50 transition shadow-sm flex items-center gap-2 font-bold text-sm">
                {uploadLoading ? <Loader2 size={18} className="animate-spin text-brand-indigo" /> : <Upload size={18} className="text-brand-indigo" />}
                <span>Import via Excel</span>
                <input type="file" className="hidden" accept=".xlsx, .xls" onChange={onExcelUpload} disabled={uploadLoading} />
            </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Question Form */}
        <div className="lg:col-span-5">
           <div className="bg-white p-8 rounded-[32px] shadow-sm border border-border sticky top-24">
              <h2 className="text-xl font-bold mb-8 flex items-center gap-2 font-heading">
                 <div className="w-8 h-8 rounded-lg bg-brand-emerald/10 text-brand-emerald flex items-center justify-center">
                    <Plus size={18} />
                 </div>
                 Add Question
              </h2>
              
              <form onSubmit={handleSubmit(onAddQuestion)} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-dark ml-1">Type</label>
                    <select {...register("type")} className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl focus:ring-4 focus:ring-brand-indigo/10 outline-none transition-all font-body text-sm appearance-none">
                      <option value="MCQ">Multiple Choice</option>
                      <option value="SHORT">Short Answer</option>
                      <option value="CODING">Coding Task</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-dark ml-1">Marks</label>
                    <input type="number" {...register("marks")} className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl focus:ring-4 focus:ring-brand-indigo/10 outline-none transition-all font-body text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-dark ml-1">Difficulty</label>
                    <select {...register("difficulty")} className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl focus:ring-4 focus:ring-brand-indigo/10 outline-none transition-all font-body text-sm appearance-none">
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-dark ml-1">Question Content</label>
                  <textarea 
                    {...register("question_text")} 
                    className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl focus:ring-4 focus:ring-brand-indigo/10 outline-none transition-all font-body text-sm min-h-[100px]" 
                    placeholder="Enter the comprehensive question here..." 
                  />
                </div>

                <AnimatePresence>
                  {questionType === "MCQ" && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1.5"
                    >
                      <label className="text-xs font-bold text-dark ml-1">Options (Comma separated)</label>
                      <input 
                        {...register("options")} 
                        className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl focus:ring-4 focus:ring-brand-indigo/10 outline-none transition-all font-body text-sm" 
                        placeholder="Option A, Option B, Option C, Option D" 
                      />
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-bold italic ml-1">
                        <Info size={10} />
                        Separate each option with a comma
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-dark ml-1">Correct Answer</label>
                   <input {...register("correct_answer")} className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl focus:ring-4 focus:ring-brand-indigo/10 outline-none transition-all font-body text-sm" placeholder="Enter the exact correct answer" />
                </div>

                <button
                  type="submit"
                  disabled={addMutation.isPending}
                  className="w-full bg-primary-gradient text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-brand-indigo/20 hover:scale-[1.02] active:scale-95 transition-all mt-4"
                >
                  {addMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                  <span>Add to Assessment</span>
                </button>
              </form>
           </div>
        </div>

        {/* Question List */}
        <div className="lg:col-span-7 space-y-6">
           <div className="flex items-center justify-between px-2">
              <h2 className="font-heading font-extrabold text-2xl flex items-center gap-2">
                 Assessment Flow
                 <span className="text-sm font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-lg">{questions?.length || 0}</span>
              </h2>
           </div>

           <div className="space-y-4">
              {questionsLoading ? (
                 [1,2,3].map(i => <div key={i} className="h-32 bg-white rounded-3xl border border-border animate-pulse" />)
              ) : questions?.length === 0 ? (
                 <div className="bg-white p-20 rounded-[40px] border border-dashed border-border text-center shadow-inner">
                    <Layers size={48} className="mx-auto text-slate-200 mb-4" />
                    <h3 className="text-lg font-bold">The canvas is empty</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">Start by adding your first question using the form on the left.</p>
                 </div>
              ) : questions?.map((q: any, idx: number) => (
                 <motion.div 
                    key={q.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white p-6 rounded-[32px] border border-border shadow-sm group hover:shadow-xl hover:border-brand-indigo/20 transition-all duration-300"
                 >
                    <div className="flex justify-between items-start gap-4">
                       <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-500">
                                {idx + 1}
                             </div>
                             <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                                q.type === "MCQ" ? "bg-brand-indigo/10 text-brand-indigo" :
                                q.type === "CODING" ? "bg-brand-purple/10 text-brand-purple" : "bg-brand-teal/10 text-brand-teal"
                             }`}>
                                {q.type === "MCQ" ? <CheckCircle2 size={12} /> : q.type === "CODING" ? <Code2 size={12} /> : <FileText size={12} />}
                                {q.type}
                             </span>
                             <span className="text-xs font-bold text-muted-foreground">{q.marks} Marks</span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-800 leading-tight">
                             {q.question_text}
                          </h3>
                          {q.options && (
                             <div className="grid grid-cols-2 gap-2">
                                {JSON.parse(q.options || "[]").map((opt: string, i: number) => (
                                   <div key={i} className={`text-xs p-2 rounded-lg border flex items-center gap-2 ${opt === q.correct_answer ? "bg-brand-emerald/5 border-brand-emerald/20 text-brand-emerald" : "bg-slate-50 border-slate-100 text-slate-500"}`}>
                                      <div className={`w-1.5 h-1.5 rounded-full ${opt === q.correct_answer ? "bg-brand-emerald" : "bg-slate-300"}`} />
                                      {opt}
                                   </div>
                                ))}
                             </div>
                          )}
                       </div>
                       
                       <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2.5 text-red-500 bg-white border border-border rounded-xl shadow-sm hover:bg-red-50 transition-all" title="Delete Question">
                             <Trash2 size={18} />
                          </button>
                          <button className="p-2.5 text-slate-400 bg-white border border-border rounded-xl shadow-sm hover:text-brand-indigo transition-all">
                             <Save size={18} />
                          </button>
                       </div>
                    </div>
                 </motion.div>
              ))}
           </div>
        </div>
      </div>

      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowPreview(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-8 border-b border-border flex justify-between items-center bg-slate-50">
                <div>
                   <h2 className="text-2xl font-black font-heading tracking-tight">Question Preview</h2>
                   <p className="text-sm text-muted-foreground font-bold">{previewQuestions.length} Questions detected in the file.</p>
                </div>
                <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                   <ChevronRight className="rotate-90" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-4">
                {previewQuestions.map((q, i) => (
                  <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-border">
                    <div className="flex justify-between mb-2">
                       <span className="text-[10px] font-black text-brand-indigo uppercase tracking-widest">{q.type || "MCQ"}</span>
                       <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{q.marks || 1} Marks • {q.difficulty || "MEDIUM"}</span>
                    </div>
                    <p className="font-bold text-slate-800">{q.question_text}</p>
                    {q.options && (
                      <p className="text-xs text-muted-foreground mt-2 italic">Options: {q.options}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-8 border-t border-border flex justify-end gap-4 bg-slate-50">
                <button 
                  onClick={() => setShowPreview(false)} 
                  className="px-8 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmExcelUpload}
                  disabled={uploadLoading}
                  className="px-8 py-3 bg-brand-indigo text-white rounded-2xl font-bold shadow-lg shadow-brand-indigo/20 flex items-center gap-2"
                >
                  {uploadLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Confirm Import
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
