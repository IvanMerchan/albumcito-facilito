import Link from "next/link";
import { redirect } from "next/navigation";
import LogoutButton from "@/app/components/logout-button";
import { getMe } from "@/app/lib/auth-api";
import { getSessionToken } from "@/app/lib/session";

// The session cookie and the user profile only exist per-request, so this
// page must render per-request instead of being statically prerendered.
export const dynamic = "force-dynamic";

export default async function DashboardPage({
  params,
}: PageProps<"/dashboard/[username]">) {
  const { username } = await params;

  const token = await getSessionToken();
  if (!token) {
    redirect("/login");
  }

  const user = await getMe(token);
  if (!user) {
    redirect("/login");
  }

  if (user.username !== username) {
    redirect(`/dashboard/${user.username}`);
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-8">
      <h1 className="text-3xl font-bold">Hola, {user.name}</h1>
      <p className="text-base text-gray-600">{user.email}</p>
      <Link href="/" className="text-sm text-gray-500 hover:underline">
        Ver todos los álbumes
      </Link>
      <LogoutButton />
    </main>
  );
}
