import { loadFeature, describeFeature } from "@amiceli/vitest-cucumber";
import { expect, vi } from "vitest";
import { loginAction } from "@/app/actions/auth";
import { login } from "@/app/lib/auth-api";
import { createSession } from "@/app/lib/session";
import { AuthFormState } from "@/app/lib/auth.types";

vi.mock("@/app/lib/auth-api", () => ({
  login: vi.fn(),
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

const feature = await loadFeature("./login.feature");

describeFeature(feature, ({ Scenario }) => {
  Scenario("Logging in with the correct password", ({ Given, When, Then }) => {
    let redirectedTo: string | undefined;

    Given('the login will succeed for "ivan.merchan@gmail.com"', () => {
      vi.mocked(login).mockResolvedValue({
        accessToken: "token-123",
        user: {
          id: "1",
          email: "ivan.merchan@gmail.com",
          username: "ivan-merchan",
          name: "Iván Merchán",
        },
      });
    });

    When(
      'I submit the login form with email "ivan.merchan@gmail.com" and password "super-secret"',
      async () => {
        try {
          await loginAction(
            {},
            formData({
              email: "ivan.merchan@gmail.com",
              password: "super-secret",
            }),
          );
        } catch (error) {
          redirectedTo = (error as Error).message.replace(
            "NEXT_REDIRECT:",
            "",
          );
        }
      },
    );

    Then('I am redirected to "/dashboard/ivan-merchan"', () => {
      expect(redirectedTo).toBe("/dashboard/ivan-merchan");
      expect(createSession).toHaveBeenCalledWith("token-123");
    });
  });

  Scenario("Logging in with the wrong password", ({ Given, When, Then }) => {
    let result: AuthFormState | undefined;

    Given("the login will fail because the password is wrong", () => {
      vi.mocked(login).mockResolvedValue(null);
    });

    When(
      'I submit the login form with email "ivan.merchan@gmail.com" and password "wrong-password"',
      async () => {
        result = await loginAction(
          {},
          formData({
            email: "ivan.merchan@gmail.com",
            password: "wrong-password",
          }),
        );
      },
    );

    Then('I see the message "Correo o contraseña incorrectos."', () => {
      expect(result?.error).toBe("Correo o contraseña incorrectos.");
    });
  });
});
