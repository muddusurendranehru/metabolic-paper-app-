/**
 * Step 8 – Twitter/X thread generator from paper title and abstract.
 */

export interface TwitterThreadOptions {
  title: string;
  abstract: string;
  maxTweets?: number;
}

/** Generate a thread of tweet-length strings (placeholder). */
export function generateTwitterThread(opts: TwitterThreadOptions): string[] {
  const { title, abstract, maxTweets = 10 } = opts;
  const lines: string[] = [];
  const chunk = 270; // leave room for " (1/10)" etc.
  let rest = `${title}\n\n${abstract}`;
  while (rest.length > 0 && lines.length < maxTweets) {
    const slice = rest.slice(0, chunk);
    const lastSpace = slice.lastIndexOf(" ");
    const take = lastSpace > chunk * 0.5 ? lastSpace : chunk;
    lines.push(rest.slice(0, take).trim());
    rest = rest.slice(take).trim();
  }
  return lines.filter(Boolean);
}
