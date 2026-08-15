import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PublicHome from "./PublicHome";

const authState = { isAuthenticated: false, loading: false };

vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => authState }));

describe("PublicHome", () => {
  beforeEach(() => {
    authState.isAuthenticated = false;
    authState.loading = false;
    window.history.replaceState({}, "", "/");
  });

  it("opens the three-line menu with public sections, dashboard access, and account entry points", () => {
    render(<PublicHome />);

    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));

    expect(screen.getByRole("navigation", { name: "Application navigation" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Home" }).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Existing Ideas" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Companies" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "App Info" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "How It Works" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Sign in" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "Create account" }).length).toBeGreaterThan(0);
  });

  it("routes visitors to dedicated sign-in and account-creation pages", () => {
    render(<PublicHome />);

    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(window.location.pathname).toBe("/sign-in");

    window.history.replaceState({}, "", "/");
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    expect(window.location.pathname).toBe("/register");
  });

  it("sends a registered user to the private dashboard", () => {
    authState.isAuthenticated = true;
    render(<PublicHome />);

    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Dashboard" }));

    expect(window.location.pathname).toBe("/dashboard");
  });
});
