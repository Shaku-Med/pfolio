export type ExperienceEntry = {
  id: string;
  role: string;
  title: string;
  period: string;
  description: string;
  company?: string;
  location?: string;
  logo?: string;
  highlights?: string[];
  tags?: string[];
  /** How development was going – process, pace, team setup. */
  developmentSummary?: string;
  /** Challenges and obstacles we faced. */
  challenges?: string[];
  /** What we learned or would do differently. */
  learnings?: string[];
  /** Extra markdown details only loaded on the detail page. */
  detailsMd?: string;
};

export const experience: ExperienceEntry[] = [
  {
    id: "video-infra",
    role: "Senior Engineer",
    title: "Video infra & tooling",
    period: "2021 – Now",
    company: "Acme Corp",
    location: "Remote",
    logo: "https://ui-avatars.com/api/?name=Acme+Corp&size=128&background=6366f1&color=fff",
    description:
      "Working on high‑volume video pipelines, developer experience, and internal tools. A lot of my day is spent keeping systems boring and reliable.",
    highlights: [
      "Designed and shipped end‑to‑end upload and encoding pipeline handling 10M+ assets/month.",
      "Led migration to HLS delivery with edge caching; cut p99 latency by 40%.",
      "Built internal CLI and dashboards for encoding ops; reduced support load significantly.",
      "Established on‑call practices and runbooks; improved system reliability and incident response.",
    ],
    tags: ["Go", "Redis", "FFmpeg", "HLS", "Terraform", "Observability"],
    developmentSummary:
      "Development ran in two‑week sprints with design and product in the loop. We used RFCs for larger changes and moved fast on incremental improvements. Most work was greenfield at first, then shifted toward scaling and hardening existing systems.",
    challenges: [
      "Legacy encoding jobs had no idempotency; retries caused duplicate outputs and cost spikes. We introduced job keys and idempotent writes.",
      "HLS segment delivery had high p99 from a single region; we added edge caching and saw latency drop but had to tune cache invalidation for live streams.",
      "On‑call load was uneven; we improved runbooks and added better alerting so incidents were caught earlier and required fewer people.",
    ],
    learnings: [
      "Invest in observability early; it pays off when debugging production encoding pipelines.",
      "Keeping the critical path simple (upload → queue → encode → deliver) made it easier to reason about failures.",
      "Documenting runbooks and doing blameless post‑mortems reduced repeat incidents.",
    ],
  },
  {
    id: "saas-dashboards",
    role: "Product Engineer",
    title: "SaaS dashboards & design",
    period: "2018 – 2021",
    company: "Early-stage SaaS",
    location: "Hybrid",
    logo: "https://ui-avatars.com/api/?name=SaaS&size=128&background=64748b&color=fff",
    description:
      "Split time between design and engineering: shaping dashboards, billing flows, and design systems for early‑stage products.",
    highlights: [
      "Owned billing and subscription flows; reduced failed payments and improved self‑serve conversion.",
      "Shipped a design system used across 3 product areas; cut UI inconsistency and dev time.",
      "Collaborated with design on dashboards for analytics and admin; balanced clarity with feature depth.",
    ],
    tags: ["React", "TypeScript", "Figma", "Stripe", "Postgres"],
    developmentSummary:
      "Small product team with tight design–eng collaboration. We shipped in short cycles, often pairing on UI and API. Design system work ran in parallel with feature work so we could dogfood components as we built them.",
    challenges: [
      "Billing edge cases (prorations, failed cards, dunning) were easy to get wrong; we added tests and small state machines to keep behavior predictable.",
      "Design system adoption was inconsistent at first; we introduced usage guidelines and a few lint rules to nudge toward shared components.",
      "Balancing dashboard density with clarity—stakeholders wanted more data; we focused on progressive disclosure and clear empty states.",
    ],
    learnings: [
      "Spending time on empty, loading, and error states made the product feel more reliable than adding features.",
      "A small, shared component library reduced drift and made it easier for design and eng to stay aligned.",
      "Stripe’s APIs and docs were strong; investing in a thin abstraction layer still helped us swap behavior for tests and handle edge cases.",
    ],
  },
];

export function getExperienceById(id: string): ExperienceEntry | undefined {
  return experience.find((e) => e.id === id);
}
