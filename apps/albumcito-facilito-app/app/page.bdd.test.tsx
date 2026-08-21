import { loadFeature, describeFeature } from "@amiceli/vitest-cucumber";
import { expect, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
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

const feature = await loadFeature("./page.feature");

describeFeature(feature, ({ Scenario, AfterEachScenario }) => {
  AfterEachScenario(() => {
    cleanup();
  });

  Scenario("Viewing the album collection on the home page", ({ Given, When, Then, And }) => {
    Given('there is a "Cody Aventuras" album available', () => {
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
      // These scenarios aren't about popular picks; empty lists keep those
      // sections omitted so they don't interfere with the album assertions.
      vi.mocked(getPopularAlbums).mockResolvedValue([]);
      vi.mocked(getPopularStickers).mockResolvedValue([]);
    });

    When("I open the home page", async () => {
      render(await HomePage());
    });

    Then('I see the "Albumcito Facilito" heading', () => {
      expect(
        screen.getByRole("heading", { level: 1, name: "Albumcito Facilito" }),
      ).toBeDefined();
    });

    And('I see the "Cody Aventuras" album card', () => {
      expect(screen.getByRole("link", { name: /Cody Aventuras/ })).toBeDefined();
    });
  });

  Scenario("Choosing an album from the home page", ({ Given, When, Then }) => {
    Given('there is a "Cody Aventuras" album available', () => {
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
      // These scenarios aren't about popular picks; empty lists keep those
      // sections omitted so they don't interfere with the album assertions.
      vi.mocked(getPopularAlbums).mockResolvedValue([]);
      vi.mocked(getPopularStickers).mockResolvedValue([]);
    });

    When("I open the home page", async () => {
      render(await HomePage());
    });

    Then('the "Cody Aventuras" album card links to its album page', () => {
      const link = screen.getByRole("link", { name: /Cody Aventuras/ });
      expect(link.getAttribute("href")).toBe("/albums/cody-aventuras");
    });
  });
});
