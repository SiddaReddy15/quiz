"use client";

import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { studentApi } from "@/services/api";
import { 
    Clock, CheckCircle2, PlayCircle, Lock, 
    Calendar, Tag, Award, ArrowRight, Loader2, AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AvailableExams() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = React.useState("ALL");

  const { data: exams, isLoading } = useQuery({
    queryKey: ["availableExams"],
    queryFn: () => studentApi.getExams().then(res => res.data),
  });

  const categories = exams ? Array.from(new Set(exams.map((e: any) => e.category_name))).filter(Boolean) : [];

  const filteredExams = exams?.filter((exam: any) => 
    selectedCategory === "ALL" || exam.category_name === selectedCategory
  );

  const startMutation = useMutation({
    mutationFn: (examId: string) => studentApi.startAttempt({ exam_id: examId }),
    onSuccess: (res) => {
        const attemptId = res.data.attemptId;
        router.push(`/student/exam/${attemptId}`);
    },
    onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to start assessment");
    }
  });

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-heading font-black tracking-tight mb-2">Technical Assessments</h1>
          <p className="text-muted-foreground font-medium italic">Select a challenge below to evaluate your skills.</p>
        </div>
        
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 p-1.5 bg-white border border-border rounded-[24px] shadow-sm">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                selectedCategory === "ALL" 
                  ? "bg-brand-indigo text-white shadow-lg shadow-brand-indigo/20" 
                  : "text-muted-foreground hover:bg-slate-50"
              }`}
            >
              All Topics
            </button>
            {categories.map((cat: any) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  selectedCategory === cat 
                    ? "bg-brand-indigo text-white shadow-lg shadow-brand-indigo/20" 
                    : "text-muted-foreground hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
        {isLoading ? (
            [1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-white rounded-[40px] animate-pulse border border-border" />)
        ) : filteredExams?.length === 0 ? (
            <div className="col-span-full py-32 bg-white rounded-[48px] border-2 border-dashed border-border flex flex-col items-center justify-center text-center">
                <AlertTriangle size={48} className="text-slate-200 mb-4" />
                <h3 className="text-xl font-black font-heading mb-2">No active assessments</h3>
                <p className="text-slate-400 font-bold max-w-xs">Check back later for new technical challenges released by the administrators.</p>
            </div>
        ) : filteredExams?.map((exam: any, idx: number) => {
            const isSubmitted = exam.attempt_status === 'SUBMITTED';
            const isInProgress = exam.attempt_status === 'IN_PROGRESS';
            const isTaken = isSubmitted || isInProgress;
            const isCompleted = isTaken; 
            
            return (
                <motion.div 
                    key={exam.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group bg-white rounded-[40px] border border-border p-8 hover:shadow-2xl hover:border-brand-indigo/20 transition-all duration-300 relative overflow-hidden flex flex-col"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                            isCompleted ? "bg-brand-emerald/10 text-brand-emerald" : "bg-brand-indigo/10 text-brand-indigo"
                        }`}>
                            {isCompleted ? <CheckCircle2 size={12} /> : <Tag size={12} />}
                            {isCompleted ? "Completed" : exam.category_name || "General"}
                        </div>
                        {isCompleted && (
                            <div className="text-[10px] font-black text-brand-indigo bg-brand-indigo/5 px-3 py-1.5 rounded-xl">
                                Score: {exam.score}%
                            </div>
                        )}
                    </div>

                    <h3 className="text-2xl font-black font-heading tracking-tight mb-4 group-hover:text-brand-indigo transition-colors leading-tight">
                        {exam.title}
                    </h3>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50">
                            <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase opacity-60 mb-1">
                                <Clock size={12} /> Duration
                            </div>
                            <div className="text-lg font-black">{exam.duration} Min</div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50">
                            <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase opacity-60 mb-1">
                                <Award size={12} /> Pass Mark
                            </div>
                            <div className="text-lg font-black">{exam.passing_score}%</div>
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-1.5">
                            <Calendar size={12} className="text-brand-indigo" />
                            Released: {new Date(exam.created_at).toLocaleDateString()}
                        </div>
                        
                        {isTaken ? (
                            <div className="flex items-center gap-4">
                                {isSubmitted ? (
                                    <button 
                                        onClick={() => router.push(`/student/result/${exam.attempt_id}`)}
                                        className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                    >
                                        View Report <ArrowRight size={14} />
                                    </button>
                                ) : (
                                    <div className="px-6 py-3 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-100">
                                        Attempt Recorded
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button 
                                onClick={() => startMutation.mutate(exam.id)}
                                disabled={startMutation.isPending}
                                className="flex items-center gap-2 px-6 py-3 bg-brand-indigo text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-brand-indigo/20 hover:scale-105"
                            >
                                {startMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <PlayCircle size={14} />}
                                Start Now
                            </button>
                        )}
                    </div>
                    
                    <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-[80px] opacity-10 transition-opacity duration-500 ${isCompleted ? "bg-brand-emerald" : "bg-brand-indigo"}`} />
                </motion.div>
            );
        })}
      </div>
    </div>
  );
}
