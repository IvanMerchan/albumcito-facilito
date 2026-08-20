import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import StickerGrid from "./sticker-grid";
import { Sticker } from "@/app/lib/albums.types";

const stickers: Sticker[] = [
  { id: "cody-01", number: 1, name: "Cody explorador", rarity: "common", status: "owned" },
  { id: "cody-02", number: 2, name: "Cody y la brújula", rarity: "common", status: "missing" },
  { id: "cody-03", number: 3, name: "Cody en la cima", rarity: "rare", status: "duplicate" },
];

test("renders every sticker with its name and the owned/total count", () => {
  render(<StickerGrid stickers={stickers} />);

  expect(screen.getByText("1 de 3 estampas")).toBeDefined();
  expect(screen.getByText("Cody explorador")).toBeDefined();
  expect(screen.getByText("Cody y la brújula")).toBeDefined();
  expect(screen.getByText("Cody en la cima")).toBeDefined();
});
