export type StickerRarity = "common" | "rare" | "legendary";

export type StickerStatus = "owned" | "missing" | "duplicate";

export interface Sticker {
  id: string;
  number: number;
  name: string;
  rarity: StickerRarity;
  status: StickerStatus;
}

export interface AlbumSummary {
  id: string;
  name: string;
  description: string;
  coverEmoji: string;
  totalStickers: number;
  ownedStickers: number;
}

export interface Album extends AlbumSummary {
  stickers: Sticker[];
}
