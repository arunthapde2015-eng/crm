import { COMPANY } from '@/constants/company';
import { formatPlaceOfSupply } from '@/constants/states';
import { amountInWords } from '@/utils/amountInWords';
import { formatTwoDecimals } from '@/utils/formatCurrency';
import { getPanFromGstin } from '@/utils/gstin';
import { getGstSplit, getTaxable, getTotal } from '@/utils/lineItems';

import { DocumentPaper } from './DocumentPaper';
import { GstItemsTable } from './GstItemsTable';
import styles from './GstDocument.module.css';

function DetailRow({ label, children }) {
  if (!children) return null;
  return (
    <div className={styles.detailRow}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function TotalsTable({ document }) {
  const { cgst, sgst, igst } = getGstSplit(document);
  const rows = [
    ['Taxable Amount', getTaxable(document)],
    ...(igst > 0
      ? [['IGST', igst]]
      : [
          ['CGST', cgst],
          ['SGST', sgst],
        ]),
  ];
  return (
    <table className={styles.totals}>
      <caption className="visually-hidden">Totals</caption>
      <tbody>
        {rows.map(([label, amount]) => (
          <tr key={label}>
            <th scope="row">{label}</th>
            <td>{formatTwoDecimals(amount)}</td>
          </tr>
        ))}
        <tr className={styles.grandTotal}>
          <th scope="row">Total Amount</th>
          <td>₹{formatTwoDecimals(getTotal(document))}</td>
        </tr>
      </tbody>
    </table>
  );
}

function BankDetails() {
  const { bankName, branch, accountName, accountNumber, ifscCode } = COMPANY.bank;
  const details = [
    ['Bank Name', bankName],
    ['Branch', branch],
    ['A/c Name', accountName],
    ['A/c No.', accountNumber],
    ['IFSC', ifscCode],
  ].filter(([, value]) => value);
  if (details.length === 0) return null;

  return (
    <div className={styles.footerBlock}>
      <p className={styles.footerHeading}>Bank Details</p>
      <dl className={styles.compactList}>
        {details.map(([label, value]) => (
          <DetailRow key={label} label={label}>
            {value}
          </DetailRow>
        ))}
      </dl>
    </div>
  );
}

/**
 * A GST billing document (proforma, tax invoice) on the company letterhead: customer detail
 * beside the document's own details, the item table, totals with the CGST/SGST or IGST split,
 * amount in words, bank details, terms and signature. Always white paper, whatever the app
 * theme, so the screen and the PDF match.
 *
 * @param {object} props
 * @param {string} props.label - Accessible name, e.g. "Proforma document PI-2026-0004".
 * @param {string} props.title - Printed in the box heading, e.g. "Tax Invoice (AMC)".
 * @param {[string, React.ReactNode][]} props.details - Rows beside the customer box.
 * @param {object} props.document - customer, placeOfSupply, items, discountPercent, terms.
 * @param {boolean} [props.showTaxColumns=false] - Show taxable value and GST per line.
 * @param {string} [props.notice] - Small print under the document.
 */
export function GstDocument({ label, title, details, document, showTaxColumns = false, notice }) {
  const { customer } = document;
  const idPrefix = label.replace(/\W+/g, '-');

  return (
    <DocumentPaper label={label} title={title} notice={notice}>
      <div className={styles.parties}>
        <section className={styles.customer} aria-labelledby={`${idPrefix}-customer`}>
          <h4 id={`${idPrefix}-customer`} className={styles.partyHeading}>
            Customer Detail
          </h4>
          <dl className={styles.detailList}>
            <DetailRow label="M/S">{customer.name}</DetailRow>
            <DetailRow label="Address">{customer.address}</DetailRow>
            <DetailRow label="Phone">{customer.phone}</DetailRow>
            <DetailRow label="Email">{customer.email}</DetailRow>
            <DetailRow label="GSTIN">{customer.gstin}</DetailRow>
            <DetailRow label="PAN">{getPanFromGstin(customer.gstin)}</DetailRow>
            <DetailRow label="Place of Supply">
              {formatPlaceOfSupply(document.placeOfSupply)}
            </DetailRow>
          </dl>
        </section>
        <dl className={`${styles.detailList} ${styles.docDetails}`}>
          {details.map(([detailLabel, value]) => (
            <DetailRow key={detailLabel} label={detailLabel}>
              {value}
            </DetailRow>
          ))}
        </dl>
      </div>

      <GstItemsTable document={document} showTaxColumns={showTaxColumns} />

      <div className={styles.footer}>
        <div>
          <div className={styles.footerBlock}>
            <p className={styles.footerHeading}>Total in words</p>
            <p className={styles.words}>{amountInWords(getTotal(document))}</p>
          </div>
          <BankDetails />
          {document.terms && (
            <div className={styles.footerBlock}>
              <p className={styles.footerHeading}>Terms and Conditions</p>
              <p>{document.terms}</p>
            </div>
          )}
        </div>
        <div>
          <TotalsTable document={document} />
          <p className={styles.eoe}>(E &amp; O.E.)</p>
          <div className={styles.signature}>
            <p>
              For <strong>{COMPANY.legalName.toUpperCase()}</strong>
            </p>
            <p className={styles.signatureLine}>Authorised Signatory</p>
          </div>
        </div>
      </div>
    </DocumentPaper>
  );
}
