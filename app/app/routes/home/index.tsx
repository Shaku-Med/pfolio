import HeroSection from "./sections/hero/hero";
import ProjectsSection from "./sections/projects/projects";
import ExperienceSection from "./sections/experience/experience";
import StackSection from "./sections/stack/stack";
import GallerySection from "./sections/gallery/gallery";
import BlogSection from "./sections/blog/blog";
import ContactSection from "./sections/contact/contact";
import MusicSection from "./sections/music/music";
import { buildDefaultMeta, homeStructuredData } from "../../lib/seo";

export function meta() {
  return [...buildDefaultMeta(), homeStructuredData()];
}

const Home = () => {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-4 pb-24 sm:px-5 md:gap-32 md:px-6">
      <HeroSection />
      <ProjectsSection />
      <ExperienceSection />
      <GallerySection />
      <BlogSection />
      <StackSection />
      <MusicSection />
      <ContactSection />
    </main>
  );
};

export default Home;
