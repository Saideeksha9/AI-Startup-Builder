import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AccountAccess } from "./AccountAccess";

const startLoginMock = vi.fn();
const startRegistrationMock = vi.fn();
const authState = { isAuthenticated: false, loading: false };

vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => authState }));
vi.mock("@/const", () => ({
  startLogin: () => startLoginMock(),
  startRegistration: () => startRegistrationMock(),
}));

describe("AccountAccess", () => {
  beforeEach(() => {
    authState.isAuthenticated = false;
    authState.loading = false;
    startLoginMock.mockClear();
    startRegistrationMock.mockClear();
    window.history.replaceState({}, "", "/sign-in");
  });

  it("provides a dedicated sign-in page that launches secure sign-in", () => {
    render(<AccountAccess mode="sign-in" />);
    fireEvent.click(screen.getByRole("button", { name: "Continue to secure sign in" }));
    expect(startLoginMock).toHaveBeenCalledTimes(1);
  });

  it("provides a dedicated registration page that launches secure account creation", () => {
    render(<AccountAccess mode="register" />);
    expect(screen.getByText("Passwordless email confirmation")).toBeInTheDocument();
    expect(screen.getByText(/There is no password to create, remember, or store/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open secure account portal" }));
    expect(startRegistrationMock).toHaveBeenCalledTimes(1);
  });
});
