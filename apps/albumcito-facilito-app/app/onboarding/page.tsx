import { redirect } from "next/navigation";
import OnboardingAlbumPicker from "@/app/components/onboarding-album-picker";
import { getAlbums } from "@/app/lib/albums-api";
import { getSessionToken } from "@/app/lib/session";

// Reads the session cookie, so this page must render per-request instead of
// being statically prerendered.
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const token = await getSessionToken();
  if (!token) {
    redirect("/login");
  }

  const albums = await getAlbums();

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-8">
      <h1 className="text-3xl font-bold">Elige tu primer álbum</h1>
      <p className="text-base text-gray-600">
        Vas a agregar tu primera estampa a tu colección.
      </p>
      <OnboardingAlbumPicker albums={albums} />
    </main>
  );
}
