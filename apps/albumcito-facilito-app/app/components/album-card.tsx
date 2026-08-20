import Link from "next/link";
import { AlbumSummary } from "@/app/lib/albums.types";

export default function AlbumCard({ album }: { album: AlbumSummary }) {
  return (
    <Link
      href={`/albums/${album.id}`}
      className="flex flex-col gap-2 rounded-lg border border-gray-200 p-4 transition hover:border-gray-400 hover:shadow-md"
    >
      <span className="text-4xl" aria-hidden="true">
        {album.coverEmoji}
      </span>
      <h2 className="text-lg font-semibold">{album.name}</h2>
      <p className="text-sm text-gray-600">{album.description}</p>
      <p className="text-sm font-medium text-gray-500">
        {album.ownedStickers} de {album.totalStickers} estampas
      </p>
    </Link>
  );
}
