"use client";

import { useQuery } from "@tanstack/react-query";
import { studentApi } from "@/services/api";
import { useParams, useRouter } from "next/navigation";
import { 
    CheckCircle2, XCircle, Award, ArrowLeft, 
    Download, LayoutDashboard, Share2, Info,
    Check, X, FileText, BarChart3, Clock
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ExamResult() {
  const { attemptId } = useParams();
  const router = useRouter();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["examResult", attemptId],
    queryFn: () => studentApi.getResult(attemptId as string).then(res => res.data),
    retry: 1
  });

  if (isError) {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
            <XCircle size={48} className="text-red-500 mb-4" />
            <h2 className="text-2xl font-black font-heading text-dark mb-2">Report Unavailable</h2>
            <p className="text-slate-500 font-medium max-w-md">{(error as any)?.response?.data?.message || "We encountered an error while retrieving your assessment report. Please try again later."}</p>
            <button onClick={() => router.push("/student/dashboard")} className="mt-8 px-8 py-3 bg-brand-indigo text-white rounded-2xl font-black text-xs uppercase tracking-widest">Return to Dashboard</button>
        </div>
    );
  }

  if (isLoading || !data) {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
            <BarChart3 size={40} className="animate-pulse text-brand-indigo" />
            <p className="font-heading font-black text-slate-400 uppercase tracking-widest text-xs">Generating Report...</p>
        </div>
    );
  }

  const { attempt, answers } = data;
  const isPassed = attempt.score >= attempt.passing_score;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Link href="/student/dashboard" className="inline-flex items-center text-xs font-black text-muted-foreground hover:text-brand-indigo mb-4 transition uppercase tracking-widest gap-2">
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-heading font-black tracking-tight mb-2">Assessment Report</h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2">Comprehensive performance analysis for {attempt.exam_title}.</p>
        </div>
        <div className="flex gap-4">
            <button className="flex items-center gap-3 px-6 py-3 bg-white border border-border rounded-2xl font-black text-xs uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                <Download size={16} /> Download PDF
            </button>
            <button className="flex items-center gap-3 px-8 py-3 bg-primary-gradient text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-indigo/20 hover:scale-105 transition-all">
                <Share2 size={16} /> Share Result
            </button>
        </div>
      </div>

      {/* Hero Result Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-12 rounded-[48px] border-2 relative overflow-hidden shadow-2xl ${
            isPassed ? "bg-brand-emerald/5 border-brand-emerald/20" : "bg-red-50 border-red-100"
        }`}
      >
        <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
            <div className={`w-32 h-32 rounded-[40px] flex items-center justify-center shadow-2xl ${
                isPassed ? "bg-brand-emerald text-white" : "bg-red-500 text-white"
            }`}>
                {isPassed ? <CheckCircle2 size={64} /> : <XCircle size={64} />}
            </div>
            <div className="text-center md:text-left space-y-2">
                <div className={`text-[12px] font-black uppercase tracking-[0.3em] ${isPassed ? "text-brand-emerald" : "text-red-500"}`}>
                    Status: {isPassed ? "PASSED" : "FAILED"}
                </div>
                <h2 className="text-5xl font-black font-heading tracking-tight text-dark">
                    {attempt.score}% <span className="text-2xl text-slate-400 font-bold ml-2">Accuracy Rate</span>
                </h2>
                <p className="text-slate-500 font-medium max-w-md">
                    {isPassed 
                        ? "Exceptional performance! You have exceeded the pass mark and demonstrated proficiency in this technical domain." 
                        : "You did not reach the passing threshold this time. Focus on the incorrect answers below to strengthen your understanding."}
                </p>
            </div>
            
            <div className="ml-auto flex flex-col gap-3">
                <div className="bg-white/60 backdrop-blur-md p-6 rounded-[32px] border border-white shadow-inner text-center min-w-[180px]">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Passing Mark</div>
                    <div className="text-2xl font-black text-dark">{attempt.passing_score}%</div>
                </div>
                <div className="bg-white/60 backdrop-blur-md p-6 rounded-[32px] border border-white shadow-inner text-center min-w-[180px]">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Duration Taken</div>
                    <div className="text-2xl font-black text-dark">24:12</div>
                </div>
            </div>
        </div>
        <div className={`absolute top-0 right-0 p-10 opacity-10 pointer-events-none`}>
            <Award size={200} />
        </div>
      </motion.div>

      {/* Detailed Question Review */}
      <div className="space-y-8">
        <h2 className="text-2xl font-black font-heading tracking-tight px-2 flex items-center gap-3">
            <FileText className="text-brand-indigo" />
            Detailed Response Review
        </h2>
        
        <div className="space-y-6">
            {answers.map((ans: any, i: number) => {
                const isCorrect = ans.is_correct === 1;
                return (
                    <motion.div 
                        key={ans.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white rounded-[40px] border border-border p-8 shadow-sm group hover:shadow-xl transition-all"
                    >
                        <div className="flex justify-between items-start gap-6 mb-6">
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center font-black text-xs text-slate-400 border border-slate-100">
                                        {i + 1}
                                    </div>
                                    <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                                        isCorrect ? "bg-brand-emerald/10 text-brand-emerald" : "bg-red-50 text-red-500"
                                    }`}>
                                        {isCorrect ? <Check size={12} /> : <X size={12} />}
                                        {isCorrect ? "Correct Response" : "Incorrect Response"}
                                    </span>
                                </div>
                                <h3 className="text-xl font-black font-heading leading-tight text-slate-800">
                                    {ans.question_text}
                                </h3>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Points</div>
                                <div className="text-xl font-black text-dark">{ans.marks_awarded} / {ans.marks}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className={`p-6 rounded-[24px] border border-dashed ${isCorrect ? "bg-slate-50 border-slate-200" : "bg-red-50/30 border-red-100"}`}>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <BarChart3 size={12} /> Your Submission
                                </div>
                                <div className="font-bold text-slate-700">
                                    {ans.selected_option || ans.answer_text || (ans.code_content ? <code className="text-xs bg-slate-900 text-brand-emerald p-2 rounded block mt-2">Source Code Submitted</code> : "No response provided.")}
                                </div>
                            </div>
                            {!isCorrect && (
                                <div className="p-6 bg-brand-emerald/5 rounded-[24px] border border-brand-emerald/10">
                                    <div className="text-[10px] font-black text-brand-emerald uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <CheckCircle2 size={12} /> Expected Correction
                                    </div>
                                    <div className="font-bold text-brand-emerald">
                                        {ans.correct_answer}
                                    </div>
                                </div>
                            )}
                        </div>

                        {ans.explanation && (
                            <div className="mt-6 p-6 bg-slate-50 rounded-[24px] border border-slate-100 flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-brand-indigo shadow-sm shrink-0">
                                    <Info size={18} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Educational Insight</div>
                                    <p className="text-sm font-medium text-slate-600 leading-relaxed">{ans.explanation}</p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                );
            })}
        </div>
      </div>

      <div className="bg-white p-10 rounded-[48px] border border-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
            <h3 className="text-xl font-black font-heading mb-1">Analyze Global Rankings</h3>
            <p className="text-slate-500 font-medium">See how your performance compares to the rest of the student body.</p>
        </div>
        <Link 
            href="/student/leaderboard"
            className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
        >
            <BarChart3 size={18} /> View Global Leaderboard
        </Link>
      </div>
    </div>
  );
}
