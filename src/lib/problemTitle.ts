/** Lowercased, punctuation- and markup-free form of a heading, for comparisons. */
export function normalizeTitle(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`*_~[\]()]/g, "")
    .replace(/&/g, "and")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/**
 * Drops the description's leading markdown heading when it repeats the problem
 * title (the page already shows the title as its H1). Anything else is kept.
 */
export function stripRepeatedTitle(description: string, title: string): string {
  const match = description.match(/^\s*#{1,6}[ \t]+(.+?)[ \t]*#*[ \t]*(?:\r?\n|$)/);
  if (!match || normalizeTitle(match[1]) !== normalizeTitle(title)) return description;
  return description.slice(match[0].length).replace(/^\s*\n/, "");
}
