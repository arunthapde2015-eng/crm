import { DataTable } from '@/components/DataTable';
import { SALESPERSON_NAMES } from '@/constants/team';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';
import { getTaxable, getTotal } from '@/utils/lineItems';

import { getDisplayStatus } from '../utils/proformas';
import { ProformaStatusBadge } from './ProformaStatusBadge';
import styles from './Proformas.module.css';

const COLUMN_COUNT = 9;

function formatDate(isoDate) {
  return formatDayMonthYear(parseIsoDate(isoDate));
}

/**
 * @param {object} props
 * @param {object[]} props.proformas - Already filtered and sorted.
 * @param {string} props.todayIsoDate
 * @param {(proforma: object) => void} props.onOpen
 * @param {(proforma: object) => void} props.onDownload - Opens the proforma and its print dialog.
 */
export function ProformasTable({ proformas, todayIsoDate, onOpen, onDownload }) {
  return (
    <DataTable caption="Proforma invoices" tableClassName={styles.table}>
      <thead>
        <tr>
          <th scope="col">No.</th>
          <th scope="col">Date</th>
          <th scope="col">Customer / merchant</th>
          <th scope="col">Valid until</th>
          <th scope="col" className={styles.numeric}>
            Taxable
          </th>
          <th scope="col" className={styles.numeric}>
            Total
          </th>
          <th scope="col">Salesperson</th>
          <th scope="col">Status</th>
          <th scope="col">
            <span className="visually-hidden">Download</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {proformas.length === 0 && (
          <tr>
            <td colSpan={COLUMN_COUNT} className={styles.empty}>
              No proformas match these filters.
            </td>
          </tr>
        )}
        {proformas.map((proforma) => (
          <tr key={proforma.id}>
            <th scope="row">
              <button
                type="button"
                className={styles.numberButton}
                onClick={() => onOpen(proforma)}
              >
                {proforma.number}
              </button>
              {proforma.revision > 1 && (
                <span className={styles.revision}>rev. {proforma.revision}</span>
              )}
            </th>
            <td className={styles.nowrap}>{formatDate(proforma.date)}</td>
            <td>{proforma.customer.name}</td>
            <td className={styles.nowrap}>{formatDate(proforma.validTill)}</td>
            <td className={styles.numeric}>{formatCurrency(getTaxable(proforma))}</td>
            <td className={styles.numeric}>{formatCurrency(getTotal(proforma))}</td>
            <td>{SALESPERSON_NAMES.get(proforma.salespersonId) ?? 'Unassigned'}</td>
            <td>
              <ProformaStatusBadge status={getDisplayStatus(proforma, todayIsoDate)} />
            </td>
            <td>
              <button
                type="button"
                className={styles.textButton}
                onClick={() => onDownload(proforma)}
              >
                <span aria-hidden="true">⬇ </span>PDF{' '}
                <span className="visually-hidden">of {proforma.number}</span>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </DataTable>
  );
}
