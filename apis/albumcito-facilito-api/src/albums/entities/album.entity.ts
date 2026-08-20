export type StickerRarity = 'common' | 'rare' | 'legendary';

export type StickerStatus = 'owned' | 'missing' | 'duplicate';

export interface Sticker {
  id: string;
  number: number;
  name: string;
  rarity: StickerRarity;
  status: StickerStatus;
}

export interface Album {
  id: string;
  name: string;
  description: string;
  coverEmoji: string;
  stickers: Sticker[];
}
