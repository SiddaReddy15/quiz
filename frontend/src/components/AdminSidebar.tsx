import { LayoutDashboard, FileText, Users, Settings, LogOut, GraduationCap, HelpCircle, BarChart3, Trophy } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminSidebar() {
  const { logout, user } = useAuth();
  const pathname = usePathname();

  const menuItems = [
    { title: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/admin/dashboard" },
    { title: "Exams", icon: <FileText size={20} />, href: "/admin/exams" },
    { title: "Questions", icon: <HelpCircle size={20} />, href: "/admin/questions" },
    { title: "Students", icon: <Users size={20} />, href: "/admin/students" },
    { title: "Results", icon: <BarChart3 size={20} />, href: "/admin/results" },
    { title: "Leaderboard", icon: <Trophy size={20} />, href: "/admin/leaderboard" },
    { title: "Settings", icon: <Settings size={20} />, href: "/admin/settings" },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-border flex flex-col fixed left-0 top-0 z-40">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden flex items-center justify-center">
             <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-heading font-black text-slate-800 tracking-tight">
            ExamPro
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-indigo/10 text-brand-indigo">ADMIN</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.title}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? "bg-brand-indigo text-white shadow-lg shadow-brand-indigo/20" 
                  : "text-muted-foreground hover:bg-brand-indigo/5 hover:text-brand-indigo"
              }`}
            >
              <div className={`${isActive ? "text-white" : "text-muted-foreground group-hover:text-brand-indigo"}`}>
                {item.icon}
              </div>
              <span className="font-semibold text-sm">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="p-4 bg-slate-50 rounded-2xl border border-border mb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-full bg-brand-purple/20 flex items-center justify-center text-brand-purple font-bold text-xs">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold truncate">{user?.name || "Admin"}</div>
              <div className="text-[10px] text-muted-foreground truncate">{user?.email || "admin@exampro.com"}</div>
            </div>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 w-full rounded-xl transition-all duration-200 font-semibold text-sm"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
