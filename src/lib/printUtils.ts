import React from 'react';
import { createRoot } from 'react-dom/client';

/**
 * Utility to print a React component in a new window
 */
export const printComponent = (component: React.ReactElement, title: string = 'Documento') => {
  const printWindow = window.open('', '_blank', 'width=800,height=1000');
  if (!printWindow) {
    alert('Por favor, permita pop-ups para imprimir o documento.');
    return;
  }

  // Basic styling for the print window to match the component's needs
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta charset="UTF-8">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@400;700&display=swap" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
          tailwind.config = {
            theme: {
              extend: {
                fontFamily: {
                  serif: ['"Playfair Display"', 'serif'],
                  sans: ['Inter', 'sans-serif'],
                },
              }
            }
          }
        </script>
        <style>
          @media print {
            @page { margin: 20mm; }
            body { -webkit-print-color-adjust: exact; }
            .page-break { page-break-before: always; }
          }
          body { font-family: 'Inter', sans-serif; }
          h1, h2, h3 { font-family: 'Playfair Display', serif; }
        </style>
      </head>
      <body>
        <div id="print-root"></div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for Tailwind to load and then render the component
  setTimeout(() => {
    const container = printWindow.document.getElementById('print-root');
    if (container) {
      const root = createRoot(container);
      root.render(component);
      
      // Give it time to render images or fonts if any
      setTimeout(() => {
        printWindow.print();
        // Option to close after print
        // printWindow.close();
      }, 500);
    }
  }, 500);
};
