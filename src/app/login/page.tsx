"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/auth.service";
import {
  ShieldCheck,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Layers,
  UploadCloud,
  ArrowRightLeft,
  KeyRound,
  CheckCircle2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect straight to dashboard
  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      router.replace("/");
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = identifier.trim();
    if (!cleanId) {
      setError("Please enter your username or email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      AuthService.login(cleanId, password);
      router.replace("/");
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please check credentials.");
      setIsLoading(false);
    }
  };

  const handleFillDemo = (emailVal: string, passVal: string) => {
    setIdentifier(emailVal);
    setPassword(passVal);
    setError(null);
  };

  return (
    <div className="flex min-h-screen w-full bg-white font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* LEFT PANEL - Exact MMC Visual Styling */}
      <div className="hidden lg:flex lg:w-[55%] flex-col justify-between p-8 xl:p-12 relative overflow-hidden border-r border-slate-200 bg-[url('/login.webp')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-slate-900/80 backdrop-blur-[1px] pointer-events-none" />
        <div className="absolute top-0 left-0 w-[450px] h-[450px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-sky-400/20 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 my-auto max-w-lg py-6 space-y-6">
          <div className="space-y-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/25 border border-blue-300/30 text-blue-100 text-[11px] font-bold backdrop-blur-md">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-300" />
              Maruthi Motors Official Portal
            </span>
            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-[1.15]">
              Dealership Inventory & Yard Hub, organized.
            </h1>
            <p className="text-xs xl:text-sm text-blue-100/90 leading-relaxed font-medium">
              Complete physical unit verification, Yamaha dispatch invoice imports, storage bay allocations, inter-branch stock transfers, and gate pass handovers.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="rounded-xl bg-white/15 border border-white/20 p-3 space-y-1 shadow-sm backdrop-blur-md">
              <Layers className="h-4 w-4 text-blue-300" />
              <h3 className="text-xs font-bold text-white">Live Stock Yard</h3>
              <p className="text-[10px] text-blue-100/80 font-medium">Chassis tracking & bays.</p>
            </div>

            <div className="rounded-xl bg-white/15 border border-white/20 p-3 space-y-1 shadow-sm backdrop-blur-md">
              <UploadCloud className="h-4 w-4 text-blue-300" />
              <h3 className="text-xs font-bold text-white">Factory Inward</h3>
              <p className="text-[10px] text-blue-100/80 font-medium">Yamaha dispatch sheets.</p>
            </div>

            <div className="rounded-xl bg-white/15 border border-white/20 p-3 space-y-1 shadow-sm backdrop-blur-md">
              <ArrowRightLeft className="h-4 w-4 text-blue-300" />
              <h3 className="text-xs font-bold text-white">Transfers & Sales</h3>
              <p className="text-[10px] text-blue-100/80 font-medium">Showrooms & gate pass.</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-2 text-[11px] text-blue-200/80 font-medium">
          Built for Yamaha dealership operations across Tirupattur, Tamil Nadu.
        </div>
      </div>

      {/* RIGHT PANEL - Unified Single Login Form */}
      <div className="flex flex-1 flex-col justify-between bg-white text-slate-900 p-6 sm:p-10 lg:p-12 xl:p-14 min-h-screen">
        <div className="w-full max-w-sm mx-auto pt-2 flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="Maruthi Motors Yamaha"
            width={240}
            height={60}
            className="h-11 sm:h-12 w-auto object-contain"
            priority
          />
        </div>

        <div className="w-full max-w-sm mx-auto my-auto py-6 space-y-6">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Sign In
            </h2>
            <p className="text-xs font-medium text-slate-500">
              Enter your credentials to access the inventory and yard management dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl animate-in fade-in duration-200">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  USERNAME OR EMAIL
                </label>
                {identifier.length > 0 && (
                  <span className="text-[10px] font-mono font-medium text-slate-400">
                    {identifier.length}/64
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  maxLength={64}
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value.toLowerCase().slice(0, 64));
                    if (error) setError(null);
                  }}
                  placeholder="admin@maruthimotors.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-3.5 py-3 text-xs text-slate-900 font-medium lowercase placeholder:normal-case placeholder-slate-400 transition-all focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  PASSWORD
                </label>
                {password.length > 0 && (
                  <span className="text-[10px] font-mono font-medium text-slate-400">
                    {password.length}/64
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  maxLength={64}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value.slice(0, 64));
                    if (error) setError(null);
                  }}
                  placeholder="Enter password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-10 py-3 text-xs text-slate-900 font-medium placeholder-slate-400 transition-all focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-3.5 px-5 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition-all duration-200 active:scale-[0.99] disabled:opacity-75 mt-2 cursor-pointer"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Inventory</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Hardcoded Credentials Helper Card */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-blue-600" />
                Dealership Authorized Credentials
              </span>
              <span className="text-[10px] font-bold text-blue-600 uppercase">Authorized Access</span>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-600">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800">Admin: </span>
                  <code className="text-blue-700 font-mono">admin@maruthimotors.com</code> / <code className="text-slate-600 font-mono">admin123</code>
                </div>
                <button
                  type="button"
                  onClick={() => handleFillDemo("admin@maruthimotors.com", "admin123")}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                >
                  Auto-fill
                </button>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800">Manager: </span>
                  <code className="text-blue-700 font-mono">inventory@maruthimotors.com</code> / <code className="text-slate-600 font-mono">mmc123</code>
                </div>
                <button
                  type="button"
                  onClick={() => handleFillDemo("inventory@maruthimotors.com", "mmc123")}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                >
                  Auto-fill
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-sm mx-auto pb-4 text-center">
          <p className="text-[11px] text-slate-400 font-medium">
            Authorized Personnel Only • Maruthi Motors Yamaha Dealership
          </p>
        </div>
      </div>
    </div>
  );
}

