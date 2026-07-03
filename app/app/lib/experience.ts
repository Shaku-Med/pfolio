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
