"use client";

import { useQuery } from "@tanstack/react-query";
import { studentApi } from "@/services/api";
import { 
    Award, Clock, CheckCircle2, LayoutDashboard, 
    ArrowRight, TrendingUp, Calendar, Zap, Star
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function StudentDashboard() {
  const { user } = useAuth();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["studentDashboard"],
    queryFn: () => studentApi.getDashboard().then(res => res.data),
  });

  const stats = [
    { label: "Available Exams", value: dashboard?.summary?.totalAvailable || 0, icon: < Zap size={24} />, color: "text-brand-indigo", bg: "bg-brand-indigo/10" },
    { label: "Completed", value: dashboard?.summary?.completed || 0, icon: <CheckCircle2 size={24} />, color: "text-brand-emerald", bg: "bg-brand-emerald/10" },
    { label: "Latest Score", value: `${dashboard?.summary?.latestScore || 0}%`, icon: <TrendingUp size={24} />, color: "text-brand-purple", bg: "bg-brand-purple/10" },
    { label: "Your Rank", value: dashboard?.summary?.rank > 0 ? `#${dashboard.summary.rank}` : "#0", icon: <Star size={24} />, color: "text-brand-blue", bg: "bg-brand-blue/10" },
  ];

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-heading font-black tracking-tight mb-2">Welcome Back, {user?.name?.split(' ')[0] || 'Candidate'}</h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            Ready to prove your technical prowess?
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white p-3 rounded-[24px] border border-border shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-brand-indigo/10 flex items-center justify-center text-brand-indigo shadow-inner">
                <Calendar size={20} />
            </div>
            <div className="pr-6">
                <div className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Today's Date</div>
                <div className="text-sm font-bold">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label} 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[32px] shadow-sm border border-border group hover:shadow-2xl hover:border-brand-indigo/20 transition-all duration-300 relative overflow-hidden"
          >
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <div>
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-60">{stat.label}</div>
              <div className="text-3xl font-black text-dark tracking-tight">
                {isLoading ? <div className="h-9 w-16 bg-slate-50 animate-pulse rounded-lg" /> : stat.value}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
         >
            <div className="flex items-center justify-between px-2">
                <h2 className="text-2xl font-black font-heading tracking-tight">Latest Performance</h2>
                <Link href="/student/results" className="text-xs font-black text-brand-indigo flex items-center gap-1 hover:gap-2 transition-all uppercase tracking-widest">
                    View All Results <ArrowRight size={14} />
                </Link>
            </div>
            
            {dashboard?.latestExam ? (
                <div className="bg-white p-8 rounded-[40px] border border-border shadow-sm group hover:shadow-xl transition-all relative overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                        <div className="space-y-4 flex-1">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-brand-indigo/10 text-brand-indigo text-[10px] font-black uppercase tracking-widest rounded-lg">
                                    Recent Assessment
                                </span>
                                <span className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-1">
                                    <Clock size={12} /> {new Date(dashboard.latestExam.submit_time).toLocaleDateString()}
                                </span>
                            </div>
                            <h3 className="text-2xl font-black font-heading tracking-tight leading-tight">{dashboard.latestExam.exam_title}</h3>
                        </div>
                        <div className="text-center bg-slate-50 px-8 py-4 rounded-[24px] border border-slate-100">
                            <div className="text-[10px] font-black text-muted-foreground uppercase mb-1">Score Obtained</div>
                            <div className="text-4xl font-black text-brand-indigo">{dashboard.latestExam.score}%</div>
                        </div>
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-indigo/5 rounded-full blur-3xl" />
                </div>
            ) : (
                <div className="bg-white py-20 rounded-[40px] border border-dashed border-border flex flex-col items-center justify-center text-center">
                    <Award size={48} className="text-slate-200 mb-4" />
                    <p className="text-slate-400 font-bold">No assessments completed yet.</p>
                    <Link href="/student/exams" className="text-brand-indigo text-xs font-black uppercase mt-4 hover:underline">Start your first exam</Link>
                </div>
            )}
         </motion.div>

         <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
         >
            <h2 className="text-2xl font-black font-heading tracking-tight px-2">Action Center</h2>
            <div className="bg-primary-gradient p-8 rounded-[40px] text-white shadow-2xl shadow-brand-indigo/30 relative overflow-hidden group">
                <div className="relative z-10">
                    <h3 className="text-xl font-black mb-2">Technical Proficiency</h3>
                    <p className="text-sm text-white/80 font-medium mb-6">Complete more assessments to increase your rank and unlock certifications.</p>
                    <Link 
                        href="/student/exams"
                        className="inline-flex items-center gap-3 px-6 py-3 bg-white text-brand-indigo rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform"
                    >
                        Go to Assessments <Zap size={16} />
                    </Link>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
            </div>
         </motion.div>
      </div>
    </div>
  );
}
