import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "./page";
import { getAlbums } from "@/app/lib/albums-api";

vi.mock("@/app/lib/albums-api", () => ({
  getAlbums: vi.fn(),
}));

test("renders the home page heading and the album list", async () => {
  vi.mocked(getAlbums).mockResolvedValue([
    {
      id: "cody-aventuras",
      name: "Cody Aventuras",
      description: "Cody explora selvas y montañas.",
      coverEmoji: "🗺️",
      totalStickers: 10,
      ownedStickers: 4,
    },
  ]);

  render(await HomePage());

  expect(
    screen.getByRole("heading", { level: 1, name: "Albumcito Facilito" }),
  ).toBeDefined();
  expect(screen.getByRole("link", { name: /Cody Aventuras/ })).toBeDefined();
});
