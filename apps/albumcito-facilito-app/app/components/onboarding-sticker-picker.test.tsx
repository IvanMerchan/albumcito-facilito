import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import OnboardingStickerPicker from "./onboarding-sticker-picker";
import { Sticker } from "@/app/lib/albums.types";

vi.mock("@/app/actions/collection", () => ({
  addStickerAction: vi.fn(),
}));

const stickers: Sticker[] = [
  {
    id: "cody-aventuras-01",
    number: 1,
    name: "Cody explorador",
    rarity: "common",
    status: "missing",
  },
  {
    id: "cody-aventuras-02",
    number: 2,
    name: "Cody y la brújula",
    rarity: "common",
    status: "missing",
  },
];

test("renders one submit button per sticker", () => {
  render(<OnboardingStickerPicker stickers={stickers} />);

  expect(
    screen.getByRole("button", { name: /Cody explorador/ }),
  ).toBeDefined();
  expect(
    screen.getByRole("button", { name: /Cody y la brújula/ }),
  ).toBeDefined();
});
