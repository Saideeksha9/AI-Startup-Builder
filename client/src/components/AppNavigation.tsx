import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { BarChart3, LogOut, Menu, Settings, Sparkles, X } from "lucide-react";
import React, { useState } from "react";
import { useLocation } from "wouter";

const navigationItems = [
  { label: "Home", href: "/" },
  { label: "Existing Ideas", href: "/#existing-ideas" },
  { label: "Companies", href: "/#companies" },
  { label: "App Info", href: "/#app-info" },
  { label: "How It Works", href: "/#how-it-works" },
];

export function AppNavigation() {
  const { isAuthenticated, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  function navigate(href: string) {
    setIsOpen(false);
    setLocation(href);
  }

  return <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-[#f8fafc]/90 backdrop-blur-xl">
    <div className="container flex h-[72px] items-center justify-between gap-3">
      <button type="button" onClick={() => navigate("/")} className="inline-flex min-w-0 items-center gap-2 text-left" aria-label="Go to home">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white"><Sparkles className="h-4 w-4" aria-hidden="true" /></span>
        <span className="truncate text-sm font-black tracking-[-0.02em] text-slate-900">Autonomous AI Startup Builder</span>
      </button>
      <div className="flex shrink-0 items-center gap-2">
        {!isAuthenticated || loading ? <><Button type="button" variant="outline" onClick={() => navigate("/sign-in")} className="hidden rounded-full border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 sm:inline-flex">Sign in</Button><Button type="button" onClick={() => navigate("/register")} className="hidden rounded-full bg-slate-950 px-4 text-xs font-bold text-white hover:bg-slate-800 sm:inline-flex">Create account</Button></> : null}
        <Button type="button" variant="outline" onClick={() => setIsOpen(open => !open)} aria-expanded={isOpen} aria-controls="app-navigation" aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"} className={isAuthenticated && !loading ? "rounded-full border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 hover:bg-slate-50" : "rounded-xl border-slate-200 bg-white text-slate-800 hover:bg-slate-50"}>{isOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}<span className="hidden sm:inline">Menu</span></Button>
      </div>
    </div>
    {isOpen ? <nav id="app-navigation" aria-label="Application navigation" className="border-t border-slate-200 bg-white shadow-xl"><div className="container grid gap-1 py-4 sm:grid-cols-2">{isAuthenticated && !loading ? <div className="mb-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 sm:col-span-2"><p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p><div className="grid gap-1 sm:grid-cols-3"><button type="button" onClick={() => navigate("/dashboard")} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-slate-800 transition hover:bg-white hover:text-blue-700"><BarChart3 className="h-4 w-4 text-blue-600" aria-hidden="true" />Dashboard</button><button type="button" onClick={() => navigate("/settings")} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-slate-800 transition hover:bg-white hover:text-blue-700"><Settings className="h-4 w-4 text-blue-600" aria-hidden="true" />Settings</button><button type="button" onClick={() => { setIsOpen(false); void logout(); }} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-slate-800 transition hover:bg-white hover:text-blue-700"><LogOut className="h-4 w-4 text-slate-500" aria-hidden="true" />Sign out</button></div></div> : null}{!isAuthenticated || loading ? <button type="button" onClick={() => navigate("/dashboard")} className="rounded-xl px-4 py-3 text-left text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700">Dashboard</button> : null}{navigationItems.map(item => <button key={item.href} type="button" onClick={() => navigate(item.href)} className="rounded-xl px-4 py-3 text-left text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700">{item.label}</button>)}{!isAuthenticated ? <div className="mt-2 flex gap-2 border-t border-slate-100 pt-4 sm:col-span-2"><Button type="button" variant="outline" onClick={() => navigate("/sign-in")} className="rounded-full border-slate-200 bg-white text-xs font-bold">Sign in</Button><Button type="button" onClick={() => navigate("/register")} className="rounded-full bg-slate-950 text-xs font-bold text-white">Create account</Button></div> : null}</div></nav> : null}
  </header>;
}
