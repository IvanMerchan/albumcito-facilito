import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import PopularStickers from "./popular-stickers";
import { PopularSticker } from "@/app/lib/popular-picks.types";

const stickers: PopularSticker[] = [
  {
    stickerId: "cody-aventuras-01",
    stickerName: "Cody explorador",
    rarity: "common",
    albumId: "cody-aventuras",
    albumName: "Cody Aventuras",
    collectedCount: 4,
  },
  {
    stickerId: "cody-aventuras-08",
    stickerName: "Cody y el tesoro",
    rarity: "legendary",
    albumId: "cody-aventuras",
    albumName: "Cody Aventuras",
    collectedCount: 1,
  },
];

test("renders one card per popular sticker, with its album and collected count", () => {
  render(<PopularStickers stickers={stickers} />);

  expect(screen.getByText("Cody explorador")).toBeDefined();
  expect(screen.getByText("Coleccionada 4 veces")).toBeDefined();
  expect(screen.getByText("Coleccionada 1 vez")).toBeDefined();
  expect(screen.getAllByText("Cody Aventuras")).toHaveLength(2);
});

test("renders nothing when there are no popular stickers", () => {
  const { container } = render(<PopularStickers stickers={[]} />);
  expect(container.firstChild).toBeNull();
});
