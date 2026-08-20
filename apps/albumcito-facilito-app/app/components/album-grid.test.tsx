import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import AlbumGrid from "./album-grid";
import { AlbumSummary } from "@/app/lib/albums.types";

const albums: AlbumSummary[] = [
  {
    id: "cody-aventuras",
    name: "Cody Aventuras",
    description: "Cody explora selvas y montañas.",
    coverEmoji: "🗺️",
    totalStickers: 10,
    ownedStickers: 4,
  },
  {
    id: "cody-espacio",
    name: "Cody en el Espacio",
    description: "Cody viaja entre planetas.",
    coverEmoji: "🚀",
    totalStickers: 9,
    ownedStickers: 3,
  },
];

test("renders one card per album, each linking to its album page", () => {
  render(<AlbumGrid albums={albums} />);

  const links = screen.getAllByRole("link");
  expect(links).toHaveLength(2);
  expect(links[0].getAttribute("href")).toBe("/albums/cody-aventuras");
  expect(links[1].getAttribute("href")).toBe("/albums/cody-espacio");
});

test("shows an empty state when there are no albums", () => {
  render(<AlbumGrid albums={[]} />);
  expect(screen.getByText("Todavía no hay álbumes disponibles.")).toBeDefined();
});
