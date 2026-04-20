"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { adminApi } from "@/services/api";
import { 
    ArrowLeft, Save, Globe, Lock, Clock, Trophy, FileText, 
    CalendarDays, Hourglass, CheckCircle, AlertCircle, Loader2, Sparkles, Settings
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

const examSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  passing_score: z.coerce.number().min(0).max(100),
  start_time: z.string(),
  end_time: z.string(),
  is_published: z.boolean().default(false)
}).refine(data => {
  if (!data.start_time || !data.end_time) return true;
  return new Date(data.end_time) > new Date(data.start_time);
}, {
  message: "End time must be after start time",
  path: ["end_time"]
});

export default function EditExam() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: exams, isLoading: isExamsLoading } = useQuery({
    queryKey: ["adminExams"],
    queryFn: () => adminApi.getExams().then(res => res.data),
  });

  const exam = exams?.find((e: any) => e.id === id);

  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: "",
      duration: 60,
      passing_score: 40,
      start_time: "",
      end_time: "",
      is_published: false
    }
  });

  useEffect(() => {
    if (exam) {
      reset({
        title: exam.title,
        duration: exam.duration,
        passing_score: exam.passing_score,
        start_time: new Date(exam.start_time).toISOString().slice(0, 16),
        end_time: new Date(exam.end_time).toISOString().slice(0, 16),
        is_published: exam.is_published === 1 || exam.is_published === true
      });
    }
  }, [exam, reset]);

  const isPublished = watch("is_published");
  const title = watch("title");

  const getInferredTopic = (text: string) => {
    if (!text) return "Awaiting input...";
    const keywords = ["python", "java", "react", "node", "sql", "css", "html", "javascript"];
    const found = keywords.find(k => text.toLowerCase().includes(k));
    return found ? found.charAt(0).toUpperCase() + found.slice(1) : "General Assessment";
  };

  const mutation = useMutation({
    mutationFn: (data: any) => adminApi.updateExam(id as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminExams"] });
      toast.success("Assessment configuration updated successfully");
      router.push("/admin/exams");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update assessment");
    }
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  if (isExamsLoading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="animate-spin text-brand-indigo" size={40} />
            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Retrieving Configuration...</p>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 font-body selection:bg-brand-indigo/10">
      <div className="flex items-center justify-between">
        <Link 
            href="/admin/exams" 
            className="flex items-center gap-2 text-sm font-black text-muted-foreground hover:text-brand-purple transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Inventory
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-brand-purple/10 rounded-2xl text-brand-purple">
                 <Settings size={24} />
              </div>
              <span className="text-xs font-black text-brand-purple uppercase tracking-[0.2em]">Module Settings</span>
           </div>
            <h1 className="text-4xl font-heading font-black tracking-tight leading-tight">Edit Assessment</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-border space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5">
                <Sparkles size={120} />
            </div>

            <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">General Information</label>
                    {title && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-2 px-3 py-1 bg-brand-indigo/5 border border-brand-indigo/10 rounded-full"
                        >
                            <Sparkles size={12} className="text-brand-indigo" />
                            <span className="text-[10px] font-bold text-brand-indigo uppercase tracking-wider">Auto-Categorized: {getInferredTopic(title)}</span>
                        </motion.div>
                    )}
                </div>
                <input 
                    type="text" 
                    {...register("title")}
                    placeholder="Enter assessment title..."
                    className={`w-full text-2xl font-heading font-bold bg-transparent border-b-2 outline-none py-3 transition-all placeholder:text-slate-200 ${errors.title ? "border-red-500" : "border-slate-100 focus:border-brand-indigo"}`}
                />
                {errors.title && <p className="text-xs font-bold text-red-500 mt-2">{errors.title.message as string}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                {/* Left Column */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <Clock size={14} className="text-brand-indigo" /> Time (Min)
                            </label>
                            <input 
                                type="number" 
                                {...register("duration")}
                                className="w-full px-5 py-3 bg-slate-50 border border-border rounded-2xl font-bold focus:ring-4 ring-brand-indigo/10 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <Trophy size={14} className="text-brand-emerald" /> Pass (%)
                            </label>
                            <input 
                                type="number" 
                                {...register("passing_score")}
                                className="w-full px-5 py-3 bg-slate-50 border border-border rounded-2xl font-bold focus:ring-4 ring-brand-indigo/10 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <CalendarDays size={14} className="text-brand-purple" /> Start Date
                        </label>
                        <input 
                            type="datetime-local" 
                            {...register("start_time")}
                            className={`w-full px-5 py-3 bg-slate-50 border rounded-2xl font-bold focus:ring-4 ring-brand-indigo/10 outline-none transition-all ${errors.start_time ? "border-red-500" : "border-border"}`}
                        />
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <Hourglass size={14} className="text-brand-pink" /> End Date
                        </label>
                        <input 
                            type="datetime-local" 
                            {...register("end_time")}
                            className={`w-full px-5 py-3 bg-slate-50 border rounded-2xl font-bold focus:ring-4 ring-brand-indigo/10 outline-none transition-all ${errors.end_time ? "border-red-500" : "border-border"}`}
                        />
                        {errors.end_time && <p className="text-[10px] font-bold text-red-500">{errors.end_time.message as string}</p>}
                    </div>

                    {/* Status Toggle moved here to fill the gap better or kept in its own section */}
                    <div className="p-6 bg-brand-indigo/[0.03] rounded-[32px] border border-brand-indigo/10 flex flex-col items-start justify-between h-full min-h-[140px]">
                        <div className="flex items-start gap-3">
                            <div className={`p-3 rounded-xl ${isPublished ? "bg-brand-emerald text-white" : "bg-slate-200 text-slate-500"}`}>
                                {isPublished ? <Globe size={20} /> : <Lock size={20} />}
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-900 leading-tight">Live Status</p>
                                <p className="text-[10px] text-muted-foreground mt-1 font-medium">Toggle candidate visibility.</p>
                            </div>
                        </div>
                        <button 
                            type="button"
                            onClick={() => setValue("is_published", !isPublished)}
                            className={`relative w-14 h-7 rounded-full transition-colors duration-300 self-end ${isPublished ? "bg-brand-indigo" : "bg-slate-300"}`}
                        >
                            <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${isPublished ? "translate-x-7" : ""}`} />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
            <button 
                type="submit"
                disabled={mutation.isPending}
                className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
            >
                {mutation.isPending ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                Save Changes
            </button>
            <Link 
                href="/admin/exams"
                className="flex-1 py-4 bg-white border border-border rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-slate-50 transition-all text-muted-foreground"
            >
                Cancel
            </Link>
        </div>
      </form>
    </div>
  );
}
