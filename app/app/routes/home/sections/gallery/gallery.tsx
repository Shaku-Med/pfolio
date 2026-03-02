import { Link } from "react-router";
import GalleryCard from "../../../../components/accessories/GalleryCard";
import { useContextHook } from "../../../../components/accessories/context/Context";

const GallerySection = () => {
  const { gallery } = useContextHook();
  if (!gallery.length) return null;

  return (
    <section id="gallery" className="space-y-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold tracking-tight">Gallery</h2>
        <Link
          to="/gallery"
          className="text-xs font-medium text-primary hover:underline"
        >
          View more
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gallery.map((item) => (
          <div key={item.id} className="min-w-0">
            <GalleryCard to={`/gallery/${item.id}`} item={item} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default GallerySection;

