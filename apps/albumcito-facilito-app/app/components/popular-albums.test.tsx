import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import PopularAlbums from "./popular-albums";
import { PopularAlbum } from "@/app/lib/popular-picks.types";

const albums: PopularAlbum[] = [
  {
    albumId: "cody-aventuras",
    name: "Cody Aventuras",
    coverEmoji: "🗺️",
    collectedCount: 5,
  },
  {
    albumId: "cody-espacio",
    name: "Cody en el Espacio",
    coverEmoji: "🚀",
    collectedCount: 2,
  },
];

test("renders one link per popular album, each pointing to its album page", () => {
  render(<PopularAlbums albums={albums} />);

  const links = screen.getAllByRole("link");
  expect(links).toHaveLength(2);
  expect(links[0].getAttribute("href")).toBe("/albums/cody-aventuras");
  expect(screen.getByText("5 estampas coleccionadas")).toBeDefined();
});

test("renders nothing when there are no popular albums", () => {
  const { container } = render(<PopularAlbums albums={[]} />);
  expect(container.firstChild).toBeNull();
});
