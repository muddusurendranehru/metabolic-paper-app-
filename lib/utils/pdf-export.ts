/**
 * Export manuscript preview DOM element to PDF using html2canvas + jspdf.
 */

export async function exportPDF(element: HTMLElement, filename: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const html2canvas = (await import('html2canvas')).default;
  const { jsPDF } = await import('jspdf');

  const canvas = await html2canvas(element, {
    scale: 3,
    useCORS: true,
    logging: false,
  });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const ratio = pageW / canvas.width;
  const imgH = canvas.height * ratio;
  let heightLeft = imgH;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, pageW, imgH);
  heightLeft -= pageH;

  while (heightLeft > 0) {
    position = heightLeft - imgH;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, pageW, imgH);
    heightLeft -= pageH;
  }

  pdf.save(filename);
}
