import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DashboardPage from "./page";
import { getMe } from "@/app/lib/auth-api";
import { getSessionToken } from "@/app/lib/session";

vi.mock("@/app/lib/auth-api", () => ({
  getMe: vi.fn(),
}));
vi.mock("@/app/lib/session", () => ({
  getSessionToken: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

function props(username: string) {
  return {
    params: Promise.resolve({ username }),
  } as Parameters<typeof DashboardPage>[0];
}

test("redirects to /login when there is no session cookie", async () => {
  vi.mocked(getSessionToken).mockResolvedValue(null);

  await expect(DashboardPage(props("ivan-merchan"))).rejects.toThrow(
    "NEXT_REDIRECT:/login",
  );
});

test("redirects to /login when the token is invalid or expired", async () => {
  vi.mocked(getSessionToken).mockResolvedValue("stale-token");
  vi.mocked(getMe).mockResolvedValue(null);

  await expect(DashboardPage(props("ivan-merchan"))).rejects.toThrow(
    "NEXT_REDIRECT:/login",
  );
});

test("redirects to the token's own dashboard when the URL username does not match", async () => {
  vi.mocked(getSessionToken).mockResolvedValue("valid-token");
  vi.mocked(getMe).mockResolvedValue({
    id: "1",
    email: "ivan.merchan@gmail.com",
    username: "ivan-merchan",
    name: "Iván Merchán",
  });

  await expect(DashboardPage(props("otro-usuario"))).rejects.toThrow(
    "NEXT_REDIRECT:/dashboard/ivan-merchan",
  );
});

test("renders a greeting for the current user", async () => {
  vi.mocked(getSessionToken).mockResolvedValue("valid-token");
  vi.mocked(getMe).mockResolvedValue({
    id: "1",
    email: "ivan.merchan@gmail.com",
    username: "ivan-merchan",
    name: "Iván Merchán",
  });

  render(await DashboardPage(props("ivan-merchan")));

  expect(
    screen.getByRole("heading", { level: 1, name: "Hola, Iván Merchán" }),
  ).toBeDefined();
});
