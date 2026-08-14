import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { startLogin } from "@/const";
import { LoaderCircle, LockKeyhole } from "lucide-react";
import React, { useEffect } from "react";
import { useLocation } from "wouter";
import Home from "./Home";

export default function DashboardAccess() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) setLocation("/");
  }, [isAuthenticated, loading, setLocation]);

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-slate-50"><LoaderCircle className="h-6 w-6 animate-spin text-blue-600" aria-label="Loading dashboard" /></main>;
  if (!isAuthenticated) return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6"><section className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm"><LockKeyhole className="mx-auto h-7 w-7 text-blue-600" aria-hidden="true" /><h1 className="mt-4 text-xl font-black text-slate-950">Sign in to open your dashboard</h1><p className="mt-2 text-sm leading-6 text-slate-600">Your saved ideas and venture workspaces are private to your account.</p><Button type="button" onClick={startLogin} className="mt-6 rounded-full bg-slate-950 font-bold text-white">Sign in or create account</Button></section></main>;
  return <Home />;
}
