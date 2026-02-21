/**
 * Export manuscript preview DOM element to PDF using html2canvas + jspdf.
 * Injects a temporary hex override for Tailwind lab() colors so html2canvas can parse styles.
 */

const TAILWIND_HEX_OVERRIDES = `
:root {
  --color-red-50: #fef2f2; --color-red-100: #fee2e2; --color-red-200: #fecaca; --color-red-600: #dc2626; --color-red-700: #b91c1c; --color-red-800: #991b1b; --color-red-900: #7f1d1d;
  --color-amber-50: #fffbeb; --color-amber-200: #fde68a; --color-amber-700: #b45309;
  --color-yellow-50: #fefce8; --color-yellow-100: #fef9c3; --color-yellow-200: #fef08a; --color-yellow-400: #facc15; --color-yellow-600: #ca8a04; --color-yellow-700: #a16207; --color-yellow-800: #854d0e; --color-yellow-950: #422006;
  --color-green-50: #f0fdf4; --color-green-100: #dcfce7; --color-green-200: #bbf7d0; --color-green-600: #16a34a; --color-green-700: #15803d; --color-green-900: #14532d;
  --color-blue-50: #eff6ff; --color-blue-100: #dbeafe; --color-blue-200: #bfdbfe; --color-blue-600: #2563eb; --color-blue-700: #1d4ed8; --color-blue-900: #1e3a8a;
  --color-indigo-50: #eef2ff; --color-indigo-100: #e0e7ff; --color-indigo-200: #c7d2fe; --color-indigo-300: #a5b4fc; --color-indigo-600: #4f46e5; --color-indigo-700: #4338ca; --color-indigo-800: #3730a3; --color-indigo-900: #312e81;
  --color-gray-50: #fafafa; --color-gray-100: #f4f4f5; --color-gray-200: #e4e4e7; --color-gray-500: #71717a; --color-gray-600: #52525b; --color-gray-700: #3f3f46;
}
[data-pdf-hide] { display: none !important; }
`;

export async function exportPDF(element: HTMLElement, filename: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const html2canvas = (await import('html2canvas')).default;
  const { jsPDF } = await import('jspdf');

  const overrideEl = document.createElement('style');
  overrideEl.id = 'pdf-export-hex-override';
  overrideEl.textContent = TAILWIND_HEX_OVERRIDES;
  document.head.appendChild(overrideEl);

  try {
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
  } finally {
    overrideEl.remove();
  }
}
