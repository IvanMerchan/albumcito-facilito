import { loadFeature, describeFeature } from "@amiceli/vitest-cucumber";
import { expect, vi } from "vitest";
import { signupAction } from "@/app/actions/auth";
import { signup } from "@/app/lib/auth-api";
import { createSession } from "@/app/lib/session";
import { AuthFormState } from "@/app/lib/auth.types";

vi.mock("@/app/lib/auth-api", () => ({
  signup: vi.fn(),
}));
vi.mock("@/app/lib/session", () => ({
  createSession: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

function formData(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }
  return data;
}

const feature = await loadFeature("./signup.feature");

describeFeature(feature, ({ Scenario }) => {
  Scenario("Signing up successfully", ({ Given, When, Then }) => {
    let result: AuthFormState | undefined;
    let redirectedTo: string | undefined;

    Given(
      'the signup will succeed for "ivan.merchan@gmail.com"',
      () => {
        vi.mocked(signup).mockResolvedValue({
          accessToken: "token-123",
          user: {
            id: "1",
            email: "ivan.merchan@gmail.com",
            username: "ivan-merchan",
            name: "Iván Merchán",
          },
        });
      },
    );

    When(
      'I submit the signup form with name "Iván Merchán", email "ivan.merchan@gmail.com" and password "super-secret"',
      async () => {
        try {
          result = await signupAction(
            {},
            formData({
              name: "Iván Merchán",
              email: "ivan.merchan@gmail.com",
              password: "super-secret",
            }),
          );
        } catch (error) {
          redirectedTo = (error as Error).message.replace("NEXT_REDIRECT:", "");
        }
      },
    );

    Then('I am redirected to "/onboarding"', () => {
      expect(redirectedTo).toBe("/onboarding");
      expect(createSession).toHaveBeenCalledWith("token-123");
      expect(result).toBeUndefined();
    });
  });

  Scenario(
    "Signing up with an email that is already registered",
    ({ Given, When, Then }) => {
      let result: AuthFormState | undefined;

      Given("the signup will fail because the email is already registered", () => {
        vi.mocked(signup).mockResolvedValue(null);
      });

      When(
        'I submit the signup form with name "Iván Merchán", email "ivan.merchan@gmail.com" and password "super-secret"',
        async () => {
          result = await signupAction(
            {},
            formData({
              name: "Iván Merchán",
              email: "ivan.merchan@gmail.com",
              password: "super-secret",
            }),
          );
        },
      );

      Then(
        'I see the message "Ese correo ya está registrado. Inicia sesión."',
        () => {
          expect(result?.error).toBe(
            "Ese correo ya está registrado. Inicia sesión.",
          );
        },
      );
    },
  );
});
