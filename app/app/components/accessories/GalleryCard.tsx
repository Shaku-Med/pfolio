import { Card, Button } from "@heroui/react";
import { Link } from "react-router";
import type { GalleryItem } from "../../lib/gallery";
import ImgLoader from "~/lib/utils/Image/ImgLoader";

type GalleryCardProps = {
  item: GalleryItem;
  to?: string;
};

export default function GalleryCard({ item, to }: GalleryCardProps) {
  const src =
    item.src && item.src.startsWith("http")
      ? item.src
      : `/api/load/image${item.src}`;
  const card = (
    <Card
      className="relative p-0 flex min-h-[220px] flex-col overflow-hidden rounded-3xl border border-border/70 bg-background/80"
    >
      <ImgLoader
        src={src}
        alt={item.title}
        aria-hidden="true"
        className="absolute inset-0"
        imageClassName="h-full w-full object-cover"
        loading="lazy"
      />
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-t ${
          item.tone === "dark"
            ? "from-black/80 via-black/40 to-black/10"
            : "from-background/85 via-background/30 to-background/10"
        }`}
      />
      <Card.Header className="relative z-10 px-4 pt-4">
        <Card.Title
          className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${
            item.tone === "dark" ? "text-white/80" : "text-black/70"
          }`}
        >
          {item.title}
        </Card.Title>
        <Card.Description
          className={`text-xs font-medium ${
            item.tone === "dark" ? "text-white/65" : "text-black/60"
          }`}
        >
          {item.subtitle}
        </Card.Description>
      </Card.Header>
    </Card>
  );

  if (to) {
    return (
      <Link to={to} className="block">
        {card}
      </Link>
    );
  }

  return card;
}
