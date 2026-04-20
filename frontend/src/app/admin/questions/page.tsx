"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
    Globe, Settings, Database, Cpu, Code2, 
    ArrowRight, BookOpen, Sparkles, Layers, Loader2, Plus
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/services/api";

export default function QuestionsLanding() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["adminCategories"],
    queryFn: () => adminApi.getCategories().then(res => res.data),
  });

  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("python") || n.includes("script")) return <Code2 className="text-emerald-500" />;
    if (n.includes("java")) return <Cpu className="text-red-500" />;
    if (n.includes("react") || n.includes("front")) return <Globe className="text-blue-500" />;
    if (n.includes("back") || n.includes("node")) return <Settings className="text-indigo-500" />;
    if (n.includes("data") || n.includes("sql")) return <Database className="text-purple-500" />;
    return <BookOpen className="text-slate-500" />;
  };

  const getColor = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("python")) return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (n.includes("java")) return "bg-red-50 text-red-600 border-red-100";
    if (n.includes("react")) return "bg-blue-50 text-blue-600 border-blue-100";
    if (n.includes("back")) return "bg-indigo-50 text-indigo-600 border-indigo-100";
    if (n.includes("data")) return "bg-purple-50 text-purple-600 border-purple-100";
    return "bg-slate-50 text-slate-600 border-slate-100";
  };

  return (
    <div className="space-y-12 pb-20 font-body">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-brand-indigo font-black text-[10px] uppercase tracking-widest mb-2">
            <Layers size={14} /> Knowledge Base
          </div>
          <h1 className="text-4xl font-heading font-black tracking-tight mb-2">Technical Repositories</h1>
          <p className="text-muted-foreground font-medium max-w-2xl">
            Access and manage centralized question banks across all core technical sectors. These repositories power your automated evaluation logic.
          </p>
        </div>
        <div className="flex items-center gap-4">
            <div className="bg-white px-6 py-4 rounded-[28px] border border-border flex items-center gap-4 shadow-sm">
                <div className="h-10 w-10 rounded-2xl bg-brand-indigo/10 flex items-center justify-center text-brand-indigo">
                    <Sparkles size={20} />
                </div>
                <div>
                    <div className="text-xs font-black">{categories?.length || 0} Repositories</div>
                    <div className="text-[10px] font-bold text-muted-foreground">Automated Sync Active</div>
                </div>
            </div>
            <Link 
                href="/admin/exams/create"
                className="flex items-center gap-2 px-6 py-4 bg-primary-gradient text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-indigo/20 hover:scale-105 active:scale-95 transition-all"
            >
                <Plus size={16} />
                Launch New Module
            </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="animate-spin text-brand-indigo" size={40} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Repositories...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories?.map((repo: any, idx: number) => (
            <motion.div
              key={repo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link 
                href={`/admin/questions/${repo.slug}`}
                className="group block h-full bg-white rounded-[40px] border border-border p-10 hover:shadow-2xl hover:border-brand-indigo/30 transition-all duration-300 relative overflow-hidden"
              >
                <div className={`w-16 h-16 rounded-[24px] ${getColor(repo.name).split(' ')[0]} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                  {getIcon(repo.name)}
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-black font-heading tracking-tight group-hover:text-brand-indigo transition-colors">
                      {repo.name}
                  </h3>
                  <p className="text-muted-foreground font-medium text-sm leading-relaxed line-clamp-2">
                      Centralized repository for {repo.name} related technical assessments and automated evaluation logic.
                  </p>
                </div>

                <div className="mt-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Manage Repository</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-brand-indigo group-hover:text-white transition-all">
                      <ArrowRight size={18} />
                  </div>
                </div>

                {/* Decorative detail */}
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <BookOpen size={120} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

