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
  /** How development was going: process, pace, team setup. */
  developmentSummary?: string;
  /** Challenges and obstacles we faced. */
  challenges?: string[];
  /** What we learned or would do differently. */
  learnings?: string[];
  /** Extra markdown details only loaded on the detail page. */
  detailsMd?: string;
  /** Manual display order (lower = earlier). */
  position?: number;
};

/**
 * The admin keeps one open "Your company here" slot as a nudge for recruiters.
 * It is not a real job, so the timeline shows it last and llms.txt skips it.
 */
export function isOpenRole(entry: Pick<ExperienceEntry, "company">): boolean {
  return /your company here/i.test(entry.company ?? "");
}
