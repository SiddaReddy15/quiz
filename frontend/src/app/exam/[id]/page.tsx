"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { studentApi } from "@/services/api";
import { Clock, Send, ChevronLeft, ChevronRight, AlertCircle, Loader2, GraduationCap, LayoutPanelLeft, Save } from "lucide-react";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";

export default function ExamAttempt() {
  const { id: examId } = useParams();
  const router = useRouter();
  const [examInfo, setExamInfo] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchExam = useCallback(async () => {
    try {
      const response = await studentApi.startAttempt(examId as string);
      setQuestions(response.data.questions);
      setAttemptId(response.data.attemptId);
      setExamInfo(response.data.exam);
      // Backend returns duration in minutes
      setTimeLeft(response.data.exam.duration * 60);
    } catch (err) {
      console.error(err);
      router.push("/student/dashboard");
    } finally {
      setLoading(false);
    }
  }, [examId, router]);

  useEffect(() => {
    fetchExam();
  }, [fetchExam]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => (t !== null && t > 0 ? t - 1 : 0));
      }, 1000);
    } else if (timeLeft === 0) {
      onSubmit();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [timeLeft]);

  // Auto-save every 10 seconds
  useEffect(() => {
    const save = async () => {
      if (attemptId && questions[currentIdx]) {
        const qId = questions[currentIdx].id;
        if (answers[qId]) {
          setIsAutoSaving(true);
          try {
            await studentApi.saveAnswer({
              attempt_id: attemptId,
              question_id: qId,
              answer: answers[qId]
            });
          } finally {
            setTimeout(() => setIsAutoSaving(false), 1000);
          }
        }
      }
    };
    const interval = setInterval(save, 10000);
    return () => clearInterval(interval);
  }, [attemptId, questions, currentIdx, answers]);

  const onSubmit = async () => {
    if (submitting) return;
    if (!confirm("Are you sure you want to submit the exam?")) return;
    
    setSubmitting(true);
    try {
      const response = await studentApi.submitAttempt({
        attempt_id: attemptId
      });
      // Redirect to the result page using the attemptId
      router.push(`/student/results/${attemptId}`);
    } catch (err) {
      console.error(err);
      alert("Error submitting exam. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const currentQ = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
           <div className="absolute inset-0 border-4 border-brand-indigo/20 rounded-full" />
           <div className="absolute inset-0 border-4 border-brand-indigo border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-slate-600 font-bold font-heading">Initializing Secure Environment...</p>
      </div>
    </div>
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-body selection:bg-brand-indigo/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-border px-8 py-3 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
           </div>
           <div>
              <h1 className="text-lg font-black font-heading text-slate-800 leading-tight">{examInfo?.title || "Exam in Progress"}</h1>
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                 <span className="flex h-1.5 w-1.5 rounded-full bg-brand-emerald animate-pulse" />
                 Secure Connection Active
              </div>
           </div>
        </div>

        <div className="flex items-center gap-6">
          <AnimatePresence>
            {isAutoSaving && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-xs font-bold text-brand-emerald"
              >
                <Save size={14} className="animate-bounce" />
                Autosaving...
              </motion.div>
            )}
          </AnimatePresence>

          <div className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl font-extrabold border shadow-sm transition-colors ${
            timeLeft && timeLeft < 300 
              ? "bg-red-50 text-red-600 border-red-100 animate-pulse" 
              : "bg-slate-50 text-brand-indigo border-border"
          }`}>
            <Clock size={20} />
            <span className="text-xl tabular-nums tracking-tight">
              {timeLeft !== null ? formatTime(timeLeft) : "00:00"}
            </span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-slate-100 sticky top-[73px] z-40">
         <motion.div 
           initial={{ width: 0 }}
           animate={{ width: `${progress}%` }}
           className="h-full bg-primary-gradient"
         />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-80 bg-white border-r border-border overflow-y-auto p-8 hidden lg:block">
          <div className="mb-8">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">Question Progress</h2>
            <div className="flex items-end justify-between mb-2">
               <span className="text-2xl font-extrabold">{answeredCount}<span className="text-muted-foreground text-sm">/{questions.length}</span></span>
               <span className="text-xs font-bold text-brand-indigo">{Math.round((answeredCount/questions.length)*100)}% Complete</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-brand-indigo rounded-full" style={{ width: `${(answeredCount/questions.length)*100}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(idx)}
                className={`w-11 h-11 rounded-lg font-bold transition-all duration-200 flex items-center justify-center relative ${
                  currentIdx === idx 
                    ? "bg-brand-indigo text-white shadow-lg shadow-brand-indigo/30 scale-105 z-10" 
                    : answers[q.id] 
                      ? "bg-brand-emerald/10 text-brand-emerald border-2 border-brand-emerald/20" 
                      : "bg-slate-50 text-slate-400 border-2 border-transparent hover:border-slate-200"
                }`}
              >
                {idx + 1}
                {answers[q.id] && currentIdx !== idx && (
                   <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-emerald rounded-full border-2 border-white" />
                )}
              </button>
            ))}
          </div>
          
          <div className="mt-12 p-6 bg-slate-50 rounded-[24px] border border-border space-y-4">
             <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                 <div className="w-3 h-3 bg-brand-emerald rounded-full" />
                 <span>Answered Questions</span>
             </div>
             <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                 <div className="w-3 h-3 bg-brand-indigo rounded-full" />
                 <span>Current Focus</span>
             </div>
             <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                 <div className="w-3 h-3 bg-slate-200 rounded-full" />
                 <span>Yet to visit</span>
             </div>
          </div>
        </aside>

        {/* Question Content */}
        <main className="flex-1 flex flex-col p-8 lg:p-12 overflow-y-auto">
          <AnimatePresence mode="wait">
            {currentQ && (
              <motion.div 
                key={currentIdx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl w-full mx-auto space-y-8"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-brand-indigo/10 text-brand-indigo flex items-center justify-center font-bold">
                           {currentIdx + 1}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                           {currentQ.type} Question
                        </span>
                     </div>
                     <span className="text-sm font-bold text-brand-purple bg-brand-purple/10 px-3 py-1 rounded-lg">
                        Worth {currentQ.marks} Marks
                     </span>
                  </div>
                  <h2 className="text-3xl font-heading font-extrabold text-slate-800 leading-[1.3]">
                    {currentQ.question_text}
                  </h2>
                </div>

                <div className="bg-white p-2 rounded-[32px] shadow-2xl shadow-slate-200/50 border border-border overflow-hidden">
                  {currentQ.type === "MCQ" ? (
                    <div className="grid grid-cols-1 gap-3 p-4">
                      {JSON.parse(currentQ.options || "[]").map((opt: string, i: number) => {
                        const isSelected = answers[currentQ.id] === opt;
                        return (
                          <label key={opt} className={`flex items-center p-6 rounded-[24px] border-2 transition-all cursor-pointer group relative overflow-hidden ${
                            isSelected 
                              ? "border-brand-indigo bg-brand-indigo/[0.02]" 
                              : "border-slate-100 hover:border-brand-indigo/30 hover:bg-slate-50"
                          }`}>
                            <div className="mr-6 relative z-10">
                               <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                                 isSelected ? "bg-brand-indigo border-brand-indigo" : "border-slate-300 group-hover:border-brand-indigo/50"
                               }`}>
                                 {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                               </div>
                            </div>
                            <input
                              type="radio"
                              name={`q-${currentQ.id}`}
                              value={opt}
                              checked={isSelected}
                              onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
                              className="hidden"
                            />
                            <div className="flex items-center gap-4 relative z-10 w-full">
                               <span className="text-lg font-bold text-muted-foreground group-hover:text-brand-indigo transition-colors">
                                 {String.fromCharCode(65 + i)}.
                               </span>
                               <span className={`text-lg font-semibold ${isSelected ? "text-slate-900" : "text-slate-600"}`}>
                                 {opt}
                               </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  ) : currentQ.type === "CODING" ? (
                    <div className="flex flex-col">
                      <div className="bg-slate-900 border-b border-white/5 p-4 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <select 
                               className="bg-slate-800 text-white text-xs font-bold border border-white/10 rounded-lg px-3 py-1.5 focus:ring-2 ring-brand-indigo/20 outline-none"
                               defaultValue="javascript"
                            >
                               <option value="javascript">JavaScript (Node.js)</option>
                               <option value="python">Python 3.10</option>
                               <option value="java">Java 17</option>
                            </select>
                            <div className="h-4 w-[1px] bg-white/10" />
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">main.js</div>
                         </div>
                         <div className="flex items-center gap-2">
                             <button className="px-4 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg border border-white/10 hover:bg-slate-700 transition-colors">
                                Run Code
                             </button>
                             <button className="px-4 py-1.5 bg-brand-indigo text-white text-xs font-bold rounded-lg shadow-lg shadow-brand-indigo/20 hover:scale-105 active:scale-95 transition-all">
                                Run Tests
                             </button>
                         </div>
                      </div>
                      <div className="h-[450px] bg-slate-900 shadow-inner p-1">
                        <Editor
                          height="100%"
                          defaultLanguage="javascript"
                          theme="vs-dark"
                          value={answers[currentQ.id] || ""}
                          onChange={(val) => setAnswers({ ...answers, [currentQ.id]: val || "" })}
                          options={{ 
                            fontSize: 15, 
                            minimap: { enabled: false }, 
                            scrollBeyondLastLine: false,
                            fontFamily: "var(--font-roboto-mono), monospace",
                            padding: { top: 20 },
                            roundedSelection: true,
                          }}
                        />
                      </div>
                      <div className="bg-slate-900 border-t border-white/5 p-6 min-h-[160px]">
                         <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Output Console</span>
                            <span className="text-[10px] font-bold text-slate-500">Execution time: 0ms</span>
                         </div>
                         <div className="font-mono text-sm text-slate-300 bg-slate-800/50 p-4 rounded-xl border border-white/5 min-h-[80px]">
                            <span className="text-slate-500 italic">Click "Run Code" to view output...</span>
                         </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-0">
                      <textarea
                        className="w-full p-6 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-indigo focus:bg-white outline-none transition-all text-lg font-body leading-relaxed min-h-[350px]"
                        placeholder="Type your comprehensive answer here..."
                        value={answers[currentQ.id] || ""}
                        onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Footer Actions */}
      <footer className="bg-white border-t border-border px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-6 z-50">
        <div className="flex gap-4 w-full sm:w-auto">
          <button
            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
            className="flex-1 sm:flex-none px-8 py-4 border-2 border-border rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            <ChevronLeft size={20} />
            Previous
          </button>
          <button
            onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
            disabled={currentIdx === questions.length - 1}
            className="flex-1 sm:flex-none px-8 py-4 border-2 border-brand-indigo text-brand-indigo rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-indigo/5 transition-all disabled:opacity-30"
          >
            Next Question
            <ChevronRight size={20} />
          </button>
        </div>

        <button
          onClick={onSubmit}
          disabled={submitting}
          className="w-full sm:w-auto bg-primary-gradient text-white px-10 py-4 rounded-2xl font-extrabold flex items-center justify-center gap-3 shadow-xl shadow-brand-indigo/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70"
        >
          {submitting ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
          Submit
        </button>
      </footer>
    </div>
  );
}
