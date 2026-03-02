import HeroSection from "./sections/hero/hero";
import ProjectsSection from "./sections/projects/projects";
import ExperienceSection from "./sections/experience/experience";
import StackSection from "./sections/stack/stack";
import GallerySection from "./sections/gallery/gallery";
import BlogSection from "./sections/blog/blog";

const Home = () => {
  return (
    <main className="mx-auto w-full max-w-6xl flex flex-col gap-14 px-4 py-5 sm:px-5 sm:py-5 md:gap-16 md:px-6 md:py-24">
      <HeroSection />
      <ProjectsSection />
      <ExperienceSection />
      <GallerySection />
      <BlogSection />
      <StackSection />
    </main>
  );
};

export default Home;
