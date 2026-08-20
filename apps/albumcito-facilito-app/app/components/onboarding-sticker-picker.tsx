import { addStickerAction } from "@/app/actions/collection";
import { Sticker } from "@/app/lib/albums.types";

export default function OnboardingStickerPicker({
  stickers,
}: {
  stickers: Sticker[];
}) {
  return (
    <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {stickers.map((sticker) => (
        <form
          key={sticker.id}
          action={addStickerAction.bind(null, sticker.id)}
        >
          <button
            type="submit"
            className="flex w-full flex-col gap-1 rounded-lg border border-gray-200 p-3 text-left transition hover:border-gray-400 hover:shadow-md"
          >
            <span className="text-xs font-medium text-gray-400">
              #{sticker.number}
            </span>
            <h3 className="text-sm font-semibold">{sticker.name}</h3>
            <span className="text-xs capitalize text-gray-500">
              {sticker.rarity}
            </span>
            <span className="mt-1 w-fit rounded-full bg-gray-900 px-2 py-0.5 text-xs font-medium text-white">
              La tengo
            </span>
          </button>
        </form>
      ))}
    </div>
  );
}
