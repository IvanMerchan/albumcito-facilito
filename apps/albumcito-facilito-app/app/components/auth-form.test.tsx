import { expect, test, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach } from "vitest";
import AuthForm from "./auth-form";
import { AuthFormState } from "@/app/lib/auth.types";

afterEach(() => {
  cleanup();
});

test("shows the name field in signup mode but not in login mode", () => {
  render(<AuthForm mode="signup" action={vi.fn()} />);
  expect(screen.getByLabelText("Nombre")).toBeDefined();

  cleanup();

  render(<AuthForm mode="login" action={vi.fn()} />);
  expect(screen.queryByLabelText("Nombre")).toBeNull();
});

test("submits the entered values to the action", async () => {
  const action = vi
    .fn<(state: AuthFormState, formData: FormData) => Promise<AuthFormState>>()
    .mockResolvedValue({});
  const user = userEvent.setup();

  render(<AuthForm mode="login" action={action} />);
  await user.type(screen.getByLabelText("Correo electrónico"), "ivan@example.com");
  await user.type(screen.getByLabelText("Contraseña"), "super-secret");
  await user.click(screen.getByRole("button", { name: "Entrar" }));

  expect(action).toHaveBeenCalledTimes(1);
  const formData = action.mock.calls[0][1];
  expect(formData.get("email")).toBe("ivan@example.com");
  expect(formData.get("password")).toBe("super-secret");
});

test("shows the error message returned by the action", async () => {
  const action = vi
    .fn<(state: AuthFormState, formData: FormData) => Promise<AuthFormState>>()
    .mockResolvedValue({ error: "Correo o contraseña incorrectos." });
  const user = userEvent.setup();

  render(<AuthForm mode="login" action={action} />);
  await user.type(screen.getByLabelText("Correo electrónico"), "ivan@example.com");
  await user.type(screen.getByLabelText("Contraseña"), "wrong-password");
  await user.click(screen.getByRole("button", { name: "Entrar" }));

  expect(
    await screen.findByText("Correo o contraseña incorrectos."),
  ).toBeDefined();
});
