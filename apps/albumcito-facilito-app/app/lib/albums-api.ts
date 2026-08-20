import { cache } from "react";
import { Album, AlbumSummary } from "./albums.types";

const API_URL = process.env.API_URL ?? "http://localhost:3001";

export const getAlbums = cache(async (): Promise<AlbumSummary[]> => {
  const res = await fetch(`${API_URL}/albums`);
  if (!res.ok) {
    throw new Error(`Failed to fetch albums: ${res.status}`);
  }
  return res.json() as Promise<AlbumSummary[]>;
});

export const getAlbum = cache(async (albumId: string): Promise<Album | null> => {
  const res = await fetch(`${API_URL}/albums/${albumId}`);
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch album "${albumId}": ${res.status}`);
  }
  return res.json() as Promise<Album>;
});
