import { AlbumSummary } from "@/app/lib/albums.types";
import AlbumCard from "./album-card";

export default function AlbumGrid({ albums }: { albums: AlbumSummary[] }) {
  if (albums.length === 0) {
    return <p className="text-gray-600">Todavía no hay álbumes disponibles.</p>;
  }

  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {albums.map((album) => (
        <AlbumCard key={album.id} album={album} />
      ))}
    </div>
  );
}
