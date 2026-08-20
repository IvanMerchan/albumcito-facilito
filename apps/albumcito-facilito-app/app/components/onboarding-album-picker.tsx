import Link from "next/link";
import { AlbumSummary } from "@/app/lib/albums.types";

export default function OnboardingAlbumPicker({
  albums,
}: {
  albums: AlbumSummary[];
}) {
  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {albums.map((album) => (
        <Link
          key={album.id}
          href={`/onboarding/${album.id}`}
          className="flex flex-col gap-2 rounded-lg border border-gray-200 p-4 transition hover:border-gray-400 hover:shadow-md"
        >
          <span className="text-4xl" aria-hidden="true">
            {album.coverEmoji}
          </span>
          <h2 className="text-lg font-semibold">{album.name}</h2>
          <p className="text-sm text-gray-600">{album.description}</p>
        </Link>
      ))}
    </div>
  );
}
