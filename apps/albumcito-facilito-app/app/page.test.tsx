import { afterEach, expect, test, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import HomePage from "./page";
import { getAlbums } from "@/app/lib/albums-api";
import { getPopularAlbums, getPopularStickers } from "@/app/lib/popular-picks-api";

vi.mock("@/app/lib/albums-api", () => ({
  getAlbums: vi.fn(),
}));
vi.mock("@/app/lib/popular-picks-api", () => ({
  getPopularAlbums: vi.fn(),
  getPopularStickers: vi.fn(),
}));

// This file now has more than one test that renders the page. RTL does not
// auto-clean the DOM between plain (non-BDD) vitest tests in this project
// (no globals: true, no global afterEach(cleanup) in vitest.setup.ts), so a
// leftover render from an earlier test would make later queryByRole(...)
// assertions about *absence* pass for the wrong reason (or fail).
afterEach(() => {
  cleanup();
});

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
  vi.mocked(getPopularAlbums).mockResolvedValue([]);
  vi.mocked(getPopularStickers).mockResolvedValue([]);

  render(await HomePage());

  expect(
    screen.getByRole("heading", { level: 1, name: "Albumcito Facilito" }),
  ).toBeDefined();
  expect(screen.getByRole("link", { name: /Cody Aventuras/ })).toBeDefined();
});

test("shows popular albums and popular stickers sections when there is data", async () => {
  vi.mocked(getAlbums).mockResolvedValue([]);
  vi.mocked(getPopularAlbums).mockResolvedValue([
    {
      albumId: "cody-aventuras",
      name: "Cody Aventuras",
      coverEmoji: "🗺️",
      collectedCount: 3,
    },
  ]);
  vi.mocked(getPopularStickers).mockResolvedValue([
    {
      stickerId: "cody-aventuras-01",
      stickerName: "Cody explorador",
      rarity: "common",
      albumId: "cody-aventuras",
      albumName: "Cody Aventuras",
      collectedCount: 2,
    },
  ]);

  render(await HomePage());

  expect(
    screen.getByRole("heading", { level: 2, name: "Álbumes populares" }),
  ).toBeDefined();
  expect(
    screen.getByRole("heading", { level: 2, name: "Estampas populares" }),
  ).toBeDefined();
  expect(screen.getByText("Cody explorador")).toBeDefined();
});

test("omits the popular sections when there is no popular data yet", async () => {
  vi.mocked(getAlbums).mockResolvedValue([]);
  vi.mocked(getPopularAlbums).mockResolvedValue([]);
  vi.mocked(getPopularStickers).mockResolvedValue([]);

  render(await HomePage());

  expect(screen.queryByRole("heading", { name: "Álbumes populares" })).toBeNull();
  expect(screen.queryByRole("heading", { name: "Estampas populares" })).toBeNull();
});
