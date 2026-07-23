import { useState } from "react";
import { useLoaderData } from "react-router";
import { getResume } from "../../lib/database/queries";
import { MarkdownPreview } from "../../components/accessories/MarkdownPreview";
import { ResumePdfViewer } from "./Accessory/ResumePdfViewer";
import { ResumeSourceView } from "./Accessory/ResumeSourceView";
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
  const resumeTexUrl = process.env.RESUME_TEX_URL || "/resumes/resume.tex";
  return { resumeMd, resumePdfUrl, resumeTexUrl };
};

type ResumeMode = "text" | "pdf" | "source";

const MODES: ReadonlyArray<{ value: ResumeMode; label: string }> = [
  { value: "text", label: "Text" },
  { value: "pdf", label: "Rendered" },
  { value: "source", label: "Source" },
];

const ResumePage = () => {
  const { resumeMd, resumePdfUrl, resumeTexUrl } = useLoaderData<typeof loader>();
  const [mode, setMode] = useState<ResumeMode>("text");

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
        {MODES.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setMode(item.value)}
            aria-pressed={mode === item.value}
            className={`px-3 py-1 rounded-full transition ${
              mode === item.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {mode === "text" &&
        (resumeMd ? (
          <MarkdownPreview content={resumeMd} title="Resume" />
        ) : (
          <p className="text-sm text-muted-foreground">
            The resume isn't up yet. Check back soon.
          </p>
        ))}

      {mode === "pdf" &&
        (resumePdfUrl ? (
          <ResumePdfViewer pdfUrl={resumePdfUrl} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Can't find the PDF right now. Check back soon.
          </p>
        ))}

      {mode === "source" && <ResumeSourceView texUrl={resumeTexUrl} />}
    </section>
  );
};

export default ResumePage;
