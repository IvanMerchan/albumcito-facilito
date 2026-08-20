import Link from "next/link";
import { redirect } from "next/navigation";
import LogoutButton from "@/app/components/logout-button";
import { getMe } from "@/app/lib/auth-api";
import { getMyStickers } from "@/app/lib/collection-api";
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

  const stickers = await getMyStickers(token);

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-8">
      <h1 className="text-3xl font-bold">Hola, {user.name}</h1>
      <p className="text-base text-gray-600">{user.email}</p>
      <p className="text-sm font-medium text-gray-600">
        {stickers.length === 0
          ? "Todavía no tienes estampas en tu colección."
          : `Tienes ${stickers.length} ${stickers.length === 1 ? "estampa" : "estampas"} en tu colección.`}
      </p>
      {stickers.length > 0 && (
        <p className="text-sm text-gray-500">
          Tu primera estampa: {stickers[0].stickerName}
        </p>
      )}
      <Link href="/" className="text-sm text-gray-500 hover:underline">
        Ver todos los álbumes
      </Link>
      <LogoutButton />
    </main>
  );
}
