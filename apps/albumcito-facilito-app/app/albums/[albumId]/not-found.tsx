import Link from "next/link";

export default function AlbumNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-bold">Ese álbum no existe</h1>
      <Link href="/" className="text-sm text-gray-500 hover:underline">
        &larr; Volver a los álbumes
      </Link>
    </main>
  );
}
