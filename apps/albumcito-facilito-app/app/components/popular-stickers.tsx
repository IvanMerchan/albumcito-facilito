import { PopularSticker } from "@/app/lib/popular-picks.types";

// Omitted entirely (not shown empty) when there's no collection data yet,
// per the popular-picks spec's "Home page presentation" requirement.
export default function PopularStickers({
  stickers,
}: {
  stickers: PopularSticker[];
}) {
  if (stickers.length === 0) {
    return null;
  }

  return (
    <section className="flex w-full flex-col gap-4">
      <h2 className="text-xl font-semibold">Estampas populares</h2>
      <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {stickers.map((sticker) => (
          <div
            key={sticker.stickerId}
            className="flex flex-col gap-1 rounded-lg border border-gray-200 p-3"
          >
            <h3 className="text-sm font-semibold">{sticker.stickerName}</h3>
            <span className="text-xs capitalize text-gray-500">
              {sticker.rarity}
            </span>
            <span className="text-xs text-gray-400">{sticker.albumName}</span>
            <span className="mt-1 w-fit rounded-full bg-gray-900 px-2 py-0.5 text-xs font-medium text-white">
              Coleccionada {sticker.collectedCount}{" "}
              {sticker.collectedCount === 1 ? "vez" : "veces"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
