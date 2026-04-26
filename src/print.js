/* Print-to-PDF — uses browser print dialog with print CSS */

const $ = (s) => document.querySelector(s);

function printDocument() {
  // Browser will use @media print rules in styles.css
  window.print();
}

export function initPrint() {
  $('#print-btn')?.addEventListener('click', printDocument);
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'p' && $('#reader-view')?.classList.contains('active')) {
      // Let default Cmd+P behave naturally — nothing to do
    }
  });
}
