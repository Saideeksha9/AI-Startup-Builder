import { useAuth } from "@/_core/hooks/useAuth";
import { AppNavigation } from "@/components/AppNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, ChevronLeft, LoaderCircle, MailCheck, Save, UserRound } from "lucide-react";
import React, { FormEvent, useEffect, useState } from "react";
import { useLocation } from "wouter";

type SettingsForm = {
  fullName: string;
  jobTitle: string;
  companyName: string;
  preferredFocus: string;
  weeklyDigest: boolean;
  onboardingEmailTips: boolean;
};

const blankForm: SettingsForm = { fullName: "", jobTitle: "", companyName: "", preferredFocus: "", weeklyDigest: true, onboardingEmailTips: true };

function SettingsFormContent() {
  const [, setLocation] = useLocation();
  const profile = trpc.profile.get.useQuery();
  const utils = trpc.useUtils();
  const [form, setForm] = useState<SettingsForm>(blankForm);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!profile.data) return;
    setForm({
      fullName: profile.data.profile.fullName ?? "",
      jobTitle: profile.data.profile.jobTitle ?? "",
      companyName: profile.data.profile.companyName ?? "",
      preferredFocus: profile.data.profile.preferredFocus ?? "",
      weeklyDigest: profile.data.profile.weeklyDigest,
      onboardingEmailTips: profile.data.profile.onboardingEmailTips,
    });
  }, [profile.data]);

  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: async () => {
      setSaved(true);
      await utils.profile.get.invalidate();
    },
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(false);
    updateProfile.mutate({
      fullName: form.fullName.trim() || null,
      jobTitle: form.jobTitle.trim() || null,
      companyName: form.companyName.trim() || null,
      preferredFocus: form.preferredFocus.trim() || null,
      weeklyDigest: form.weeklyDigest,
      onboardingEmailTips: form.onboardingEmailTips,
    });
  }

  if (profile.isLoading) return <div className="flex min-h-[calc(100vh-72px)] items-center justify-center"><LoaderCircle className="h-6 w-6 animate-spin text-blue-600" aria-label="Loading profile settings" /></div>;
  if (profile.isError) return <div className="container py-16"><section className="mx-auto max-w-xl rounded-3xl border border-rose-200 bg-rose-50 p-7 text-center"><h1 className="text-xl font-black text-rose-900">Profile settings could not load.</h1><p className="mt-2 text-sm text-rose-700">Please try again from your dashboard.</p><Button type="button" onClick={() => setLocation("/dashboard")} className="mt-5 rounded-full bg-slate-950 text-white">Back to dashboard</Button></section></div>;

  const account = profile.data?.account;
  return <div className="container max-w-5xl py-10 sm:py-14"><button type="button" onClick={() => setLocation("/dashboard")} className="inline-flex items-center gap-1 text-sm font-bold text-slate-600 transition hover:text-blue-700"><ChevronLeft className="h-4 w-4" aria-hidden="true" />Back to dashboard</button><div className="mt-7 grid gap-6 lg:grid-cols-[0.75fr_1.25fr]"><aside className="rounded-[2rem] bg-slate-950 p-7 text-white sm:p-8"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500"><UserRound className="h-5 w-5" aria-hidden="true" /></span><p className="mt-7 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-200">Founder profile</p><h1 className="mt-3 text-3xl font-black tracking-[-0.045em]">Set up the workspace around how you build.</h1><p className="mt-4 text-sm leading-6 text-slate-300">Your account email remains managed by the secure sign-in provider. These settings shape only your private founder experience.</p><div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-4"><MailCheck className="h-5 w-5 text-blue-200" aria-hidden="true" /><p className="mt-3 text-sm font-bold">Passwordless account access</p><p className="mt-1 text-xs leading-5 text-slate-300">Use the secure provider portal and complete its email confirmation when prompted. This app never stores a password.</p></div></aside><form onSubmit={submit} className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-8"><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700">Personal information</p><h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">Profile and preferences</h2><p className="mt-2 text-sm leading-6 text-slate-600">Choose details that help you keep each venture workspace organized.</p></div><div className="mt-7 grid gap-5 sm:grid-cols-2"><div><Label htmlFor="full-name">Preferred name</Label><Input id="full-name" value={form.fullName} onChange={event => setForm(current => ({ ...current, fullName: event.target.value }))} maxLength={160} className="mt-2" placeholder="Your name" /></div><div><Label htmlFor="job-title">Role or title</Label><Input id="job-title" value={form.jobTitle} onChange={event => setForm(current => ({ ...current, jobTitle: event.target.value }))} maxLength={160} className="mt-2" placeholder="Founder, product lead…" /></div><div><Label htmlFor="company-name">Company or studio</Label><Input id="company-name" value={form.companyName} onChange={event => setForm(current => ({ ...current, companyName: event.target.value }))} maxLength={160} className="mt-2" placeholder="Optional" /></div><div><Label htmlFor="focus">Preferred focus</Label><Input id="focus" value={form.preferredFocus} onChange={event => setForm(current => ({ ...current, preferredFocus: event.target.value }))} maxLength={120} className="mt-2" placeholder="Validation, product, fundraising…" /></div><div className="sm:col-span-2"><Label htmlFor="account-email">Account email</Label><Input id="account-email" value={account?.email ?? "Managed by your secure sign-in provider"} readOnly className="mt-2 bg-slate-50 text-slate-500" /></div></div><fieldset className="mt-7 space-y-3 rounded-2xl bg-slate-50 p-5"><legend className="px-1 text-sm font-black text-slate-900">Preferences</legend><label className="flex cursor-pointer items-start gap-3"><input type="checkbox" checked={form.weeklyDigest} onChange={event => setForm(current => ({ ...current, weeklyDigest: event.target.checked }))} className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" /><span><span className="block text-sm font-bold text-slate-800">Weekly planning digest</span><span className="block text-xs leading-5 text-slate-500">Save this preference for a future weekly progress summary.</span></span></label><label className="flex cursor-pointer items-start gap-3"><input type="checkbox" checked={form.onboardingEmailTips} onChange={event => setForm(current => ({ ...current, onboardingEmailTips: event.target.checked }))} className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" /><span><span className="block text-sm font-bold text-slate-800">Founder onboarding tips</span><span className="block text-xs leading-5 text-slate-500">Save your preference for occasional onboarding guidance.</span></span></label></fieldset>{updateProfile.isError ? <p role="alert" className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">Your settings could not be saved. Please try again.</p> : null}<div className="mt-7 flex flex-wrap items-center gap-3"><Button type="submit" disabled={updateProfile.isPending} className="rounded-full bg-slate-950 px-5 font-bold text-white hover:bg-slate-800">{updateProfile.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}{updateProfile.isPending ? "Saving…" : "Save settings"}</Button>{saved ? <span role="status" className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700"><CheckCircle2 className="h-4 w-4" aria-hidden="true" />Settings saved</span> : null}</div></form></div></div>;
}

export default function ProfileSettings() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  if (loading) return <main className="min-h-screen bg-slate-50"><AppNavigation /><div className="flex min-h-[calc(100vh-72px)] items-center justify-center"><LoaderCircle className="h-6 w-6 animate-spin text-blue-600" aria-label="Loading account" /></div></main>;
  if (!isAuthenticated) return <main className="min-h-screen bg-slate-50"><AppNavigation /><div className="flex min-h-[calc(100vh-72px)] items-center justify-center p-6"><section className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm"><h1 className="text-xl font-black text-slate-950">Sign in to manage your profile.</h1><p className="mt-2 text-sm leading-6 text-slate-600">Profile settings are private to your account.</p><div className="mt-6 flex justify-center gap-2"><Button type="button" variant="outline" onClick={() => setLocation("/sign-in")} className="rounded-full">Sign in</Button><Button type="button" onClick={() => setLocation("/register")} className="rounded-full bg-slate-950 text-white">Create account</Button></div></section></div></main>;
  return <main className="min-h-screen bg-[#f8fafc]"><AppNavigation /><SettingsFormContent /></main>;
}
