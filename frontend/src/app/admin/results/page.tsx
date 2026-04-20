"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/services/api";
import { Search, Filter, ChevronRight, CheckCircle2, XCircle, FileText, Calendar, User, Trophy } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

export default function AdminResults() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: results, isLoading } = useQuery({
    queryKey: ["adminResults"],
    queryFn: () => adminApi.getAllResults().then(res => res.data),
  });

  const filteredResults = results?.filter((r: any) => 
    r.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.exam_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 selection:bg-brand-indigo/20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-heading font-black tracking-tight mb-2">Submission Registry</h1>
          <p className="text-muted-foreground font-body font-medium">Tracking candidate performance and global assessment outcomes.</p>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-border shadow-sm w-full md:w-80">
                <Search size={18} className="text-muted-foreground" />
                <input 
                    type="text" 
                    placeholder="Search by student or exam..." 
                    className="bg-transparent border-none outline-none text-sm w-full font-bold"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button className="p-2.5 bg-white border border-border rounded-xl hover:bg-slate-50 transition shadow-sm text-muted-foreground">
                <Filter size={20} />
            </button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-border">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Candidate</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Assessment</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Outcome</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Timestamp</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-6"><div className="h-10 bg-slate-50 rounded-xl w-full" /></td>
                  </tr>
                ))
              ) : filteredResults?.map((res: any, i: number) => {
                const isPassed = res.score >= res.passing_score;
                return (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={res.id} 
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-brand-indigo/10 text-brand-indigo flex items-center justify-center font-black text-sm">
                          {res.student_name.charAt(0)}
                        </div>
                        <div className="font-bold text-slate-800">{res.student_name}</div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-bold text-slate-600">{res.exam_title}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1.5 rounded-full text-[10px] font-black flex items-center gap-2 ${isPassed ? "bg-brand-emerald/10 text-brand-emerald" : "bg-brand-orange/10 text-brand-orange"}`}>
                          {isPassed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {isPassed ? "PASSED" : "FAILED"}
                        </div>
                        <div className="text-sm font-black text-slate-400">{res.score} Pts</div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                        <Calendar size={14} />
                        {new Date(res.submit_time).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       {/* Analytics Removed */}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          
          {!isLoading && filteredResults?.length === 0 && (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                <FileText size={40} />
              </div>
              <h3 className="text-xl font-bold font-heading">No Records Identified</h3>
              <p className="text-muted-foreground font-medium">Try adjusting your search criteria or checking back later.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
