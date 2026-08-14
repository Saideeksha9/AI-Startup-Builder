import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { VentureChat } from "./VentureChat";

const sendMutate = vi.fn();
const clearMutate = vi.fn();
const refetchHistory = vi.fn();
const writeClipboard = vi.fn();
const chatState = {
  history: { data: [] as Array<{ id: number; role: "user" | "assistant"; content: string }>, error: null as { message: string } | null },
  send: { isPending: false, error: null as { message: string } | null },
};

vi.mock("@/lib/trpc", () => ({
  trpc: {
    chat: {
      history: { useQuery: () => ({ ...chatState.history, refetch: refetchHistory }) },
      send: { useMutation: (options?: { onError?: (error: { message: string }, variables: { activeStartupId: number | null; message: string }) => void }) => ({
        ...chatState.send,
        mutate: (variables: { activeStartupId: number | null; message: string }) => {
          sendMutate(variables);
          if (chatState.send.error) options?.onError?.(chatState.send.error, variables);
        },
      }) },
      clear: { useMutation: () => ({ isPending: false, mutate: clearMutate }) },
    },
  },
}));

describe("VentureChat", () => {
  beforeEach(() => {
    sendMutate.mockClear();
    clearMutate.mockClear();
    refetchHistory.mockClear();
    writeClipboard.mockClear();
    Object.assign(navigator, { clipboard: { writeText: writeClipboard } });
    window.localStorage.clear();
    chatState.history.data = [];
    chatState.history.error = null;
    chatState.send.isPending = false;
    chatState.send.error = null;
  });

  it("greets with the active startup and supports General mode", () => {
    render(<VentureChat startups={[{ id: 4, blueprint: { startupName: "CareLoop" } }]} activeStartupId={4} onWorkspaceChange={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Open Venture Advisor" }));
    expect(screen.getByText("Hi there, need help? I can work with CareLoop.")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Chat startup context"), { target: { value: "general" } });
    expect(screen.getByText("Hi there, need help? Ask me anything about your startup portfolio.")).toBeInTheDocument();
  });

  it("loads starter questions and prepares a selected advisor request", () => {
    render(<VentureChat startups={[{ id: 4, blueprint: { startupName: "CareLoop" } }]} activeStartupId={4} onWorkspaceChange={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Open Venture Advisor" }));
    fireEvent.click(screen.getByRole("button", { name: "What risks should I consider?" }));
    expect(screen.getByDisplayValue("What risks should I consider?")).toBeInTheDocument();
  });

  it("shows a compact working indicator while the advisor is generating", () => {
    chatState.send.isPending = true;
    render(<VentureChat startups={[]} activeStartupId={null} onWorkspaceChange={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Open Venture Advisor" }));
    expect(screen.getByText("Working...")).toBeInTheDocument();
  });

  it("pins a starter question for priority reuse", () => {
    render(<VentureChat startups={[]} activeStartupId={null} onWorkspaceChange={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Open Venture Advisor" }));
    fireEvent.click(screen.getByRole("button", { name: "Pin What risks should I consider?" }));

    expect(screen.getByRole("button", { name: "Unpin What risks should I consider?" })).toBeInTheDocument();
    expect(window.localStorage.getItem("venture-advisor-pinned-prompts")).toContain("What risks should I consider?");
  });

  it("copies an advisor response with one click", async () => {
    chatState.history.data = [{ id: 9, role: "assistant", content: "Start with ten customer interviews." }];
    render(<VentureChat startups={[]} activeStartupId={null} onWorkspaceChange={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Open Venture Advisor" }));
    fireEvent.click(screen.getByRole("button", { name: "Copy advisor response" }));

    expect(writeClipboard).toHaveBeenCalledWith("Start with ten customer interviews.");
  });

  it("shows a retry action that resubmits the failed advisor request", () => {
    chatState.send.error = { message: "The venture advisor could not respond. Please try again." };
    render(<VentureChat startups={[]} activeStartupId={null} onWorkspaceChange={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Open Venture Advisor" }));
    fireEvent.change(screen.getByLabelText("Message Venture Advisor"), { target: { value: "Help me prioritise." } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(sendMutate).toHaveBeenCalledTimes(2);
    expect(sendMutate).toHaveBeenLastCalledWith({ activeStartupId: null, message: "Help me prioritise." });
  });
});
