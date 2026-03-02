import { useState } from "react";
import { useLoaderData } from "react-router";
import { getResume } from "../../lib/database/queries";
import { MarkdownPreview } from "../../components/accessories/MarkdownPreview";
import { ResumePdfViewer } from "./Accessory/ResumePdfViewer";
import { buildPageMeta } from "../../lib/seo";

export function meta() {
  return buildPageMeta({
    title: "Resume – Mohamed Amara",
    description: "View the latest version of my resume as rich text or as a PDF.",
    canonicalPath: "/resume",
  });
}

export const loader = async () => {
  const resume = await getResume();
  const resumeMd = resume?.body_md ?? "";
  const resumePdfUrl = process.env.RESUME_PDF_URL || "/resumes/resume.pdf";
  return { resumeMd, resumePdfUrl };
};

const ResumePage = () => {
  const { resumeMd, resumePdfUrl } = useLoaderData<typeof loader>();
  const [mode, setMode] = useState<"text" | "pdf">("text");

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Resume
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          View the latest version of my resume as rich text or as a PDF.
        </p>
      </header>

      <div className="inline-flex rounded-full border border-border bg-muted/60 p-1 text-xs sm:text-sm">
        <button
          type="button"
          onClick={() => setMode("text")}
          className={`px-3 py-1 rounded-full transition ${
            mode === "text"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          Text
        </button>
        <button
          type="button"
          onClick={() => setMode("pdf")}
          className={`px-3 py-1 rounded-full transition ${
            mode === "pdf"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          PDF
        </button>
      </div>

      {mode === "text" ? (
        resumeMd ? (
          <MarkdownPreview content={resumeMd} title="Resume" />
        ) : (
          <p className="text-sm text-muted-foreground">
            Resume content is not available yet. Please check back later.
          </p>
        )
      ) : resumePdfUrl ? (
        <ResumePdfViewer pdfUrl={resumePdfUrl} />
      ) : (
        <p className="text-sm text-muted-foreground">
          We can't seem to find the resume PDF. Please check back later.
        </p>
      )}
    </section>
  );
};

export default ResumePage;
