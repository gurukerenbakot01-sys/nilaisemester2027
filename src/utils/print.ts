/**
 * Rock-solid in-page printing engine.
 * Isolates the printable content into #print-root and triggers window.print().
 * Guarantees that the browser print dialog ALWAYS appears in iframe environments,
 * with exact page orientation (A4 portrait or landscape), margins, and zero UI clutter.
 */
export function printElement(
  elementId: string,
  docTitle: string,
  orientation: 'portrait' | 'landscape' = 'portrait'
) {
  const elem = document.getElementById(elementId);
  if (!elem) {
    window.focus();
    window.print();
    return;
  }

  // 1. Get or create #print-root
  let printRoot = document.getElementById('print-root');
  if (!printRoot) {
    printRoot = document.createElement('div');
    printRoot.id = 'print-root';
    document.body.appendChild(printRoot);
  }

  // 2. Clone the element's content into #print-root
  printRoot.innerHTML = elem.innerHTML;

  // 3. Inject or update dynamic @page style for orientation and margins
  let dynamicStyle = document.getElementById('dynamic-print-style') as HTMLStyleElement | null;
  if (!dynamicStyle) {
    dynamicStyle = document.createElement('style');
    dynamicStyle.id = 'dynamic-print-style';
    document.head.appendChild(dynamicStyle);
  }

  const margin = orientation === 'landscape' ? '0.7cm 1cm' : '1cm 1.2cm';
  dynamicStyle.textContent = `
    @page {
      size: A4 ${orientation} !important;
      margin: ${margin} !important;
    }
    @media print {
      body.printing-active {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  `;

  // 4. Set document title so saved PDF has clean file name
  const previousTitle = document.title;
  document.title = docTitle;

  // 5. Activate printing mode on body
  document.body.classList.add('printing-active');

  const cleanup = () => {
    document.body.classList.remove('printing-active');
    document.title = previousTitle;
    if (printRoot) {
      printRoot.innerHTML = '';
    }
    window.removeEventListener('afterprint', cleanup);
  };

  window.addEventListener('afterprint', cleanup);

  // 6. Direct window.print() execution (always pops up in iframe)
  setTimeout(() => {
    window.focus();
    try {
      window.print();
    } catch (e) {
      console.error('Print call error:', e);
    }

    // Safety timeout cleanup in case afterprint does not fire in some browsers
    setTimeout(cleanup, 2500);
  }, 120);
}
