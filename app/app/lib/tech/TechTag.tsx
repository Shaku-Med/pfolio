import React, { useState } from "react";
import { cn } from "../utils";
import ImgLoader from "../utils/Image/ImgLoader";

type TechMeta = {
  label: string;
  icon?: string;
};

const TECH_META: Record<string, TechMeta> = {
  react: {
    label: "React",
    icon: "react",
  },
  typescript: {
    label: "TypeScript",
    icon: "typescript",
  },
  javascript: {
    label: "JavaScript",
    icon: "javascript",
  },
  node: {
    label: "Node.js",
    icon: "node",
  },
  go: {
    label: "Go",
    icon: "go",
  },
  python: {
    label: "Python",
    icon: "python",
  },
  rust: {
    label: "Rust",
    icon: "rust",
  },
  "c++": {
    label: "C++",
    icon: "cplusplus",
  },
  java: {
    label: "Java",
    icon: "java",
  },
  kotlin: {
    label: "Kotlin",
    icon: "kotlin",
  },
  supabase: {
    label: "Supabase",
    icon: "supabase",
  },
  fastapi: {
    label: "FastAPI",
    icon: "fastapi",
  },
  flask: {
    label: "Flask",
    icon: "flask",
  },
  django: {
    label: "Django",
    icon: "django",
  },
  "machine learning": {
    label: "Machine-Learning",
    icon: "machine-learning",
  },
  sql: {
    label: "SQL",
    icon: "sql",
  },
  postgresql: {
    label: "PostgreSQL",
    icon: "postgresql",
  },
  mysql: {
    label: "MySQL",
    icon: "mysql",
  },
  opencv: {
    label: "OpenCV",
    icon: "opencv",
  },
  firebase: {
    label: "Firebase",
    icon: "firebase",
  },
  git: {
    label: "Git",
    icon: "git",
  },
  github: {
    label: "GitHub",
    icon: "github",
  },
  docker: {
    label: "Docker",
    icon: "docker",
  },
  kubernetes: {
    label: "Kubernetes",
    icon: "kubernetes",
  },
  mongodb: {
    label: "MongoDB",
    icon: "mongodb",
  },
  nextjs: {
    label: "Next.js",
  },
  tailwindcss: {
    label: "Tailwind CSS",
  },
  html: {
    label: "HTML",
  },
  css: {
    label: "CSS",
  },
  gcp: {
    label: "GCP",
  },
  aws: {
    label: "AWS",
  },
  css3: {
    label: "CSS3",
  },
  html5: {
    label: "HTML5",
  },
  "express.js": {
    label: "Express.js",
    icon: "express",
  },
  "node.js": {
    label: "Node.js",
    icon: "node",
  },
  'ci/cd': {
    label: "CI/CD",
  },
  'cloudflare': {
    label: "Cloudflare",
  },
  "github actions": {
    label: "GitHub Actions",
  },
};

function normalizeKey(name: string): string {
  return name.trim().toLowerCase();
}

function getTechMeta(name: string): TechMeta {
  const key = normalizeKey(name);
  const meta = TECH_META[key];
  if (meta) return meta;
  return { label: name };
}

export type TechTagProps = {
  name: string;
  className?: string;
};

export const TechTag: React.FC<TechTagProps> = ({ name, className }) => {
  const meta = getTechMeta(name);
  const [error, setError] = useState(false);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium bg-muted/70 text-foreground border-border/60",
        className,
      )}
    >
      {
        meta.icon && (
          <>
            {
              (!error) && (
              <span className="inline-flex h-3.5 w-3.5 items-center justify-center" aria-hidden="true">
                    <ImgLoader
                      src={`/languages/${meta.icon}.svg`}
                      alt=""
                      className="h-3.5 w-3.5"
                      loading="lazy"
                      onError={() => setError(true)}
                      imageClassName="h-3.5 w-3.5 object-contain"
                    />
                  </span>
            )}
          </>
        )
      }
      <span className="truncate max-w-[7rem]">{meta.label}</span>
    </span>
  );
};
