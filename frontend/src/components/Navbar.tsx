"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import ProfileDropdown from "@/components/ProfileDropdown";

export const Navbar = () => {
  const { user } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { label: "HOME", href: "/" },
    { label: "FEATURES", href: "/#features" },
    { label: "ABOUT", href: "/about" },
    { label: "CONTACT", href: "/#contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl shadow-sm overflow-hidden flex items-center justify-center">
            <img src="/logo.png" alt="ExamPro Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-white text-2xl font-bold tracking-tight">ExamPro</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-white font-medium">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors ${
                  isActive
                    ? "border-b-2 border-white"
                    : "hover:text-gray-200"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          {user ? (
            <ProfileDropdown />
          ) : (
            <>
              <Link
                href="/login"
                className="px-5 py-2 border border-white text-white rounded-lg hover:bg-white hover:text-indigo-600 transition"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="px-5 py-2 bg-white text-indigo-600 font-semibold rounded-lg shadow hover:bg-gray-100 transition"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
