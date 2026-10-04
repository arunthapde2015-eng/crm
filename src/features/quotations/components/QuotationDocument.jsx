import logoUrl from '@/assets/logo.png';
import { COMPANY } from '@/constants/company';
import { amountInWords } from '@/utils/amountInWords';
import { formatCurrencyExact } from '@/utils/formatCurrency';
import { formatDocumentDate, parseIsoDate } from '@/utils/formatDate';

import {
  getDiscountAmount,
  getGross,
  getGstSplit,
  getProposalSubject,
  getTaxable,
  getTotal,
} from '../utils/quotations';
import { Emphasis, isSubheading } from './Emphasis';
import styles from './QuotationDocument.module.css';

function formatDate(isoDate) {
  return formatDocumentDate(parseIsoDate(isoDate));
}

/** Bullet points, where an all-bold point starts a new group with that sub-heading. */
function SectionPoints({ points }) {
  const groups = [];
  points.forEach((point) => {
    if (isSubheading(point) || groups.length === 0) {
      groups.push({ heading: isSubheading(point) ? point : null, points: [] });
    }
    if (!isSubheading(point)) groups[groups.length - 1].points.push(point);
  });

  return groups.map((group) => (
    <div key={`${group.heading ?? ''}|${group.points[0] ?? ''}`}>
      {group.heading && (
        <p className={styles.subheading}>
          <Emphasis text={group.heading} />
        </p>
      )}
      {group.points.length > 0 && (
        <ul className={styles.bullets}>
          {group.points.map((point) => (
            <li key={point}>
              <Emphasis text={point} />
            </li>
          ))}
        </ul>
      )}
    </div>
  ));
}

function TaxRow({ quotation }) {
  const { cgst, sgst, igst } = getGstSplit(quotation);
  const label =
    igst > 0
      ? `IGST ${formatCurrencyExact(igst)}`
      : `CGST ${formatCurrencyExact(cgst)} + SGST ${formatCurrencyExact(sgst)}`;
  return (
    <tr>
      <th scope="row" colSpan={4} className={styles.summaryLabel}>
        {label}
      </th>
      <td className={styles.amount}>{formatCurrencyExact(cgst + sgst + igst)}</td>
    </tr>
  );
}

function SummaryRow({ label, amount, isTotal = false }) {
  return (
    <tr className={isTotal ? styles.totalRow : undefined}>
      <th scope="row" colSpan={4} className={styles.summaryLabel}>
        {label}
      </th>
      <td className={styles.amount}>{formatCurrencyExact(amount)}</td>
    </tr>
  );
}

/**
 * A quotation laid out as the printed commercial proposal: letterhead, company overview,
 * covering letter, price table with GST split and amount in words, extra sections, terms and
 * signature. Always white paper, whatever the app theme, so screen and print match.
 *
 * @param {object} props
 * @param {object} props.quotation
 */
export function QuotationDocument({ quotation }) {
  const total = getTotal(quotation);
  const hasDiscount = quotation.discountPercent > 0;

  return (
    <article className={styles.paper} aria-label={`Quotation document ${quotation.number}`}>
      <img src={logoUrl} alt="" className={styles.watermark} />

      <header className={styles.letterhead}>
        <img src={logoUrl} alt="" className={styles.logo} width="96" height="96" />
        <div className={styles.letterheadText}>
          <p className={styles.companyName}>{COMPANY.letterheadName}</p>
          <p className={styles.contact}>Email: {COMPANY.email}</p>
          <p className={styles.contact}>Mobile: +91 {COMPANY.mobile}</p>
        </div>
      </header>

      <div className={styles.metaRow}>
        <span>
          Quotation No. <strong>{quotation.number}</strong>
          {quotation.revision > 1 && ` (rev. ${quotation.revision})`}
        </span>
        <span>
          Date: <strong>{formatDate(quotation.date)}</strong>
        </span>
        <span>
          Valid until: <strong>{formatDate(quotation.validUntil)}</strong>
        </span>
      </div>

      <h3 className={styles.sectionTitle}>Company Overview</h3>
      {COMPANY.overview.map((paragraph) => (
        <p key={paragraph} className={styles.paragraph}>
          <Emphasis text={paragraph} />
        </p>
      ))}

      <p className={styles.salutation}>
        <strong>Respected Sir/Madam,</strong>
      </p>
      <p className={styles.paragraph}>
        <strong>{quotation.customer}</strong>
      </p>
      <p className={styles.paragraph}>Greetings from {COMPANY.legalName}.</p>
      <p className={styles.paragraph}>
        Please find below our commercial proposal for{' '}
        <strong>{getProposalSubject(quotation)}</strong>.
      </p>

      <h3 className={styles.sectionTitle}>Commercial Details</h3>
      <table className={styles.priceTable}>
        <caption className="visually-hidden">Commercial details</caption>
        <thead>
          <tr>
            <th scope="col">Sr.</th>
            <th scope="col">Particulars</th>
            <th scope="col" className={styles.amount}>
              Qty
            </th>
            <th scope="col" className={styles.amount}>
              Rate
            </th>
            <th scope="col" className={styles.amount}>
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {quotation.items.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>
              <th scope="row" className={styles.particulars}>
                <strong>{item.product}</strong>
                {item.description && <em className={styles.description}>{item.description}</em>}
              </th>
              <td className={styles.amount}>{item.quantity}</td>
              <td className={styles.amount}>{formatCurrencyExact(item.unitPrice)}</td>
              <td className={styles.amount}>
                {formatCurrencyExact(item.quantity * item.unitPrice)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          {hasDiscount && (
            <>
              <SummaryRow label="Subtotal" amount={getGross(quotation)} />
              <SummaryRow
                label={`Discount (${quotation.discountPercent}%)`}
                amount={-getDiscountAmount(quotation)}
              />
            </>
          )}
          <SummaryRow label="Taxable value" amount={getTaxable(quotation)} />
          <TaxRow quotation={quotation} />
          <SummaryRow label="Total including GST" amount={total} isTotal />
        </tfoot>
      </table>
      <p className={styles.amountInWords}>Amount in words: {amountInWords(total)}</p>

      {quotation.sections.map((section) => (
        <section key={section.id} className={styles.extraSection}>
          <h3 className={styles.sectionTitle}>{section.title}</h3>
          <SectionPoints points={section.points} />
        </section>
      ))}

      {quotation.terms && (
        <section className={styles.extraSection}>
          <h3 className={styles.sectionTitle}>Terms</h3>
          <p className={styles.paragraph}>{quotation.terms}</p>
        </section>
      )}
      <p className={styles.paragraph}>{COMPANY.closingNote}</p>

      <footer className={styles.signature}>
        <p>Thank you.</p>
        <p>Regards,</p>
        <p>{COMPANY.signatory.name}</p>
        <p>{COMPANY.signatory.mobile}</p>
        <p className={styles.signatureCompany}>{COMPANY.legalName}</p>
      </footer>
    </article>
  );
}
