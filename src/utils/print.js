const MAX_FILE_NAME_PART_LENGTH = 40;

/** "SWARJY URBAN CO OP…" → "SWARJY-URBAN-CO-OP-…", trimmed for use in a file name. */
export function toFileNamePart(text, maxLength = MAX_FILE_NAME_PART_LENGTH) {
  return text
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .slice(0, maxLength)
    .replace(/-$/, '');
}

/**
 * Opens the print dialog (where "Save as PDF" lives). Browsers suggest the page title as the
 * PDF file name, so the title is swapped for `fileName` while the dialog is open.
 */
export function printWithFileName(fileName) {
  const previousTitle = document.title;
  document.title = fileName;
  try {
    window.print();
  } finally {
    document.title = previousTitle;
  }
}
