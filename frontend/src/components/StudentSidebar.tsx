"use client";

import { 
    LayoutDashboard, FileText, Trophy, Settings, 
    LogOut, GraduationCap, Clock, HelpCircle 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function StudentSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/student/dashboard" },
    { icon: <FileText size={20} />, label: "Assessments", href: "/student/exams" },
    { icon: <Trophy size={20} />, label: "Leaderboard", href: "/student/leaderboard" },
    { icon: <Clock size={20} />, label: "My Results", href: "/student/results" },
    { icon: <Settings size={20} />, label: "Settings", href: "/student/settings" },
  ];

  return (
    <aside className="w-80 h-screen bg-white border-r border-slate-100 flex flex-col sticky top-0 font-body">
      <div className="p-10 flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-brand-indigo/10 border border-slate-100 overflow-hidden">
           <img src="/logo.png" alt="ExamPro Logo" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="text-2xl font-black font-heading tracking-tight">ExamPro</h1>
          <span className="text-[10px] uppercase tracking-widest font-black text-brand-indigo opacity-60">Candidate Portal</span>
        </div>
      </div>

      <nav className="flex-1 px-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.label} 
              href={item.href}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all duration-300 group ${
                isActive 
                  ? "bg-brand-indigo text-white shadow-lg shadow-brand-indigo/20" 
                  : "text-muted-foreground hover:bg-slate-50 hover:text-brand-indigo"
              }`}
            >
              <span className={`${isActive ? "text-white" : "text-brand-indigo group-hover:scale-110 transition-transform"}`}>
                {item.icon}
              </span>
              {item.label}
              {isActive && (
                <motion.div 
                    layoutId="active-pill"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-8 border-t border-slate-50">
        <div className="bg-slate-50 p-6 rounded-[32px] mb-6 flex items-center gap-4 border border-slate-100/50">
           <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center font-black text-brand-indigo shadow-sm border border-slate-100">
                {user?.name?.charAt(0)}
           </div>
           <div className="flex-1 min-w-0">
                <div className="font-black text-sm text-dark truncate">{user?.name}</div>
                <div className="text-[10px] font-bold text-muted-foreground truncate uppercase tracking-widest">{user?.role}</div>
           </div>
        </div>
        
        <button 
          onClick={logout}
          className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
