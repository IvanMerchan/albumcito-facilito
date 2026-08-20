import { loadFeature, describeFeature } from "@amiceli/vitest-cucumber";
import { expect, vi } from "vitest";
import { addStickerAction } from "@/app/actions/collection";
import { getMe } from "@/app/lib/auth-api";
import { addSticker } from "@/app/lib/collection-api";
import { getSessionToken } from "@/app/lib/session";

vi.mock("@/app/lib/collection-api", () => ({
  addSticker: vi.fn(),
}));
vi.mock("@/app/lib/auth-api", () => ({
  getMe: vi.fn(),
}));
vi.mock("@/app/lib/session", () => ({
  getSessionToken: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

const feature = await loadFeature("./onboarding.feature");

describeFeature(feature, ({ Scenario, AfterEachScenario }) => {
  // No render() happens in this file (the action is tested directly, not
  // through a rendered form), so this isn't about DOM cleanup -- it resets
  // mock call history so a later scenario's `not.toHaveBeenCalled()` isn't
  // tripped by calls made in an earlier scenario.
  AfterEachScenario(() => {
    vi.clearAllMocks();
  });

  Scenario("Adding my first sticker", ({ Given, When, Then }) => {
    let redirectedTo: string | undefined;

    Given("I have a session", () => {
      vi.mocked(getSessionToken).mockResolvedValue("valid-token");
      vi.mocked(addSticker).mockResolvedValue({
        stickerId: "cody-aventuras-01",
        albumId: "cody-aventuras",
        stickerName: "Cody explorador",
        collectedAt: new Date().toISOString(),
      });
      vi.mocked(getMe).mockResolvedValue({
        id: "1",
        email: "ivan.merchan@gmail.com",
        username: "ivan-merchan",
        name: "Iván Merchán",
      });
    });

    When(
      'I add the sticker "cody-aventuras-01" to my collection',
      async () => {
        try {
          await addStickerAction("cody-aventuras-01");
        } catch (error) {
          redirectedTo = (error as Error).message.replace(
            "NEXT_REDIRECT:",
            "",
          );
        }
      },
    );

    Then("I am redirected to my dashboard", () => {
      expect(redirectedTo).toBe("/dashboard/ivan-merchan");
      expect(addSticker).toHaveBeenCalledWith(
        "valid-token",
        "cody-aventuras-01",
      );
    });
  });

  Scenario(
    "Trying to add a sticker without a session",
    ({ Given, When, Then }) => {
      let redirectedTo: string | undefined;

      Given("I have no session", () => {
        vi.mocked(getSessionToken).mockResolvedValue(null);
      });

      When(
        'I try to add the sticker "cody-aventuras-01" to my collection',
        async () => {
          try {
            await addStickerAction("cody-aventuras-01");
          } catch (error) {
            redirectedTo = (error as Error).message.replace(
              "NEXT_REDIRECT:",
              "",
            );
          }
        },
      );

      Then('I am redirected to "/login"', () => {
        expect(redirectedTo).toBe("/login");
        expect(addSticker).not.toHaveBeenCalled();
      });
    },
  );
});
