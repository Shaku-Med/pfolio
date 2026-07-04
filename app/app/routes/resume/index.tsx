import { useState } from "react";
import { useLoaderData } from "react-router";
import { getResume } from "../../lib/database/queries";
import { MarkdownPreview } from "../../components/accessories/MarkdownPreview";
import { ResumePdfViewer } from "./Accessory/ResumePdfViewer";
import { RailGlyph, Reveal } from "../../components/accessories/Rail/Rail";
import { buildPageMeta } from "../../lib/seo";

export function meta() {
  return buildPageMeta({
    title: "Resume | Mohamed Amara",
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
      <Reveal>
        <header className="space-y-2">
          <h1 className="flex items-center gap-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            <RailGlyph className="h-3 w-8" />
            Resume
          </h1>
        </header>
      </Reveal>

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
            The resume isn't up yet. Check back soon.
          </p>
        )
      ) : resumePdfUrl ? (
        <ResumePdfViewer pdfUrl={resumePdfUrl} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Can't find the PDF right now. Check back soon.
        </p>
      )}
    </section>
  );
};

export default ResumePage;
