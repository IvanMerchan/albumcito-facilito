import Link from "next/link";
import { PopularAlbum } from "@/app/lib/popular-picks.types";

// Omitted entirely (not shown empty) when there's no collection data yet,
// per the popular-picks spec's "Home page presentation" requirement.
export default function PopularAlbums({ albums }: { albums: PopularAlbum[] }) {
  if (albums.length === 0) {
    return null;
  }

  return (
    <section className="flex w-full flex-col gap-4">
      <h2 className="text-xl font-semibold">Álbumes populares</h2>
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {albums.map((album) => (
          <Link
            key={album.albumId}
            href={`/albums/${album.albumId}`}
            className="flex flex-col gap-2 rounded-lg border border-gray-200 p-4 transition hover:border-gray-400 hover:shadow-md"
          >
            <span className="text-4xl" aria-hidden="true">
              {album.coverEmoji}
            </span>
            <h3 className="text-lg font-semibold">{album.name}</h3>
            <p className="text-sm font-medium text-gray-500">
              {album.collectedCount}{" "}
              {album.collectedCount === 1
                ? "estampa coleccionada"
                : "estampas coleccionadas"}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
