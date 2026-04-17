"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { studentApi } from "@/services/api";
import { useParams, useRouter } from "next/navigation";
import { 
    Clock, CheckCircle2, ChevronLeft, ChevronRight, 
    Send, Loader2, AlertCircle, Save, Code2, FileText, 
    Layers, Timer, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function ExamInterface() {
  const { attemptId } = useParams();
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["examData", attemptId],
    queryFn: () => studentApi.getAttemptQuestions(attemptId as string).then(res => res.data),
    refetchOnWindowFocus: false,
    retry: 1
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => studentApi.saveAnswer(data),
    onSuccess: () => {
        setIsAutoSaving(false);
    }
  });

  const submitMutation = useMutation({
    mutationFn: () => studentApi.submitAttempt({ attempt_id: attemptId }),
    onSuccess: () => {
        toast.success("Assessment submitted successfully!");
        router.push(`/student/result/${attemptId}`);
    },
    onError: () => {
        toast.error("Failed to submit assessment. Please check your connection.");
    }
  });

  // Initialize answers and timer
  useEffect(() => {
    if (data && data.exam) {
        const initialAnswers: Record<string, any> = {};
        data.answers.forEach((a: any) => {
            initialAnswers[a.question_id] = {
                selected_option: a.selected_option,
                answer_text: a.answer_text,
                code_content: a.code_content
            };
        });
        setAnswers(initialAnswers);
        
        // Timer logic: use server-calculated remaining seconds
        if (data.remaining_seconds !== undefined) {
            setTimeLeft(data.remaining_seconds);
        } else {
            setTimeLeft(30 * 60); 
        }
    }
  }, [data]);

  // Handle errors
  if (data?.message) {
     return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
            <AlertCircle size={48} className="text-red-500 mb-4" />
            <h2 className="text-2xl font-black font-heading text-dark mb-2">Access Denied</h2>
            <p className="text-slate-500 font-medium max-w-md">{data.message}</p>
            <button onClick={() => router.push("/student/exams")} className="mt-8 px-8 py-3 bg-brand-indigo text-white rounded-2xl font-black text-xs uppercase tracking-widest">Return to Assessments</button>
        </div>
     );
  }

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
        handleAutoSubmit();
        return;
    }
    const timer = setInterval(() => setTimeLeft(prev => (prev !== null ? prev - 1 : null)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAutoSubmit = () => {
    toast.warning("Time is up! Submitting your assessment automatically.");
    submitMutation.mutate();
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
        ...prev,
        [questionId]: { ...prev[questionId], ...value }
    }));
    
    // Auto-save
    setIsAutoSaving(true);
    saveMutation.mutate({
        attempt_id: attemptId,
        question_id: questionId,
        ...value
    });
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ":" : ""}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isError) {
    const errorData = (error as any)?.response?.data;
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
            <AlertCircle size={48} className="text-red-500 mb-4" />
            <h2 className="text-2xl font-black font-heading text-dark mb-2">Failed to Load</h2>
            <p className="text-slate-500 font-medium max-w-md">
                {errorData?.error || errorData?.message || "We encountered an error while assembling your assessment."}
            </p>
            {errorData?.detail && <p className="text-[10px] text-slate-400 mt-2 font-mono">{errorData.detail}</p>}
            <button onClick={() => router.push("/student/exams")} className="mt-8 px-8 py-3 bg-brand-indigo text-white rounded-2xl font-black text-xs uppercase tracking-widest">Return to Assessments</button>
        </div>
    );
  }

  if (isLoading || !data) {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
            <Loader2 size={40} className="animate-spin text-brand-indigo" />
            <p className="font-heading font-black text-slate-400 uppercase tracking-widest text-xs">Assembling Assessment...</p>
        </div>
    );
  }

  if (!data.questions || data.questions.length === 0) {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
            <AlertCircle size={48} className="text-amber-500 mb-4" />
            <h2 className="text-2xl font-black font-heading text-dark mb-2">No Questions Found</h2>
            <p className="text-slate-500 font-medium max-w-md">This assessment doesn't seem to have any questions. Please contact the administrator.</p>
            <button onClick={() => router.push("/student/exams")} className="mt-8 px-8 py-3 bg-brand-indigo text-white rounded-2xl font-black text-xs uppercase tracking-widest">Return to Assessments</button>
        </div>
    );
  }

  const parseOptions = (optionsStr: any) => {
    if (!optionsStr) return [];
    if (Array.isArray(optionsStr)) return optionsStr;
    try {
        const parsed = JSON.parse(optionsStr);
        return Array.isArray(parsed) ? parsed : [optionsStr];
    } catch (e) {
        return String(optionsStr).split(",").map(s => s.trim());
    }
  };

  const currentQuestion = data.questions[currentIdx];
  const options = currentQuestion ? parseOptions(currentQuestion.options) : [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-body selection:bg-brand-indigo/20">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-8 py-4 flex items-center justify-between shadow-sm">
         <div className="flex items-center gap-6">
            <div className="w-10 h-10 bg-brand-indigo rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-indigo/20">
                <FileText size={20} />
            </div>
            <div>
                <h1 className="text-lg font-black font-heading tracking-tight leading-none">{data.exam.title}</h1>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">Section 1: General Proficiency</p>
            </div>
         </div>

         <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 bg-slate-50 px-6 py-2.5 rounded-2xl border border-slate-100 shadow-inner">
                <Timer size={18} className={timeLeft && timeLeft < 300 ? "text-red-500 animate-pulse" : "text-brand-indigo"} />
                <span className={`text-xl font-black tabular-nums ${timeLeft && timeLeft < 300 ? "text-red-500" : "text-dark"}`}>
                    {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
                </span>
            </div>
            
            <button 
                onClick={() => {
                    if (window.confirm("Are you sure you want to submit? You cannot undo this action.")) {
                        submitMutation.mutate();
                    }
                }}
                disabled={submitMutation.isPending}
                className="bg-primary-gradient text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-indigo/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
                {submitMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Finish Exam
            </button>
         </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <aside className="w-80 bg-white border-r border-slate-100 p-8 flex flex-col gap-8">
            <div>
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4 flex justify-between">
                    <span>Questions</span>
                    <span>{currentIdx + 1} / {data.questions.length}</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                    {data.questions.map((q: any, i: number) => {
                        const isAnswered = answers[q.id]?.selected_option || answers[q.id]?.answer_text || answers[q.id]?.code_content;
                        return (
                            <button
                                key={q.id}
                                onClick={() => setCurrentIdx(i)}
                                className={`w-12 h-12 rounded-xl text-xs font-black transition-all border ${
                                    currentIdx === i ? "bg-brand-indigo text-white border-brand-indigo shadow-lg shadow-brand-indigo/20" : 
                                    isAnswered ? "bg-brand-indigo/5 text-brand-indigo border-brand-indigo/20" : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100"
                                }`}
                            >
                                {i + 1}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="mt-auto space-y-4">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 border-dashed">
                    <div className="flex items-center gap-2 text-[10px] font-black text-brand-indigo uppercase tracking-widest mb-2">
                        <Info size={12} /> Pro-Tip
                    </div>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed">Your answers are automatically saved to our cloud servers every time you make a change.</p>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                    <span>Auto-Saving</span>
                    {isAutoSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} className="text-brand-emerald" />}
                </div>
            </div>
        </aside>

        {/* Main Question Area */}
        <main className="flex-1 overflow-y-auto p-12">
            <div className="max-w-4xl mx-auto space-y-10">
                {/* Question Header */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-lg">
                            Question {currentIdx + 1}
                        </span>
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                            currentQuestion.difficulty === 'HARD' ? 'bg-red-50 text-red-500' : 
                            currentQuestion.difficulty === 'MEDIUM' ? 'bg-amber-50 text-amber-500' : 'bg-brand-emerald/10 text-brand-emerald'
                        }`}>
                            {currentQuestion.difficulty}
                        </span>
                        <span className="text-[10px] font-black text-muted-foreground uppercase ml-auto">
                            {currentQuestion.marks} Marks
                        </span>
                    </div>
                    <h2 className="text-3xl font-black font-heading tracking-tight leading-tight text-dark">
                        {currentQuestion.question_text}
                    </h2>
                </div>

                {/* Question Type Specific Renderers */}
                <div className="bg-white p-10 rounded-[48px] border border-border shadow-sm min-h-[400px]">
                    {currentQuestion.type === 'MCQ' && (
                        <div className="space-y-4">
                            {options.map((opt: string, i: number) => {
                                const isSelected = answers[currentQuestion.id]?.selected_option === opt;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleAnswerChange(currentQuestion.id, { selected_option: opt })}
                                        className={`w-full text-left p-6 rounded-[24px] border-2 transition-all flex items-center gap-6 group ${
                                            isSelected ? "border-brand-indigo bg-brand-indigo/5 ring-4 ring-brand-indigo/5" : "border-slate-100 hover:border-slate-200"
                                        }`}
                                    >
                                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                                            isSelected ? "bg-brand-indigo border-brand-indigo text-white" : "border-slate-200 text-transparent"
                                        }`}>
                                            <div className="w-2 h-2 rounded-full bg-white" />
                                        </div>
                                        <span className={`font-bold text-lg ${isSelected ? "text-brand-indigo" : "text-slate-600"}`}>
                                            {opt}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {currentQuestion.type === 'SHORT' && (
                        <div className="space-y-6">
                            <label className="text-sm font-black text-dark uppercase tracking-widest opacity-60">Type your response below</label>
                            <textarea
                                value={answers[currentQuestion.id]?.answer_text || ""}
                                onChange={(e) => handleAnswerChange(currentQuestion.id, { answer_text: e.target.value })}
                                className="w-full h-64 p-8 bg-slate-50 border border-slate-100 rounded-[32px] outline-none focus:ring-4 ring-brand-indigo/10 focus:bg-white transition-all font-body text-lg leading-relaxed shadow-inner"
                                placeholder="Your detailed answer goes here..."
                            />
                        </div>
                    )}

                    {currentQuestion.type === 'CODING' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-brand-indigo/10 rounded-xl text-brand-indigo">
                                        <Code2 size={18} />
                                    </div>
                                    <span className="text-sm font-black text-dark uppercase tracking-widest opacity-60">Coding Workspace</span>
                                </div>
                                <div className="flex gap-2">
                                    {(typeof currentQuestion.languages === 'string' ? 
                                        (currentQuestion.languages.startsWith('[') ? JSON.parse(currentQuestion.languages) : currentQuestion.languages.split(',').map((l: string) => l.trim())) : 
                                        (currentQuestion.languages || ['javascript'])).map((lang: string) => (
                                        <span key={lang} className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black uppercase text-slate-500 border border-slate-200">{lang}</span>
                                    ))}
                                </div>
                            </div>
                            <textarea
                                value={answers[currentQuestion.id]?.code_content || currentQuestion.starter_code || ""}
                                onChange={(e) => handleAnswerChange(currentQuestion.id, { code_content: e.target.value })}
                                className="w-full h-80 p-8 bg-slate-900 text-brand-emerald border-none rounded-[32px] outline-none font-mono text-sm leading-relaxed shadow-2xl focus:ring-4 ring-brand-indigo/20"
                                placeholder="// Write your code here..."
                            />
                            <div className="flex justify-end gap-4">
                                <button className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200">
                                    Run Test Cases
                                </button>
                                <button className="px-6 py-3 bg-brand-emerald text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-emerald/20 hover:scale-105 transition-all">
                                    Execute Script
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between">
                    <button 
                        onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                        disabled={currentIdx === 0}
                        className="flex items-center gap-3 px-8 py-4 bg-white border border-border rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-all"
                    >
                        <ChevronLeft size={18} /> Previous Question
                    </button>
                    <div className="flex items-center gap-2">
                        {data.questions.map((_: any, i: number) => (
                            <div key={i} className={`h-1.5 transition-all rounded-full ${i === currentIdx ? "w-8 bg-brand-indigo" : "w-1.5 bg-slate-200"}`} />
                        ))}
                    </div>
                    <button 
                        onClick={() => {
                            if (currentIdx === data.questions.length - 1) {
                                if (window.confirm("This is the last question. Submit the assessment?")) {
                                    submitMutation.mutate();
                                }
                            } else {
                                setCurrentIdx(prev => Math.min(data.questions.length - 1, prev + 1));
                            }
                        }}
                        className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
                    >
                        {currentIdx === data.questions.length - 1 ? "Submit Assessment" : "Next Question"} <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </main>
      </div>
    </div>
  );
}
