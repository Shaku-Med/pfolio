import React from "react";
import { Outlet, useLoaderData } from "react-router";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { ContextProvider } from "../components/accessories/context/Context";
import {
  getSelectedProjects,
  getSelectedStack,
  getSelectedBlog,
  getSelectedGallery,
  getExperience,
} from "../lib/database/queries";

export const loader = async () => {
  const [projects, stack, blog_posts, gallery, experience] = await Promise.all([
    getSelectedProjects(4, 0),
    getSelectedStack(3, 0),
    getSelectedBlog(3, 0),
    getSelectedGallery(3, 0),
    getExperience(4, 0),
  ]);

  return { projects, stack, blog_posts, gallery, experience };
};

const Layout = () => {
  const { projects, stack, blog_posts, gallery, experience } =
    useLoaderData<typeof loader>();

    return (
    <>
      <ContextProvider
        projects={projects}
        stack={stack}
        blog_posts={blog_posts}
        gallery={gallery}
        experience={experience}
      >
        <Nav />
        <div className="pt-16 md:pt-18 min-h-screen flex flex-col">
          <div className="flex-1 w-full max-w-6xl mx-auto">
            <Outlet />
          </div>
          <Footer />
        </div>
      </ContextProvider>
    </>
  );
};

export default Layout;
