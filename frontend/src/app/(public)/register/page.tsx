"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Loader2, GraduationCap, Mail, Lock, User, ArrowLeft, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useEffect } from "react";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["STUDENT", "ADMIN"]),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser, user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "STUDENT"
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError("");
    try {
      await registerUser(data.name, data.email, data.password, data.role);
      toast.success("Account created successfully! Welcome to ExamPro.");
      // redirection is handled by the useEffect once user state updates
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
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
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-brand-indigo mb-6 transition-colors font-semibold group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to home
        </Link>

        <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-border p-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-gradient rounded-2xl text-white mb-6 shadow-xl shadow-brand-indigo/20">
              <GraduationCap size={32} />
            </div>
            <h1 className="text-4xl font-heading font-extrabold tracking-tight mb-2">Create Account</h1>
            <p className="text-muted-foreground font-body text-sm">Join ExamPro to start assessing or learning.</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl mb-6 text-sm font-medium flex items-center gap-2"
            >
              <div className="w-1 h-4 bg-red-600 rounded-full" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-dark ml-1">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-brand-indigo transition-colors">
                    <User size={16} />
                  </div>
                  <input
                    {...register("name")}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-border rounded-xl focus:ring-4 focus:ring-brand-indigo/10 focus:border-brand-indigo outline-none transition-all font-body text-sm"
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.name.message as string}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-dark ml-1">Account Role</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-brand-indigo transition-colors">
                    <ShieldCheck size={16} />
                  </div>
                  <select
                    {...register("role")}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-border rounded-xl focus:ring-4 focus:ring-brand-indigo/10 focus:border-brand-indigo outline-none transition-all font-body text-sm appearance-none"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-dark ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-brand-indigo transition-colors">
                  <Mail size={16} />
                </div>
                <input
                  {...register("email")}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-border rounded-xl focus:ring-4 focus:ring-brand-indigo/10 focus:border-brand-indigo outline-none transition-all font-body text-sm"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.email.message as string}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-dark ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-brand-indigo transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  {...register("password")}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-border rounded-xl focus:ring-4 focus:ring-brand-indigo/10 focus:border-brand-indigo outline-none transition-all font-body text-sm"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.password.message as string}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-gradient text-white font-bold py-4 rounded-2xl shadow-xl shadow-brand-indigo/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center disabled:opacity-70 mt-6"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Create Account"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-center text-sm text-muted-foreground font-body">
              Already have an account?{" "}
              <Link href="/login" className="text-brand-indigo font-extrabold hover:underline">
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
