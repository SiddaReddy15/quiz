"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authApi } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, GraduationCap, Mail, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      if (user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/student/dashboard");
      }
    }
  }, [user, router]);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError("");
    try {
      await login(data.email, data.password);
      toast.success("Welcome back!");
    } catch (err: any) {
      console.error("Login error:", err);
      if (!err.response) {
        setError("Network error: Cannot connect to server. Please ensure backend is running.");
      } else {
        setError(err.response.data?.message || "Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-4">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-indigo/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-purple/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg relative z-10"
      >
         <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-brand-indigo mb-8 transition-colors font-semibold group">
           <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
           Back to home
         </Link>

        <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-border p-10 md:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-gradient rounded-2xl text-white mb-6 shadow-xl shadow-brand-indigo/20">
              <GraduationCap size={32} />
            </div>
            <h1 className="text-4xl font-heading font-extrabold tracking-tight mb-2">Welcome Back</h1>
            <p className="text-muted-foreground font-body">Sign in to continue your learning journey.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl mb-8 text-sm font-medium flex items-center gap-2"
            >
              <div className="w-1 h-4 bg-red-600 rounded-full" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-dark ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-brand-indigo transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  {...register("email")}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-border rounded-2xl focus:ring-4 focus:ring-brand-indigo/10 focus:border-brand-indigo outline-none transition-all font-body"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.email.message as string}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-dark ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-brand-indigo transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-border rounded-2xl focus:ring-4 focus:ring-brand-indigo/10 focus:border-brand-indigo outline-none transition-all font-body"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-brand-indigo transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-between items-center px-1">
                {errors.password ? (
                  <p className="text-red-500 text-xs font-bold">{errors.password.message as string}</p>
                ) : <div />}
                <button 
                  type="button"
                  onClick={() => toast.info("Please contact your administrator to reset your password.")}
                  className="text-xs font-bold text-brand-indigo hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-gradient text-white font-bold py-4 rounded-2xl shadow-xl shadow-brand-indigo/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center disabled:opacity-70 mt-4 disabled:hover:scale-100"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Sign In to ExamPro"}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-center text-sm text-muted-foreground font-body">
              New to ExamPro?{" "}
              <Link href="/register" className="text-brand-indigo font-extrabold hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
