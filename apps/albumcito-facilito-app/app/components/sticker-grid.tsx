import { Sticker } from "@/app/lib/albums.types";
import StickerCard from "./sticker-card";

export default function StickerGrid({ stickers }: { stickers: Sticker[] }) {
  const owned = stickers.filter((sticker) => sticker.status === "owned").length;

  return (
    <div className="flex w-full flex-col gap-4">
      <p className="text-sm font-medium text-gray-600">
        {owned} de {stickers.length} estampas
      </p>
      <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {stickers.map((sticker) => (
          <StickerCard key={sticker.id} sticker={sticker} />
        ))}
      </div>
    </div>
  );
}
