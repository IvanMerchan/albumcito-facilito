import { StickerRarity } from "./albums.types";

export interface PopularAlbum {
  albumId: string;
  name: string;
  coverEmoji: string;
  collectedCount: number;
}

export interface PopularSticker {
  stickerId: string;
  stickerName: string;
  rarity: StickerRarity;
  albumId: string;
  albumName: string;
  collectedCount: number;
}
