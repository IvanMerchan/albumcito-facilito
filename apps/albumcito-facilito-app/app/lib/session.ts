import { cookies } from "next/headers";

const SESSION_COOKIE = "session";

// Matches the backend token expiry (JwtModule signOptions.expiresIn = "7d").
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

// Readable from Server Components. NOT marked "use server" -- that directive
// would publish every export of this file as a POST endpoint reachable from
// any browser, which must never happen to a cookie-writing helper.
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

// Only callable from a Server Action or Route Handler: HTTP cannot set
// cookies once the response has started streaming, so this throws if called
// during a Server Component's render.
export async function createSession(accessToken: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
