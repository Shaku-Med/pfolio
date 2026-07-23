export type LatexTokenKind =
  | "comment"
  | "command"
  | "env"
  | "math"
  | "delimiter"
  | "text";

export type LatexToken = {
  kind: LatexTokenKind;
  value: string;
};

/**
 * Tokens are matched in priority order. Escapes come first so `\%` is read as
 * a literal percent rather than opening a comment.
 */
const RULES: ReadonlyArray<{ kind: LatexTokenKind; pattern: RegExp }> = [
  { kind: "command", pattern: /\\[a-zA-Z@]+\*?/y },
  { kind: "command", pattern: /\\[^a-zA-Z@\s]/y },
  { kind: "comment", pattern: /%.*/y },
  { kind: "math", pattern: /\$\$?(?:\\.|[^$\\])*\$?\$?/y },
  { kind: "delimiter", pattern: /[{}[\]]/y },
];

const ENV_NAME = /^\{([^{}]*)\}/;

/**
 * Tokenizes a single line of LaTeX. Lines are handled independently: comments
 * are line-scoped in LaTeX anyway, and a resume never spans `$…$` across a
 * newline, so per-line keeps this stateless and cheap.
 */
export function tokenizeLatexLine(line: string): LatexToken[] {
  const tokens: LatexToken[] = [];
  let index = 0;
  let pending = "";

  const flushPending = () => {
    if (pending) {
      tokens.push({ kind: "text", value: pending });
      pending = "";
    }
  };

  while (index < line.length) {
    let matched = false;

    for (const rule of RULES) {
      rule.pattern.lastIndex = index;
      const match = rule.pattern.exec(line);
      if (!match || match[0].length === 0) continue;

      flushPending();
      const value = match[0];
      tokens.push({ kind: rule.kind, value });
      index += value.length;

      // `\begin{center}` / `\end{center}` — colour the environment name too.
      if (value === "\\begin" || value === "\\end") {
        const envMatch = ENV_NAME.exec(line.slice(index));
        if (envMatch) {
          tokens.push({ kind: "delimiter", value: "{" });
          if (envMatch[1]) tokens.push({ kind: "env", value: envMatch[1] });
          tokens.push({ kind: "delimiter", value: "}" });
          index += envMatch[0].length;
        }
      }

      matched = true;
      break;
    }

    if (!matched) {
      pending += line[index];
      index += 1;
    }
  }

  flushPending();
  return tokens;
}

export const LATEX_TOKEN_CLASS: Record<LatexTokenKind, string> = {
  comment: "text-muted-foreground italic",
  command: "text-primary",
  env: "text-[var(--chart-2)]",
  math: "text-[var(--chart-2)]",
  delimiter: "text-muted-foreground",
  text: "",
};
