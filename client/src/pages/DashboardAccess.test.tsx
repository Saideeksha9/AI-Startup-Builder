import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DashboardAccess from "./DashboardAccess";

const authState = { isAuthenticated: false, loading: false };

vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => authState }));
vi.mock("@/const", () => ({ startLogin: vi.fn() }));
vi.mock("./Home", () => ({ default: () => <div data-testid="private-venture-dashboard">Private venture dashboard</div> }));

describe("DashboardAccess", () => {
  beforeEach(() => {
    authState.isAuthenticated = false;
    authState.loading = false;
  });

  it("shows account access guidance when a visitor is not signed in", () => {
    render(<DashboardAccess />);
    expect(screen.getByText("Sign in to open your dashboard")).toBeInTheDocument();
  });

  it("renders the private venture dashboard for an authenticated user", () => {
    authState.isAuthenticated = true;
    render(<DashboardAccess />);
    expect(screen.getByTestId("private-venture-dashboard")).toBeInTheDocument();
  });
});
