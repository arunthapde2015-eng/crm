import { BADGE_TONES, Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { DataTable } from '@/components/DataTable';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';

import { EXPENSE_STATUSES, EXPENSE_STATUS_LABELS } from '../constants';
import { getGstAmount, isCounted } from '../utils/expenses';
import styles from './Expenses.module.css';

const COLUMN_COUNT = 9;

function ApprovalCell({ expense, canApprove, onApprove, onReject }) {
  if (expense.status === EXPENSE_STATUSES.APPROVED) return expense.approvedBy;
  if (expense.status === EXPENSE_STATUSES.REJECTED) {
    return (
      <>
        <Badge tone={BADGE_TONES.DANGER}>{EXPENSE_STATUS_LABELS[expense.status]}</Badge>
        <span className={styles.subtext}>
          {expense.approvedBy}: {expense.rejectReason}
        </span>
      </>
    );
  }
  return (
    <>
      <Badge tone={BADGE_TONES.WARNING}>{EXPENSE_STATUS_LABELS[expense.status]}</Badge>
      {canApprove && (
        <span className={styles.rowActions}>
          <Button
            variant="secondary"
            aria-label={`Approve ${expense.number}`}
            onClick={() => onApprove(expense)}
          >
            Approve
          </Button>
          <Button
            variant="secondary"
            aria-label={`Reject ${expense.number}`}
            onClick={() => onReject(expense)}
          >
            Reject
          </Button>
        </span>
      )}
    </>
  );
}

/**
 * @param {object} props
 * @param {object[]} props.expenses - Already filtered and sorted.
 * @param {boolean} props.canApprove - Whether the signed-in user can approve or reject.
 * @param {(expense: object) => void} props.onApprove
 * @param {(expense: object) => void} props.onReject
 */
export function ExpensesTable({ expenses, canApprove, onApprove, onReject }) {
  return (
    <DataTable caption="Expenses" tableClassName={styles.table}>
      <thead>
        <tr>
          <th scope="col">Expense</th>
          <th scope="col">Date</th>
          <th scope="col">Category</th>
          <th scope="col">Vendor</th>
          <th scope="col">Description</th>
          <th scope="col">Mode</th>
          <th scope="col">Approved by</th>
          <th scope="col" className={styles.numeric}>
            Amount
          </th>
          <th scope="col" className={styles.numeric}>
            GST
          </th>
        </tr>
      </thead>
      <tbody>
        {expenses.length === 0 && (
          <tr>
            <td colSpan={COLUMN_COUNT} className={styles.empty}>
              No expenses match these filters.
            </td>
          </tr>
        )}
        {expenses.map((expense) => {
          const counted = isCounted(expense);
          const moneyClassName = `${styles.numeric} ${counted ? '' : styles.struck}`;
          return (
            <tr key={expense.id} className={counted ? undefined : styles.voidRow}>
              <th scope="row" className={styles.nowrap}>
                {expense.number}
              </th>
              <td className={styles.nowrap}>{formatDayMonthYear(parseIsoDate(expense.date))}</td>
              <td>{expense.category}</td>
              <td>{expense.vendor}</td>
              <td>{expense.description}</td>
              <td>
                {expense.mode}
                {expense.reference && <span className={styles.subtext}>{expense.reference}</span>}
              </td>
              <td>
                <ApprovalCell
                  expense={expense}
                  canApprove={canApprove}
                  onApprove={onApprove}
                  onReject={onReject}
                />
              </td>
              <td className={moneyClassName}>{formatCurrency(expense.amount)}</td>
              <td className={moneyClassName}>
                {formatCurrency(getGstAmount(expense.amount, expense.gstRate))}
              </td>
            </tr>
          );
        })}
      </tbody>
    </DataTable>
  );
}
