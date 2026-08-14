import { useAuth } from "@/_core/hooks/useAuth";
import { AppNavigation } from "@/components/AppNavigation";
import { Button } from "@/components/ui/button";
import { LoaderCircle, LockKeyhole } from "lucide-react";
import React from "react";
import { useLocation } from "wouter";
import Home from "./Home";

export default function DashboardAccess() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) return <main className="min-h-screen bg-slate-50"><AppNavigation /><div className="flex min-h-[calc(100vh-72px)] items-center justify-center"><LoaderCircle className="h-6 w-6 animate-spin text-blue-600" aria-label="Loading dashboard" /></div></main>;
  if (!isAuthenticated) return <main className="min-h-screen bg-slate-50"><AppNavigation /><div className="flex min-h-[calc(100vh-72px)] items-center justify-center p-6"><section className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm"><LockKeyhole className="mx-auto h-7 w-7 text-blue-600" aria-hidden="true" /><h1 className="mt-4 text-xl font-black text-slate-950">Sign in to open your dashboard</h1><p className="mt-2 text-sm leading-6 text-slate-600">Your saved ideas and venture workspaces are private to your account.</p><div className="mt-6 flex justify-center gap-2"><Button type="button" variant="outline" onClick={() => setLocation("/sign-in")} className="rounded-full border-slate-200 bg-white font-bold text-slate-700">Sign in</Button><Button type="button" onClick={() => setLocation("/register")} className="rounded-full bg-slate-950 font-bold text-white">Create account</Button></div></section></div></main>;
  return <><AppNavigation /><Home /></>;
}
