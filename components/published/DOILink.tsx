/**
 * Paper 1 (Published) – READ-ONLY.
 * Clickable DOI link to the published paper.
 */

const PAPER1_DOI = "10.61336/jccp/25-08-50";
const PAPER1_DOI_URL = "https://doi.org/10.61336/jccp/25-08-50";

export function DOILink({
  className = "text-blue-600 hover:underline",
  showLabel = true,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  return (
    <a
      href={PAPER1_DOI_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {showLabel ? `DOI: ${PAPER1_DOI}` : PAPER1_DOI}
    </a>
  );
}

export { PAPER1_DOI, PAPER1_DOI_URL };
