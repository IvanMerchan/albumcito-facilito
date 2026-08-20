import { loadFeature, describeFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StickerGrid from "@/app/components/sticker-grid";
import { Sticker } from "@/app/lib/albums.types";

const feature = await loadFeature("./album-detail.feature");

describeFeature(feature, ({ Scenario }) => {
  Scenario("Viewing the Cody stickers of an album", ({ Given, When, Then }) => {
    let stickers: Sticker[];

    Given('the "Cody Aventuras" album has 3 Cody stickers', () => {
      stickers = [
        { id: "cody-01", number: 1, name: "Cody explorador", rarity: "common", status: "owned" },
        { id: "cody-02", number: 2, name: "Cody y la brújula", rarity: "common", status: "missing" },
        { id: "cody-03", number: 3, name: "Cody en la cima", rarity: "rare", status: "duplicate" },
      ];
    });

    When("I view the sticker grid for that album", () => {
      render(<StickerGrid stickers={stickers} />);
    });

    Then("I see every Cody sticker of the album", () => {
      for (const sticker of stickers) {
        expect(screen.getByText(sticker.name)).toBeDefined();
      }
    });
  });
});
