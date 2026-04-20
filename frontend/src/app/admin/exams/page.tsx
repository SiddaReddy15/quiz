"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/services/api";
import { 
    Plus, Search, Filter, MoreVertical, Edit2, Trash2, Eye, EyeOff, HelpCircle,
    Calendar, Clock, CheckCircle2, AlertCircle, ExternalLink, GraduationCap, LayoutDashboard 
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

export default function ExamManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const { data: categories } = useQuery({
    queryKey: ["adminCategories"],
    queryFn: () => adminApi.getCategories().then(res => res.data),
  });

  const { data: exams, isLoading } = useQuery({
    queryKey: ["adminExams", filterStatus],
    queryFn: () => adminApi.getExams().then(res => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteExam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminExams"] });
      toast.success("Assessment deleted permanently");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Deletion failed");
    }
  });

  const handlePublish = (id: string, currentStatus: boolean) => {
    const action = !currentStatus ? 'publish' : 'unpublish';
    
    toast.promise(
        adminApi.publishExam(id, !currentStatus),
        {
            loading: `${action === 'publish' ? 'Launching' : 'Hiding'} assessment...`,
            success: () => {
                queryClient.invalidateQueries({ queryKey: ["adminExams"] });
                return `Assessment ${action === 'publish' ? 'is now LIVE' : 'has been unpublished'}`;
            },
            error: (err) => err.response?.data?.message || `Failed to ${action} assessment`
        }
    );
  };

  const handleDelete = (id: string) => {
    if (window.confirm("CRITICAL ACTION: Are you sure you want to delete this assessment? This action will permanently remove all associated questions and student submissions.")) {
        deleteMutation.mutate(id);
    }
  };

  const filteredExams = exams?.filter((exam: any) => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         exam.category_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || 
                         (filterStatus === "PUBLISHED" && exam.is_published) || 
                         (filterStatus === "DRAFT" && !exam.is_published);
    return matchesSearch && matchesStatus;
  });



  return (
    <div className="space-y-12 font-body selection:bg-brand-indigo/10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-heading font-black tracking-tight mb-2">Assessment Ecosystem</h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            Manage your end-to-end technical evaluation pipeline.
          </p>
        </div>
        <Link 
          href="/admin/exams/create"
          className="inline-flex items-center gap-2 px-6 py-4 bg-primary-gradient text-white rounded-[20px] font-black shadow-xl shadow-brand-indigo/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={20} />
          Launch New Module
        </Link>
      </div>



      <div className="bg-white p-4 rounded-[32px] border border-border flex flex-col md:flex-row gap-4 shadow-sm">
        <div className="flex-1 relative flex items-center">
            <Search className="absolute left-4 text-muted-foreground" size={18} />
            <input 
                type="text" 
                placeholder="Search assessments by title or repository..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 ring-brand-indigo/20 focus:bg-white transition-all font-bold text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="flex gap-2">
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50">
                {["ALL", "PUBLISHED", "DRAFT"].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${
                            filterStatus === status 
                                ? "bg-white text-brand-indigo shadow-sm" 
                                : "text-muted-foreground hover:bg-white/50"
                        }`}
                    >
                        {status}
                    </button>
                ))}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
        {isLoading ? (
            [1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 bg-white rounded-[32px] animate-pulse border border-border" />
            ))
        ) : filteredExams?.map((exam: any, idx: number) => (
          <motion.div 
            key={exam.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="group bg-white rounded-[32px] border border-border p-8 hover:shadow-2xl hover:border-brand-indigo/20 transition-all duration-300 relative overflow-hidden flex flex-col"
          >
            <div className="flex justify-between items-start mb-6">
                <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                    exam.is_published 
                        ? "bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20" 
                        : "bg-brand-orange/10 text-brand-orange border border-brand-orange/20"
                }`}>
                    {exam.is_published ? "Live / Published" : "Draft Mode"}
                </div>
                <div className="relative">
                    <button className="p-2 text-muted-foreground hover:bg-slate-50 rounded-lg transition-colors">
                        <MoreVertical size={18} />
                    </button>
                </div>
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
                        <CheckCircle2 size={12} /> Pass Mark
                    </div>
                    <div className="text-lg font-black">{exam.passing_score}%</div>
                </div>
            </div>

            <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                    <Calendar size={14} className="text-brand-indigo" />
                    <span>Created: {new Date(exam.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                    <GraduationCap size={14} className="text-brand-purple" />
                    <span>Last modified: Today</span>
                </div>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100 grid grid-cols-2 gap-3">
                <Link 
                    href={`/admin/exams/${exam.id}/questions`}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-brand-indigo/5 text-brand-indigo rounded-2xl text-[10px] font-black hover:bg-brand-indigo hover:text-white transition-all hover:shadow-lg hover:shadow-brand-indigo/20"
                >
                    <HelpCircle size={14} /> Questions
                </Link>
                <Link 
                    href={`/admin/exams/edit/${exam.id}`}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-border rounded-2xl text-[10px] font-black hover:bg-slate-50 transition-all"
                >
                    <Edit2 size={14} /> Settings
                </Link>
            </div>
            
            <div className="mt-4 flex gap-3">
                <button 
                  onClick={() => handlePublish(exam.id, exam.is_published)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-[10px] font-black transition-all hover:scale-[1.02] ${
                    exam.is_published 
                        ? "bg-slate-900 text-white" 
                        : "bg-brand-emerald text-white shadow-lg shadow-brand-emerald/20"
                  }`}
                >
                    {exam.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                    {exam.is_published ? "Unpublish" : "Go Live"}
                </button>
                <button 
                  onClick={() => handleDelete(exam.id)}
                  className="w-12 h-12 flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-2xl transition-all"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-[80px] opacity-10 transition-opacity duration-500 ${exam.is_published ? "bg-brand-emerald" : "bg-brand-orange"}`} />
          </motion.div>
        ))}
        
        {!isLoading && filteredExams?.length === 0 && (
            <div className="col-span-full py-32 bg-white rounded-[40px] border-2 border-dashed border-border flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                    <LayoutDashboard size={40} />
                </div>
                <h3 className="text-xl font-black font-heading mb-2">No assessments found</h3>
                <p className="text-muted-foreground font-medium max-w-sm">We couldn't find any results matching your search or filters. Try adjusting your criteria.</p>
            </div>
        )}
      </div>
    </div>
  );
}
