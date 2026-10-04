import { GstDocument } from '@/components/GstDocument';
import { formatDocumentDate, parseIsoDate } from '@/utils/formatDate';

function formatDate(isoDate) {
  return formatDocumentDate(parseIsoDate(isoDate));
}

/**
 * A proforma invoice laid out as the printed GST document.
 *
 * @param {object} props
 * @param {object} props.proforma
 */
export function ProformaDocument({ proforma }) {
  const number = (
    <>
      <strong>{proforma.number}</strong>
      {proforma.revision > 1 && ` (rev. ${proforma.revision})`}
    </>
  );

  return (
    <GstDocument
      label={`Proforma document ${proforma.number}`}
      title="Proforma"
      document={proforma}
      details={[
        ['Proforma No.', number],
        ['Proforma Date', formatDate(proforma.date)],
        ['Valid Till', formatDate(proforma.validTill)],
        ['Quotation Ref.', proforma.quotationRef],
      ]}
      notice="This is a proforma invoice and not a tax invoice."
    />
  );
}
