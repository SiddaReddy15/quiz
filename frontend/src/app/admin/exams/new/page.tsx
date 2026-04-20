"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { adminApi } from "@/services/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Loader2, Sparkles, Clock, Target, Calendar } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const examSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  passing_score: z.coerce.number().min(1, "Score must be at least 1%").max(100, "Score cannot exceed 100%"),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
});

export default function NewExam() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(examSchema),
    defaultValues: { 
      title: "",
      duration: 60, 
      passing_score: 40 
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await adminApi.createExam(data);
      router.push(`/admin/exams/${response.data.id}/questions`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <Link href="/admin/exams" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-brand-indigo mb-8 transition-colors group">
        <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-indigo/10 text-brand-indigo text-xs font-bold uppercase tracking-wider mb-3">
           <Sparkles size={14} />
           Smart Configuration
        </div>
        <h1 className="text-4xl font-heading font-extrabold tracking-tight mb-2">Create New Exam</h1>
        <p className="text-muted-foreground font-body">Set the foundation for your next assessment. Don't worry, you can always adjust these settings later.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-border"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-dark ml-1">Assessment Title</label>
            <input
              {...register("title")}
              className="w-full px-6 py-4 bg-slate-50 border border-border rounded-2xl focus:ring-4 focus:ring-brand-indigo/10 focus:border-brand-indigo outline-none transition-all font-heading font-bold text-lg"
              placeholder="e.g., JavaScript Advanced Concepts"
            />
            {errors.title && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.title.message as string}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-dark ml-1 flex items-center gap-2">
                 <Clock size={16} className="text-brand-indigo" />
                 Time Limit (Minutes)
              </label>
              <input
                type="number"
                {...register("duration")}
                className="w-full px-6 py-4 bg-slate-50 border border-border rounded-2xl focus:ring-4 focus:ring-brand-indigo/10 outline-none transition-all font-body"
              />
              <p className="text-[10px] text-muted-foreground ml-1">Recommended: 30-90 minutes</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-dark ml-1 flex items-center gap-2">
                 <Target size={16} className="text-brand-emerald" />
                 Passing Score (%)
              </label>
              <input
                type="number"
                {...register("passing_score")}
                className="w-full px-6 py-4 bg-slate-50 border border-border rounded-2xl focus:ring-4 focus:ring-brand-indigo/10 outline-none transition-all font-body"
              />
              <p className="text-[10px] text-muted-foreground ml-1">Typical standard: 40-70%</p>
            </div>
          </div>

          <div className="p-6 bg-brand-indigo/[0.03] rounded-3xl border border-brand-indigo/10">
             <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white border border-brand-indigo/10 flex items-center justify-center text-brand-indigo shrink-0">
                   <Calendar size={24} />
                </div>
                <div>
                   <h3 className="text-sm font-bold mb-1">Schedule & Availability</h3>
                   <p className="text-xs text-muted-foreground leading-relaxed">
                      By default, once published, the exam will be accessible to all registered students. Advanced scheduling features will be available in the next version.
                   </p>
                </div>
             </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-gradient text-white font-bold py-5 rounded-2xl shadow-xl shadow-brand-indigo/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
            Next: Build Question Flow
          </button>
        </form>
      </motion.div>
    </div>
  );
}
