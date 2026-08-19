import { loadFeature, describeFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

const feature = await loadFeature("./page.feature");

describeFeature(feature, ({ Scenario }) => {
  Scenario("Viewing the home page heading", ({ Given, Then }) => {
    Given("I open the home page", () => {
      render(<HomePage />);
    });

    Then('I see the "Albumcito Facilito" heading', () => {
      expect(
        screen.getByRole("heading", { level: 1, name: "Albumcito Facilito" }),
      ).toBeDefined();
    });
  });
});
