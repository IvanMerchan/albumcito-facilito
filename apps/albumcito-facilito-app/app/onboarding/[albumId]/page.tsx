import { notFound, redirect } from "next/navigation";
import OnboardingStickerPicker from "@/app/components/onboarding-sticker-picker";
import { getAlbum } from "@/app/lib/albums-api";
import { getSessionToken } from "@/app/lib/session";

// Reads the session cookie and the backend, so this page must render
// per-request instead of being statically prerendered.
export const dynamic = "force-dynamic";

export default async function OnboardingAlbumPage({
  params,
}: PageProps<"/onboarding/[albumId]">) {
  const { albumId } = await params;

  const token = await getSessionToken();
  if (!token) {
    redirect("/login");
  }

  const album = await getAlbum(albumId);
  if (!album) {
    notFound();
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-8">
      <span className="text-5xl" aria-hidden="true">
        {album.coverEmoji}
      </span>
      <h1 className="text-3xl font-bold">{album.name}</h1>
      <p className="text-base text-gray-600">Elige tu primera estampa</p>
      <OnboardingStickerPicker stickers={album.stickers} />
    </main>
  );
}
