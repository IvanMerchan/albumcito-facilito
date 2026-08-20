import Link from "next/link";
import { notFound } from "next/navigation";
import StickerGrid from "@/app/components/sticker-grid";
import { getAlbum } from "@/app/lib/albums-api";

// The album data lives in the backend API, not at build time, so this page
// must render per-request instead of being statically prerendered.
export const dynamic = "force-dynamic";

export default async function AlbumDetailPage({
  params,
}: PageProps<"/albums/[albumId]">) {
  const { albumId } = await params;
  const album = await getAlbum(albumId);

  if (!album) {
    notFound();
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-8">
      <Link href="/" className="self-start text-sm text-gray-500 hover:underline">
        &larr; Volver a los álbumes
      </Link>
      <span className="text-5xl" aria-hidden="true">
        {album.coverEmoji}
      </span>
      <h1 className="text-3xl font-bold">{album.name}</h1>
      <p className="text-base text-gray-600">{album.description}</p>
      <StickerGrid stickers={album.stickers} />
    </main>
  );
}
