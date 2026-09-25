import type { MetaDescriptor } from "react-router";
import type { BlogPost } from "../blog";
import { contact } from "../contact";
import { music } from "../music";
import { BASE_URL, DEFAULT_DESCRIPTION, ICON_512_PATH, SITE_NAME } from "./constants";

const PERSON_ID = `${BASE_URL}/#person`;
const WEBSITE_ID = `${BASE_URL}/#website`;

const person = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: SITE_NAME,
  url: BASE_URL,
  image: `${BASE_URL}${ICON_512_PATH}`,
  jobTitle: "Full Stack Software Engineer",
  description: DEFAULT_DESCRIPTION,
  alumniOf: { "@type": "CollegeOrUniversity", name: "CUNY College of Staten Island" },
  knowsAbout: ["React", "TypeScript", "Node.js", "Go", "Python", "Rust", "C++", "Java", "Kotlin"],
  sameAs: [...contact.links.map((link) => link.href), music.links[0].href],
};

/** Person and WebSite graph for the home page, so search can link the profiles. */
export function homeStructuredData(): MetaDescriptor {
  return {
    "script:ld+json": {
      "@context": "https://schema.org",
      "@graph": [
        person,
        {
          "@type": "WebSite",
          "@id": WEBSITE_ID,
          url: BASE_URL,
          name: SITE_NAME,
          description: DEFAULT_DESCRIPTION,
          publisher: { "@id": PERSON_ID },
          inLanguage: "en",
        },
      ],
    },
  };
}

export function blogPostStructuredData(post: BlogPost, image?: string): MetaDescriptor {
  const url = `${BASE_URL}/blog/${post.id}`;
  return {
    "script:ld+json": {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      url,
      mainEntityOfPage: url,
      ...(image && { image }),
      ...(post.tags?.length && { keywords: post.tags.join(", ") }),
      articleSection: post.category,
      author: { "@type": "Person", name: SITE_NAME, url: BASE_URL },
      publisher: { "@type": "Person", name: SITE_NAME, url: BASE_URL },
    },
  };
}
