import { formatTwoDecimals } from '@/utils/formatCurrency';
import { getLineTaxable } from '@/utils/lineItems';

import styles from './GstDocument.module.css';

// Blank rows keep short documents looking like a full form, as on printed stationery.
const MIN_TABLE_ROWS = 4;
const PERCENT = 100;

function getLineGst(document, item) {
  return Math.round((getLineTaxable(document, item) * item.gstRate) / PERCENT);
}

/**
 * The products/services table. With `showTaxColumns`, each line also shows its taxable value
 * and GST amount (with the rate), as on a tax invoice.
 *
 * @param {object} props
 * @param {object} props.document - Has `items` and optional `discountPercent`.
 * @param {boolean} props.showTaxColumns
 */
export function GstItemsTable({ document, showTaxColumns }) {
  const fillerRows = Math.max(0, MIN_TABLE_ROWS - document.items.length);
  const columnCount = showTaxColumns ? 8 : 6;

  return (
    <table className={styles.items}>
      <caption className="visually-hidden">Products and services</caption>
      <thead>
        <tr>
          <th scope="col">
            Sr.
            <br />
            No.
          </th>
          <th scope="col">Name of Product / Service</th>
          <th scope="col">HSN / SAC</th>
          <th scope="col">Qty</th>
          <th scope="col">Rate</th>
          {showTaxColumns && (
            <>
              <th scope="col">Taxable Value</th>
              <th scope="col">GST</th>
            </>
          )}
          <th scope="col" className={styles.totalColumn}>
            Total
          </th>
        </tr>
      </thead>
      <tbody>
        {document.items.map((item, index) => {
          const lineTaxable = getLineTaxable(document, item);
          const lineGst = getLineGst(document, item);
          const lineTotal = showTaxColumns ? lineTaxable + lineGst : item.quantity * item.unitPrice;
          return (
            <tr key={item.id}>
              <td className={styles.center}>{index + 1}</td>
              <th scope="row" className={styles.product}>
                <strong>{item.product}</strong>
                {item.description && <em>{item.description}</em>}
              </th>
              <td className={styles.center}>{item.hsn}</td>
              <td className={styles.number}>{formatTwoDecimals(item.quantity)}</td>
              <td className={styles.number}>{formatTwoDecimals(item.unitPrice)}</td>
              {showTaxColumns && (
                <>
                  <td className={styles.number}>{formatTwoDecimals(lineTaxable)}</td>
                  <td className={styles.number}>
                    {formatTwoDecimals(lineGst)}
                    <span className={styles.rate}>@ {item.gstRate}%</span>
                  </td>
                </>
              )}
              <td className={`${styles.number} ${styles.totalColumn}`}>
                {formatTwoDecimals(lineTotal)}
              </td>
            </tr>
          );
        })}
        {Array.from({ length: fillerRows }, (_, index) => (
          <tr key={`filler-${index}`} className={styles.filler} aria-hidden="true">
            {Array.from({ length: columnCount }, (__, cell) => (
              <td
                key={cell}
                className={cell === columnCount - 1 ? styles.totalColumn : undefined}
              />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
