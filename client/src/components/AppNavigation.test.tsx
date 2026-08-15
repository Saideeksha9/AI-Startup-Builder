import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppNavigation } from "./AppNavigation";

const logoutMock = vi.fn();
const authState = { isAuthenticated: false, loading: false, user: null as { name: string } | null, logout: logoutMock };

vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => authState }));

describe("AppNavigation", () => {
  beforeEach(() => {
    authState.isAuthenticated = false;
    authState.loading = false;
    authState.user = null;
    logoutMock.mockClear();
    window.history.replaceState({}, "", "/");
  });

  it("keeps the three-line menu and guest account actions available across app pages", () => {
    render(<AppNavigation />);

    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create account" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));

    expect(screen.getByRole("navigation", { name: "Application navigation" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Existing Ideas" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Companies" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "App Info" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "How It Works" })).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Create account" })[0]);
    expect(window.location.pathname).toBe("/register");
  });

  it("groups dashboard, settings, and sign-out inside one authenticated menu", () => {
    authState.isAuthenticated = true;
    authState.user = { name: "Cherry" };
    render(<AppNavigation />);

    expect(screen.queryByRole("button", { name: "Dashboard" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Dashboard" }));
    expect(window.location.pathname).toBe("/dashboard");
    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    expect(window.location.pathname).toBe("/settings");
    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    expect(logoutMock).toHaveBeenCalledTimes(1);
  });
});
