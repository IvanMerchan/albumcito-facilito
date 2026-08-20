import { Sticker } from "@/app/lib/albums.types";

const STATUS_LABEL: Record<Sticker["status"], string> = {
  owned: "Tengo",
  missing: "Me falta",
  duplicate: "Repetida",
};

const STATUS_STYLE: Record<Sticker["status"], string> = {
  owned: "bg-green-100 text-green-800",
  missing: "bg-gray-100 text-gray-600",
  duplicate: "bg-amber-100 text-amber-800",
};

export default function StickerCard({ sticker }: { sticker: Sticker }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-gray-200 p-3">
      <span className="text-xs font-medium text-gray-400">#{sticker.number}</span>
      <h3 className="text-sm font-semibold">{sticker.name}</h3>
      <span className="text-xs capitalize text-gray-500">{sticker.rarity}</span>
      <span
        className={`w-fit rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[sticker.status]}`}
      >
        {STATUS_LABEL[sticker.status]}
      </span>
    </div>
  );
}
