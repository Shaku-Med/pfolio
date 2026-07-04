import GalleryCard from "../../../../components/accessories/GalleryCard";
import { Reveal, SectionHeader } from "../../../../components/accessories/Rail/Rail";
import { useContextHook } from "../../../../components/accessories/context/Context";

const GallerySection = () => {
  const { gallery } = useContextHook();
  if (!gallery.length) return null;

  return (
    <section id="gallery" className="space-y-4">
      <SectionHeader title="Gallery" to="/gallery" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gallery.map((item, i) => (
          <Reveal key={item.id} delay={Math.min(i * 0.07, 0.28)} className="min-w-0">
            <GalleryCard to={`/gallery/${item.id}`} item={item} />
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default GallerySection;
