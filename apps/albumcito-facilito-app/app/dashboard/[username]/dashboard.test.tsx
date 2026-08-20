import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DashboardPage from "./page";
import { getMe } from "@/app/lib/auth-api";
import { getMyStickers } from "@/app/lib/collection-api";
import { getSessionToken } from "@/app/lib/session";

vi.mock("@/app/lib/auth-api", () => ({
  getMe: vi.fn(),
}));
vi.mock("@/app/lib/collection-api", () => ({
  getMyStickers: vi.fn(),
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

test("renders a greeting for the current user without a collection yet", async () => {
  vi.mocked(getSessionToken).mockResolvedValue("valid-token");
  vi.mocked(getMe).mockResolvedValue({
    id: "1",
    email: "ivan.merchan@gmail.com",
    username: "ivan-merchan",
    name: "Iván Merchán",
  });
  vi.mocked(getMyStickers).mockResolvedValue([]);

  render(await DashboardPage(props("ivan-merchan")));

  expect(
    screen.getByRole("heading", { level: 1, name: "Hola, Iván Merchán" }),
  ).toBeDefined();
  expect(
    screen.getByText("Todavía no tienes estampas en tu colección."),
  ).toBeDefined();
});

test("shows the first collected sticker", async () => {
  vi.mocked(getSessionToken).mockResolvedValue("valid-token");
  vi.mocked(getMe).mockResolvedValue({
    id: "1",
    email: "ivan.merchan@gmail.com",
    username: "ivan-merchan",
    name: "Iván Merchán",
  });
  vi.mocked(getMyStickers).mockResolvedValue([
    {
      stickerId: "cody-aventuras-01",
      albumId: "cody-aventuras",
      stickerName: "Cody explorador",
      collectedAt: new Date().toISOString(),
    },
  ]);

  render(await DashboardPage(props("ivan-merchan")));

  expect(
    screen.getByText("Tienes 1 estampa en tu colección."),
  ).toBeDefined();
  expect(
    screen.getByText("Tu primera estampa: Cody explorador"),
  ).toBeDefined();
});
