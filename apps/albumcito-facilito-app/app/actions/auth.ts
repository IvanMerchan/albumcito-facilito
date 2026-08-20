"use server";

import { redirect } from "next/navigation";
import { login, signup } from "@/app/lib/auth-api";
import { AuthFormState } from "@/app/lib/auth.types";
import { createSession, deleteSession } from "@/app/lib/session";

export async function signupAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    return { error: "Completa todos los campos." };
  }
  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }

  try {
    const auth = await signup({ name, email, password });
    if (!auth) {
      return { error: "Ese correo ya está registrado. Inicia sesión." };
    }
    await createSession(auth.accessToken);
  } catch {
    return { error: "No pudimos crear tu cuenta. Inténtalo de nuevo." };
  }

  // redirect() throws internally, so it must stay outside the try/catch above
  // -- catching it there would swallow the navigation. Onboarding (not the
  // dashboard) is the mandatory next stop right after signup.
  redirect("/onboarding");
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Completa todos los campos." };
  }

  let username: string;
  try {
    const auth = await login({ email, password });
    if (!auth) {
      return { error: "Correo o contraseña incorrectos." };
    }
    await createSession(auth.accessToken);
    username = auth.user.username;
  } catch {
    return { error: "No pudimos iniciar sesión. Inténtalo de nuevo." };
  }

  redirect(`/dashboard/${username}`);
}

export async function logoutAction(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
