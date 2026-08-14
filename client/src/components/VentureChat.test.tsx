import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { VentureChat } from "./VentureChat";

const sendMutate = vi.fn();
const clearMutate = vi.fn();
const refetchHistory = vi.fn();
const chatState = {
  history: { data: [] as Array<{ id: number; role: "user" | "assistant"; content: string }>, error: null as { message: string } | null },
  send: { isPending: false, error: null as { message: string } | null },
};

vi.mock("@/lib/trpc", () => ({
  trpc: {
    chat: {
      history: { useQuery: () => ({ ...chatState.history, refetch: refetchHistory }) },
      send: { useMutation: () => ({ ...chatState.send, mutate: sendMutate }) },
      clear: { useMutation: () => ({ isPending: false, mutate: clearMutate }) },
    },
  },
}));

describe("VentureChat", () => {
  beforeEach(() => {
    sendMutate.mockClear();
    clearMutate.mockClear();
    refetchHistory.mockClear();
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

  it("loads quick actions and prepares a selected advisor request", () => {
    render(<VentureChat startups={[{ id: 4, blueprint: { startupName: "CareLoop" } }]} activeStartupId={4} onWorkspaceChange={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Open Venture Advisor" }));
    fireEvent.click(screen.getByRole("button", { name: "Add a risk" }));
    expect(screen.getByDisplayValue("Add a risk")).toBeInTheDocument();
  });
});
