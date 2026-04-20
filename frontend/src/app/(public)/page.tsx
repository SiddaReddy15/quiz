"use client";

import { 
    CheckCircle, Shield, BarChart3, Clock, Rocket, ArrowRight, 
    GraduationCap, Terminal, Layout, Users, FileText, Activity, 
    Zap, Globe, MousePointer2, Database
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { publicApi } from "@/services/api";

export default function Home() {
  const [stats, setStats] = useState({
    enrolled: "0",
    accuracy: "0",
    uptime: "100",
    automated: "0"
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await publicApi.getPlatformStats();
        const data = response.data;
        setStats({
            enrolled: data.enrolled >= 1000 ? `${(data.enrolled / 1000).toFixed(1)}K+` : `${data.enrolled}+`,
            accuracy: `${data.accuracy}%`,
            uptime: `${data.uptime}%`,
            automated: data.automated >= 1000 ? `${(data.automated / 1000).toFixed(1)}K+` : `${data.automated}+`,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };
    fetchStats();
  }, []);

  const features = [
    { title: "Online Exam Creation", description: "Intuitive drag-and-drop interfaces to build complex assessments in minutes.", icon: <FileText size={24} />, color: "text-primary", bg: "bg-primary/10" },
    { title: "Automated Grading", description: "Instant evaluation for MCQs and smart pattern matching for technical answers.", icon: <Zap size={24} />, color: "text-secondary", bg: "bg-secondary/10" },
    { title: "Real-Time Analytics", description: "Live monitoring of student progress with deep performance insights.", icon: <BarChart3 size={24} />, color: "text-accent", bg: "bg-accent/10" },
    { title: "Secure Authentication", description: "JWT-based session management and protected role-based access control.", icon: <Shield size={24} />, color: "text-success", bg: "bg-success/10" },
    { title: "Leaderboards & Rankings", description: "Competitive environments with precise ranking logic based on score and time.", icon: <Activity size={24} />, color: "text-warning", bg: "bg-warning/10" },
    { title: "Coding Assessments", description: "Integrated Monaco Editor for real-world programming and logic testing.", icon: <Terminal size={24} />, color: "text-textSecondary", bg: "bg-slate-100" },
  ];

  const steps = [
    { title: "Create an Exam", desc: "Design your assessment with various question types and timing rules." },
    { title: "Invite Students", desc: "Enroll candidates through our secure student registry system." },
    { title: "Conduct the Test", desc: "Administer exams in a controlled, live-monitored digital environment." },
    { title: "Analyze Results", desc: "Get comprehensive metrics and automated reports instantly." },
  ];

  return (
    <div className="min-h-screen bg-background font-body text-textPrimary">
      {/* Hero Section */}
      <section className="relative pt-0 pb-12 lg:pb-16 overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container px-6 mx-auto">
          <div className="flex flex-col lg:flex-row items-start gap-16 pt-12 lg:pt-16">
            <div className="flex-1 text-center lg:text-left">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-indigo/5 border border-brand-indigo/10 text-brand-indigo text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-sm"
              >
                <div className="w-2 h-2 rounded-full bg-brand-indigo animate-ping" />
                The Future of Academic Assessments
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl lg:text-7xl font-heading font-black tracking-tight leading-[1.1] mb-8 text-textPrimary"
              >
                Transforming <span className="bg-clip-text text-transparent bg-primary-gradient">Digital</span> Assessments
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-textSecondary font-medium mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
              >
                Conduct secure and intelligent online examinations with real-time analytics, automated grading, and premium student management capabilities.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              >
                <Link href="/register" className="w-full sm:w-auto px-8 py-5 bg-primary-gradient text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                  Get Started Now <ArrowRight size={20} />
                </Link>
                <Link href="/#features" className="w-full sm:w-auto px-8 py-5 bg-surface border-2 border-border text-textSecondary rounded-2xl font-black text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm">
                  Explore Features
                </Link>
              </motion.div>
            </div>
            <div className="flex-1 relative">
                <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1 }}
                    className="relative z-10 p-4 bg-surface rounded-[40px] shadow-soft border border-border"
                >
                    <img 
                        src="/hero.png" 
                        alt="Student writing exam on ExamPro" 
                        className="rounded-[32px] w-full object-cover aspect-[16/10]"
                    />
                </motion.div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-brand-indigo/10 blur-[120px] rounded-full -z-10 animate-pulse" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/20 blur-[60px] rounded-full -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="pt-24 pb-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-background to-transparent" />
        <div className="absolute -left-20 top-40 w-80 h-80 bg-brand-indigo/5 blur-[100px] rounded-full" />
        <div className="absolute -right-20 bottom-0 w-96 h-96 bg-brand-purple/5 blur-[120px] rounded-full" />
        <div className="container px-6 mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl lg:text-5xl font-heading font-black mb-6 text-textPrimary tracking-tighter uppercase">Engineered for Excellence</h2>
            <p className="text-textSecondary font-medium text-lg leading-relaxed">
              Our platform combines cutting-edge technology with intuitive design to provide an unparalleled examination experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="p-10 bg-surface rounded-[40px] shadow-soft border border-border group transition-all"
              >
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-black font-heading tracking-tight mb-4 text-textPrimary">{feature.title}</h3>
                <p className="text-textSecondary font-medium leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="pt-24 pb-32 overflow-hidden bg-brand-indigo/[0.02] relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-purple/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="container px-6 mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1">
                <h2 className="text-4xl lg:text-5xl font-heading font-black mb-12 text-textPrimary leading-[1.1]">How ExamPro <br /> Simplifies Everything</h2>
                <div className="space-y-10">
                    {steps.map((step, i) => (
                        <div key={i} className="flex gap-6 items-start group">
                            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-textPrimary text-white flex items-center justify-center font-black text-xl shadow-lg transition-transform group-hover:bg-primary">
                                {i + 1}
                            </div>
                            <div>
                                <h4 className="text-xl font-black font-heading mb-2 text-textPrimary">{step.title}</h4>
                                <p className="text-textSecondary font-medium leading-relaxed">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex-1 bg-slate-50 p-12 rounded-[50px] border border-border mt-12 lg:mt-0">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-8 bg-surface rounded-[32px] shadow-soft border border-border flex flex-col items-center text-center">
                        <Users size={32} className="text-accent mb-4" />
                        <div className="text-xs font-black uppercase tracking-widest text-textSecondary">Enrolled</div>
                        <div className="text-3xl font-black mt-1 text-textPrimary">{stats.enrolled}</div>
                    </div>
                    <div className="p-8 bg-surface rounded-[32px] shadow-soft border border-border flex flex-col items-center text-center translate-y-8">
                        <BarChart3 size={32} className="text-success mb-4" />
                        <div className="text-xs font-black uppercase tracking-widest text-textSecondary">Accuracy</div>
                        <div className="text-3xl font-black mt-1 text-textPrimary">{stats.accuracy}</div>
                    </div>
                    <div className="p-8 bg-surface rounded-[32px] shadow-soft border border-border flex flex-col items-center text-center">
                        <Globe size={32} className="text-primary mb-4" />
                        <div className="text-xs font-black uppercase tracking-widest text-textSecondary">Uptime</div>
                        <div className="text-3xl font-black mt-1 text-textPrimary">{stats.uptime}</div>
                    </div>
                    <div className="p-8 bg-surface rounded-[32px] shadow-soft border border-border flex flex-col items-center text-center translate-y-8">
                        <Zap size={32} className="text-secondary mb-4" />
                        <div className="text-xs font-black uppercase tracking-widest text-textSecondary">Automated</div>
                        <div className="text-3xl font-black mt-1 text-textPrimary">{stats.automated}</div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-24 bg-surface border-y border-border relative overflow-hidden">
        <div className="container px-6 mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-6xl font-heading font-black mb-10 leading-tight text-textPrimary">
              Innovating the Future of{" "}
              <span className="bg-clip-text text-transparent bg-primary-gradient">
                Digital Assessment
              </span>
            </h2>
            <p className="text-lg md:text-xl text-textSecondary font-medium leading-relaxed mb-12">
              ExamPro is a professional SaaS-based assessment ecosystem designed to transform traditional examinations into seamless, secure, and intelligent digital experiences. By merging high-performance engineering with user-centric design, we provide a reliable platform for institutions, educators, and learners who value efficiency, scalability, and academic integrity.
            </p>
            <Link 
              href="/about" 
              className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs hover:gap-3 transition-all"
            >
              Learn More About Our Mission <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>


      {/* CTA Section */}
      <section id="contact" className="py-32 bg-background">
        <div className="container px-6 mx-auto">
          <div className="bg-primary-gradient rounded-[50px] p-12 lg:p-24 text-center text-white relative overflow-hidden shadow-xl shadow-primary/30">
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            <motion.div 
               whileInView={{ scale: [0.9, 1], opacity: [0, 1] }}
               className="relative z-10"
            >
                <h2 className="text-4xl lg:text-6xl font-heading font-black mb-10 text-white">Start Your Digital Examination Journey Today</h2>
                <Link href="/register" className="inline-flex items-center gap-3 px-12 py-6 bg-surface text-primary rounded-[24px] font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-soft">
                  Get Started Free <ArrowRight size={24} />
                </Link>
                <p className="mt-8 text-sm opacity-60 font-black uppercase tracking-widest text-white">No credit card required. Cancel anytime.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-border bg-background">
        <div className="container px-6 mx-auto">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-20">
                <div className="max-w-xs transition-all hover:translate-x-1">
                    <Link href="/" className="flex items-center gap-3 mb-6 group">
                        <div className="w-8 h-8 bg-white rounded-lg group-hover:scale-110 transition-transform shadow-sm border border-slate-100 overflow-hidden flex items-center justify-center">
                            <img src="/logo.png" alt="ExamPro Logo" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xl font-heading font-black text-textPrimary tracking-tight">
                            ExamPro
                        </span>
                    </Link>
                    <p className="text-sm text-textSecondary font-medium leading-relaxed">
                        The ultimate solution for professional digital assessments and student performance monitoring.
                    </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 lg:gap-24">
                    <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-textPrimary border-b-2 border-primary w-fit pb-1">Platform</h4>
                        <div className="flex flex-col gap-3">
                            <Link href="/#features" className="text-sm font-bold text-textSecondary hover:text-primary transition-colors">Features</Link>
                            <Link href="/about" className="text-sm font-bold text-textSecondary hover:text-primary transition-colors">About Us</Link>
                            <Link href="/register" className="text-sm font-bold text-textSecondary hover:text-primary transition-colors">Register</Link>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-textPrimary border-b-2 border-secondary w-fit pb-1">Support</h4>
                        <div className="flex flex-col gap-3">
                            <Link href="/#contact" className="text-sm font-bold text-textSecondary hover:text-primary transition-colors">Contact</Link>
                            <Link href="/help-center" className="text-sm font-bold text-textSecondary hover:text-primary transition-colors">Help Center</Link>
                            <Link href="/login" className="text-sm font-bold text-textSecondary hover:text-primary transition-colors">Login</Link>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-border pt-10">
                <p className="text-xs font-black text-textSecondary uppercase tracking-widest text-textSecondary">© 2026 Admin. All rights reserved.</p>
                <div className="flex items-center gap-8">
                    <Link href="#" className="text-[10px] font-black text-textSecondary uppercase tracking-widest hover:text-primary">Privacy Policy</Link>
                    <Link href="#" className="text-[10px] font-black text-textSecondary uppercase tracking-widest hover:text-primary">Terms of Service</Link>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}
