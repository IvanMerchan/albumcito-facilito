import { cache } from "react";
import { CollectedSticker } from "./collection.types";

const API_URL = process.env.API_URL ?? "http://localhost:3001";

// Mutation, not wrapped in cache() -- same reasoning as signup/login in
// auth-api.ts: cache() memoizes reads for one render pass, wrong for a POST.
export async function addSticker(
  token: string,
  stickerId: string,
): Promise<CollectedSticker> {
  const res = await fetch(`${API_URL}/me/stickers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ stickerId }),
  });
  if (!res.ok) {
    throw new Error(`Failed to add sticker "${stickerId}": ${res.status}`);
  }
  return res.json() as Promise<CollectedSticker>;
}

export const getMyStickers = cache(
  async (token: string): Promise<CollectedSticker[]> => {
    const res = await fetch(`${API_URL}/me/stickers`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch my stickers: ${res.status}`);
    }
    return res.json() as Promise<CollectedSticker[]>;
  },
);
