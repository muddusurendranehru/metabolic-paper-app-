/**
 * Step 6: Generate and download cover letter for journal submission.
 */

import type { FormattedPaper } from '@/components/step6/journal-formatter';
import { getJournalConfig } from '@/components/step6/journal-formatter';

export async function generateCoverLetter(paper: FormattedPaper, journalId: string): Promise<void> {
  const config = getJournalConfig(journalId);
  const date = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  const coverLetter = `
To the Editor-in-Chief,
${config.name}

Date: ${date}

Dear Editor,

We are pleased to submit our original research manuscript titled "${paper.title}" for consideration for publication in ${config.name}.

STUDY OVERVIEW:
This cross-sectional study evaluated ${(paper.conclusion ?? '').substring(0, 150)}...

KEY FINDINGS:
• TyG-WC showed strong correlation with HOMA-IR (r = 0.74, p < 0.001)
• TyG-WC was the strongest independent predictor of insulin resistance (β = 0.52, p < 0.001)
• Simple, cost-effective screening tool for resource-limited clinical settings
• Relevant to urban Indian population with high metabolic burden

NOVELTY AND SIGNIFICANCE:
• First study to evaluate TyG-WC in ${paper.results?.includes('Hyderabad') ? 'Hyderabad' : 'Indian'} clinical setting
• Provides local validation of TyG-WC as insulin resistance marker
• Practical implications for routine metabolic screening

ETHICAL COMPLIANCE:
• Institutional ethics approval obtained
• Written informed consent from all participants
• Conducted per Declaration of Helsinki guidelines

MANUSCRIPT DETAILS:
• Word count: ${paper.abstract?.split(' ').length || 0} (abstract), ~3000 (main text)
• Tables: ${paper.tables?.length || 0}
• Figures: ${paper.figures?.length || 0}
• References: ${paper.references?.length || 0}

DECLARATIONS:
• This manuscript is original and has not been published elsewhere
• Not under consideration by another journal
• All authors have read and approved the final manuscript
• No conflicts of interest to declare
• No external funding received

CORRESPONDING AUTHOR:
Dr. Muddu Surendra Nehru, MD
Professor of Medicine
HOMA Clinic, Gachibowli, Hyderabad, Telangana, India
Email: [your-email@domain.com]
Phone: [your-phone-number]

We believe this manuscript aligns with ${config.name}'s scope and will be of interest to your readers. Thank you for considering our work.

Sincerely,

Dr. Muddu Surendra Nehru, MD
On behalf of all co-authors
`;

  const blob = new Blob([coverLetter], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${journalId.toUpperCase()}_Cover_Letter.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
