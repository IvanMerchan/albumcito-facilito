import Link from "next/link";
import AlbumGrid from "@/app/components/album-grid";
import PopularAlbums from "@/app/components/popular-albums";
import PopularStickers from "@/app/components/popular-stickers";
import { getAlbums } from "@/app/lib/albums-api";
import { getPopularAlbums, getPopularStickers } from "@/app/lib/popular-picks-api";

// The album list lives in the backend API, not at build time, so this page
// must render per-request instead of being statically prerendered.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [albums, popularAlbums, popularStickers] = await Promise.all([
    getAlbums(),
    getPopularAlbums(),
    getPopularStickers(),
  ]);

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-8">
      <h1 className="text-3xl font-bold">Albumcito Facilito</h1>
      <p className="text-base text-gray-600">
        Colecciona tus álbumes de estampas y controla qué te falta.
      </p>
      <p className="text-sm text-gray-500">
        <Link href="/login" className="hover:underline">
          Inicia sesión
        </Link>{" "}
        o{" "}
        <Link href="/signup" className="hover:underline">
          crea una cuenta
        </Link>
      </p>
      <PopularAlbums albums={popularAlbums} />
      <PopularStickers stickers={popularStickers} />
      <AlbumGrid albums={albums} />
    </main>
  );
}
