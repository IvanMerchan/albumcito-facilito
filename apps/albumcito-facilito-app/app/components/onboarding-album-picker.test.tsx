import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import OnboardingAlbumPicker from "./onboarding-album-picker";
import { AlbumSummary } from "@/app/lib/albums.types";

const albums: AlbumSummary[] = [
  {
    id: "cody-aventuras",
    name: "Cody Aventuras",
    description: "Cody explora selvas y montañas.",
    coverEmoji: "🗺️",
    totalStickers: 10,
    ownedStickers: 4,
  },
];

test("renders one link per album, pointing to the onboarding step for that album", () => {
  render(<OnboardingAlbumPicker albums={albums} />);

  const link = screen.getByRole("link", { name: /Cody Aventuras/ });
  expect(link.getAttribute("href")).toBe("/onboarding/cody-aventuras");
});
