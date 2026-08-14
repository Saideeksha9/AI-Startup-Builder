import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Bot, Check, ChevronDown, Copy, Eraser, LoaderCircle, MessageCircle, Pin, RotateCcw, Send, Sparkles, X } from "lucide-react";
import React, { FormEvent, useEffect, useState } from "react";

type StartupOption = {
  id: number;
  blueprint: { startupName: string };
};

type VentureChatProps = {
  startups: StartupOption[];
  activeStartupId: number | null;
  onWorkspaceChange: () => void;
};

const starterQuestions = [
  "What startup ideas fit my interests?",
  "What should I validate first?",
  "Help me build a 30-day roadmap",
  "What risks should I consider?",
];
const pinnedPromptsStorageKey = "venture-advisor-pinned-prompts";

export function VentureChat({ startups, activeStartupId, onWorkspaceChange }: VentureChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStartupId, setSelectedStartupId] = useState<number | null>(activeStartupId);
  const [message, setMessage] = useState("");
  const [failedRequest, setFailedRequest] = useState<{ activeStartupId: number | null; message: string } | null>(null);
  const [pinnedPrompts, setPinnedPrompts] = useState<string[]>([]);
  const [copiedResponseId, setCopiedResponseId] = useState<number | null>(null);
  const history = trpc.chat.history.useQuery(
    { activeStartupId: selectedStartupId },
    { enabled: isOpen, refetchOnWindowFocus: false },
  );
  const sendMessage = trpc.chat.send.useMutation({
    onSuccess: () => {
      setMessage("");
      setFailedRequest(null);
      void history.refetch();
      onWorkspaceChange();
    },
    onError: (_error, variables) => setFailedRequest(variables),
  });
  const clearHistory = trpc.chat.clear.useMutation({
    onSuccess: () => void history.refetch(),
  });

  useEffect(() => {
    setSelectedStartupId(activeStartupId);
  }, [activeStartupId]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(pinnedPromptsStorageKey);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) setPinnedPrompts(parsed.filter((item): item is string => typeof item === "string" && starterQuestions.includes(item)));
    } catch {
      setPinnedPrompts([]);
    }
  }, []);

  const activeStartup = startups.find(startup => startup.id === selectedStartupId);
  const greeting = activeStartup
    ? `Hi there, need help? I can work with ${activeStartup.blueprint.startupName}.`
    : "Hi there, need help? Ask me anything about your startup portfolio.";
  const orderedStarterQuestions = [...pinnedPrompts, ...starterQuestions.filter(question => !pinnedPrompts.includes(question))];

  function togglePinnedPrompt(question: string) {
    setPinnedPrompts(current => {
      const next = current.includes(question) ? current.filter(item => item !== question) : [...current, question];
      try { window.localStorage.setItem(pinnedPromptsStorageKey, JSON.stringify(next)); } catch { /* Browsing can continue without persistence. */ }
      return next;
    });
  }

  async function copyAssistantResponse(id: number, content: string) {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedResponseId(id);
      window.setTimeout(() => setCopiedResponseId(current => current === id ? null : current), 1800);
    } catch {
      setCopiedResponseId(null);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || sendMessage.isPending) return;
    setFailedRequest(null);
    sendMessage.mutate({ activeStartupId: selectedStartupId, message: trimmedMessage });
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 sm:bottom-7 sm:right-7">
      {isOpen ? (
        <section className="flex h-[min(660px,calc(100vh-2.5rem))] w-[min(390px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
          <header className="border-b border-slate-100 bg-slate-950 px-5 py-4 text-white">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10"><Bot className="h-4.5 w-4.5" aria-hidden="true" /></span>
                <div>
                  <p className="text-sm font-bold">Venture Advisor</p>
                  <p className="text-[11px] text-slate-300">Context-aware workspace chat</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button type="button" variant="ghost" size="icon" disabled={clearHistory.isPending} onClick={() => clearHistory.mutate({ activeStartupId: selectedStartupId })} aria-label="Clear conversation" className="h-8 w-8 rounded-full text-slate-300 hover:bg-white/10 hover:text-white"><Eraser className="h-3.5 w-3.5" aria-hidden="true" /></Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Close venture advisor" className="h-8 w-8 rounded-full text-slate-300 hover:bg-white/10 hover:text-white"><X className="h-4 w-4" aria-hidden="true" /></Button>
              </div>
            </div>
            <label className="mt-4 block">
              <span className="sr-only">Chat startup context</span>
              <div className="relative">
                <select value={selectedStartupId ?? "general"} onChange={event => setSelectedStartupId(event.target.value === "general" ? null : Number(event.target.value))} className="w-full appearance-none rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white outline-none focus:ring-2 focus:ring-white/30">
                  <option value="general" className="text-slate-900">General portfolio mode</option>
                  {startups.map(startup => <option key={startup.id} value={startup.id} className="text-slate-900">{startup.blueprint.startupName}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white" aria-hidden="true" />
              </div>
            </label>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4">
            <div className="rounded-2xl bg-blue-50 p-3.5 text-sm leading-6 text-slate-700">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-blue-700"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" />Venture advisor</div>
              {greeting}
            </div>
            {!history.data?.length ? (
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.13em] text-slate-400">Suggested questions</p>
                <div className="flex flex-wrap gap-2">
                  {orderedStarterQuestions.map(question => { const isPinned = pinnedPrompts.includes(question); return <span key={question} className="inline-flex overflow-hidden rounded-full border border-slate-200 bg-white"><button type="button" onClick={() => setMessage(question)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700">{question}</button><button type="button" aria-label={`${isPinned ? "Unpin" : "Pin"} ${question}`} onClick={() => togglePinnedPrompt(question)} className={isPinned ? "border-l border-blue-100 bg-blue-50 px-2 text-blue-700" : "border-l border-slate-100 px-2 text-slate-400 hover:bg-slate-50 hover:text-blue-600"}><Pin className={`h-3 w-3 ${isPinned ? "fill-current" : ""}`} aria-hidden="true" /></button></span>; })}
                </div>
              </div>
            ) : null}
            {history.data?.map(chatMessage => (
              <div key={chatMessage.id} className={chatMessage.role === "user" ? "ml-8 rounded-2xl bg-slate-950 px-3.5 py-3 text-sm leading-6 text-white" : "group mr-8 rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-slate-700"}>
                <div className="flex items-start justify-between gap-2"><span className="whitespace-pre-wrap">{chatMessage.content}</span>{chatMessage.role === "assistant" ? <Button type="button" variant="ghost" size="icon" onClick={() => void copyAssistantResponse(chatMessage.id, chatMessage.content)} aria-label="Copy advisor response" className="h-7 w-7 shrink-0 text-slate-400 hover:bg-blue-50 hover:text-blue-700">{copiedResponseId === chatMessage.id ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}</Button> : null}</div>
              </div>
            ))}
            {sendMessage.isPending ? <div className="mr-8 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-xs font-medium text-slate-500"><LoaderCircle className="h-3.5 w-3.5 animate-spin text-blue-600" aria-hidden="true" />Working...</div> : null}
            {history.error ? <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{history.error.message}</p> : null}
            {sendMessage.error ? <div role="alert" className="flex items-center justify-between gap-3 rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700"><span>{sendMessage.error.message}</span>{failedRequest ? <Button type="button" variant="outline" size="sm" disabled={sendMessage.isPending} onClick={() => { setFailedRequest(null); sendMessage.mutate(failedRequest); }} className="h-7 shrink-0 rounded-lg border-rose-200 bg-white px-2 text-[11px] font-bold text-rose-700 hover:bg-rose-100"><RotateCcw className="h-3 w-3" aria-hidden="true" />Retry</Button> : null}</div> : null}
          </div>

          <form onSubmit={submit} className="border-t border-slate-100 bg-white p-3">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5">
              <label htmlFor="venture-chat-message" className="sr-only">Message Venture Advisor</label>
              <input id="venture-chat-message" value={message} onChange={event => setMessage(event.target.value)} placeholder="Ask about this venture..." maxLength={2400} className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-slate-400" />
              <Button type="submit" size="icon" disabled={!message.trim() || sendMessage.isPending} aria-label="Send message" className="h-9 w-9 rounded-xl bg-slate-950 text-white hover:bg-slate-800"><Send className="h-4 w-4" aria-hidden="true" /></Button>
            </div>
          </form>
        </section>
      ) : (
        <Button type="button" onClick={() => setIsOpen(true)} aria-label="Open Venture Advisor" className="h-14 w-14 rounded-full bg-slate-950 p-0 text-white shadow-[0_12px_30px_rgba(15,23,42,0.25)] transition hover:bg-blue-700 active:scale-95"><MessageCircle className="h-5 w-5" aria-hidden="true" /></Button>
      )}
    </div>
  );
}
