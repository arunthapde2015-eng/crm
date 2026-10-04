import { DataTable } from '@/components/DataTable';
import { SALESPERSON_NAMES } from '@/constants/team';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';

import { canEdit, getDisplayStatus, getTaxable, getTotal } from '../utils/quotations';
import { ApprovalLabel, QuotationStatusBadge } from './QuotationBadges';
import styles from './Quotations.module.css';

const COLUMN_COUNT = 10;

function formatDate(isoDate) {
  return formatDayMonthYear(parseIsoDate(isoDate));
}

/**
 * @param {object} props
 * @param {object[]} props.quotations - Already filtered and sorted.
 * @param {string} props.todayIsoDate - Used to show expired quotations.
 * @param {(quotation: object) => void} props.onOpen - Opens the quotation panel.
 * @param {(quotation: object) => void} props.onEdit
 * @param {(quotation: object) => void} props.onDuplicate
 */
export function QuotationsTable({ quotations, todayIsoDate, onOpen, onEdit, onDuplicate }) {
  return (
    <DataTable caption="Quotations" tableClassName={styles.table}>
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
          <th scope="col">Approval</th>
          <th scope="col">Salesperson</th>
          <th scope="col">Status</th>
          <th scope="col">
            <span className="visually-hidden">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {quotations.length === 0 && (
          <tr>
            <td colSpan={COLUMN_COUNT} className={styles.empty}>
              No quotations match these filters.
            </td>
          </tr>
        )}
        {quotations.map((quotation) => {
          const isEditable = canEdit(quotation);
          return (
            <tr key={quotation.id}>
              <th scope="row">
                <button
                  type="button"
                  className={styles.numberButton}
                  onClick={() => onOpen(quotation)}
                >
                  {quotation.number}
                </button>
                {quotation.revision > 1 && (
                  <span className={styles.revision}>rev. {quotation.revision}</span>
                )}
              </th>
              <td className={styles.nowrap}>{formatDate(quotation.date)}</td>
              <td>{quotation.customer}</td>
              <td className={styles.nowrap}>{formatDate(quotation.validUntil)}</td>
              <td className={styles.numeric}>{formatCurrency(getTaxable(quotation))}</td>
              <td className={styles.numeric}>{formatCurrency(getTotal(quotation))}</td>
              <td>
                <ApprovalLabel approval={quotation.approval} />
              </td>
              <td>{SALESPERSON_NAMES.get(quotation.salespersonId) ?? 'Unassigned'}</td>
              <td>
                <QuotationStatusBadge status={getDisplayStatus(quotation, todayIsoDate)} />
              </td>
              <td>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.editButton}
                    disabled={!isEditable}
                    title={isEditable ? undefined : 'Converted quotations can’t be edited'}
                    onClick={() => onEdit(quotation)}
                  >
                    Edit <span className="visually-hidden">{quotation.number}</span>
                  </button>
                  <button
                    type="button"
                    className={styles.textButton}
                    onClick={() => onDuplicate(quotation)}
                  >
                    Duplicate <span className="visually-hidden">{quotation.number}</span>
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </DataTable>
  );
}
