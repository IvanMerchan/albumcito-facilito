import { cache } from "react";
import { PopularAlbum, PopularSticker } from "./popular-picks.types";

const API_URL = process.env.API_URL ?? "http://localhost:3001";

export const getPopularAlbums = cache(async (): Promise<PopularAlbum[]> => {
  const res = await fetch(`${API_URL}/popular-picks/albums`);
  if (!res.ok) {
    throw new Error(`Failed to fetch popular albums: ${res.status}`);
  }
  return res.json() as Promise<PopularAlbum[]>;
});

export const getPopularStickers = cache(
  async (): Promise<PopularSticker[]> => {
    const res = await fetch(`${API_URL}/popular-picks/stickers`);
    if (!res.ok) {
      throw new Error(`Failed to fetch popular stickers: ${res.status}`);
    }
    return res.json() as Promise<PopularSticker[]>;
  },
);
