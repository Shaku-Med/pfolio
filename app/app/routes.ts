import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    route(`/`, `routes/layout.tsx`, [
        index(`routes/home/index.tsx`),
        route("projects", "routes/projects/layout.tsx", [
            index("routes/projects/index.tsx"),
            route(":id", "routes/projects/$id/index.tsx"),
        ]),
        route("experience", "routes/experience/layout.tsx", [
            index("routes/experience/index.tsx"),
            route(":id", "routes/experience/$id/index.tsx"),
        ]),
        route("stack", "routes/stack/layout.tsx", [
            index("routes/stack/index.tsx"),
            route(":id", "routes/stack/$id/index.tsx"),
        ]),
        route("gallery", "routes/gallery/layout.tsx", [
            index("routes/gallery/index.tsx"),
            route(":id", "routes/gallery/$id/index.tsx"),
        ]),
        route("blog", "routes/blog/layout.tsx", [
            index("routes/blog/index.tsx"),
            route(":id", "routes/blog/$id/index.tsx"),
        ]),
        route("tags", "routes/tags/layout.tsx", [
            route(":tag", "routes/tags/$tag/index.tsx"),
        ]),
        route("search", "routes/search/index.tsx"),
        route("resume", "routes/resume/layout.tsx", [
            index("routes/resume/index.tsx"),
        ]),
        route("*", "routes/not-found.tsx"),

        route(`/contact`, `routes/contact/layout.tsx`, [
            index(`routes/contact/index.tsx`),
        ]),
        route("set-theme", "routes/api.set-theme.tsx"),
        route("settings", "routes/settings/layout.tsx", [
            index("routes/settings/index.tsx"),
        ]),

    ]),
    route("sitemap.xml", "routes/sitemap[.]xml.tsx"),
    route('api', 'routes/api/layout.tsx', [
        route('load', 'routes/api/load/layout.tsx', [
            route('image/*', 'routes/api/load/image/index.tsx'),
        ]),
        route('data', 'routes/api/data/layout.tsx', [
            route('projects', 'routes/api/data/projects.tsx'),
            route('experience', 'routes/api/data/experience.tsx'),
            route('stack', 'routes/api/data/stack.tsx'),
            route('gallery', 'routes/api/data/gallery.tsx'),
            route('blog', 'routes/api/data/blog.tsx'),
            route('search', 'routes/api/data/search.tsx'),
        ]),
    ]),
] satisfies RouteConfig;
