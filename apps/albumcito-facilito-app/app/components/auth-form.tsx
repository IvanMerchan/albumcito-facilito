"use client";

import { useActionState } from "react";
import { AuthFormState } from "@/app/lib/auth.types";

type AuthMode = "signup" | "login";

const COPY: Record<AuthMode, { submit: string; pending: string }> = {
  signup: { submit: "Crear cuenta", pending: "Creando cuenta..." },
  login: { submit: "Entrar", pending: "Entrando..." },
};

export default function AuthForm({
  mode,
  action,
}: {
  mode: AuthMode;
  action: (
    state: AuthFormState,
    formData: FormData,
  ) => Promise<AuthFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      {mode === "signup" && (
        <label className="flex flex-col gap-1 text-sm">
          Nombre
          <input
            name="name"
            type="text"
            required
            minLength={2}
            className="rounded-md border border-gray-300 px-3 py-2"
          />
        </label>
      )}
      <label className="flex flex-col gap-1 text-sm">
        Correo electrónico
        <input
          name="email"
          type="email"
          required
          className="rounded-md border border-gray-300 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Contraseña
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="rounded-md border border-gray-300 px-3 py-2"
        />
      </label>
      {state.error && (
        <p role="alert" aria-live="polite" className="text-sm text-amber-800">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? COPY[mode].pending : COPY[mode].submit}
      </button>
    </form>
  );
}
