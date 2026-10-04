import { GstDocument } from '@/components/GstDocument';
import { formatDocumentDate, parseIsoDate } from '@/utils/formatDate';

import { getDocumentTitle } from '../utils/invoices';

function formatDate(isoDate) {
  return formatDocumentDate(parseIsoDate(isoDate));
}

/**
 * A sales invoice as the printed GST tax invoice, with taxable value and GST on every line.
 *
 * @param {object} props
 * @param {object} props.invoice
 */
export function InvoiceDocument({ invoice }) {
  return (
    <GstDocument
      label={`Invoice document ${invoice.number}`}
      title={getDocumentTitle(invoice)}
      document={invoice}
      showTaxColumns
      details={[
        ['Invoice No.', <strong key="number">{invoice.number}</strong>],
        ['Invoice Date', formatDate(invoice.date)],
        ['Due Date', formatDate(invoice.dueDate)],
      ]}
    />
  );
}
