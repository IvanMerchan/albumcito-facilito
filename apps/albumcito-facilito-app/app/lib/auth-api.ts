import { cache } from "react";
import { AuthResponse, AuthUser, LoginInput, SignupInput } from "./auth.types";

const API_URL = process.env.API_URL ?? "http://localhost:3001";

// Mutations are not wrapped in cache(): cache() memoizes reads for the
// duration of one render pass, which would be wrong for a POST.

// Returns null when the email is already registered (409), the same
// "expected failure maps to null" convention getAlbum() uses for 404.
export async function signup(
  input: SignupInput,
): Promise<AuthResponse | null> {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (res.status === 409) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`Failed to sign up: ${res.status}`);
  }
  return res.json() as Promise<AuthResponse>;
}

// Returns null for 401 (wrong email or password).
export async function login(input: LoginInput): Promise<AuthResponse | null> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (res.status === 401) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`Failed to log in: ${res.status}`);
  }
  return res.json() as Promise<AuthResponse>;
}

// Returns null for 401 (missing, invalid or expired token).
export const getMe = cache(async (token: string): Promise<AuthUser | null> => {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch the current user: ${res.status}`);
  }
  return res.json() as Promise<AuthUser>;
});
