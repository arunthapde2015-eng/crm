import { useState } from 'react';

import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { SelectField } from '@/components/SelectField';
import { ROLES } from '@/constants/roles';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/utils/formatCurrency';
import { toIsoDate } from '@/utils/formatDate';

import { ALL_FILTER_VALUE, EXPENSE_STATUS_LABELS } from '../constants';
import { useExpenses } from '../hooks/useExpenses';
import {
  approveExpense,
  createExpense,
  filterExpenses,
  getEmptyFormValues,
  getListSummary,
  rejectExpense,
} from '../utils/expenses';
import { ExpenseForm } from './ExpenseForm';
import { ExpensesTable } from './ExpensesTable';
import { RejectForm } from './RejectForm';
import styles from './Expenses.module.css';

const STATUS_OPTIONS = [
  { value: ALL_FILTER_VALUE, label: 'All statuses' },
  ...Object.entries(EXPENSE_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

// Only Super Admin exists today; other roles will submit expenses for approval.
const APPROVER_ROLES = [ROLES.SUPER_ADMIN];

function formatSummary({ count, total, pendingCount }) {
  const summary = `${count} ${count === 1 ? 'expense' : 'expenses'}, ${formatCurrency(total)} before GST.`;
  return pendingCount > 0 ? `${summary} ${pendingCount} waiting for approval.` : summary;
}

/**
 * Company spending: bills paid, their GST, and who approved them.
 *
 * @param {object} props
 * @param {Date} [props.today] - Default expense date; injectable for tests.
 */
export function ExpensesPanel({ today = new Date() }) {
  const { currentUser, currentRole } = useAuth();
  const todayIso = toIsoDate(today);
  const { expenses, addExpense, replaceExpense } = useExpenses();
  const [filters, setFilters] = useState({ query: '', status: ALL_FILTER_VALUE });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const canApprove = APPROVER_ROLES.includes(currentRole.id);

  const visibleExpenses = filterExpenses(expenses, filters);
  const rejectingExpense = expenses.find((expense) => expense.id === rejectingId);

  function handleSubmit(values) {
    addExpense(createExpense(values, expenses, currentUser.name));
    setIsFormOpen(false);
  }

  function handleReject(reason) {
    replaceExpense(rejectExpense(rejectingExpense, currentUser.name, reason));
    setRejectingId(null);
  }

  return (
    <>
      <PageHeader
        title="Expenses"
        description={formatSummary(getListSummary(visibleExpenses))}
        actions={
          <Button onClick={() => setIsFormOpen(true)} disabled={isFormOpen}>
            Add expense
          </Button>
        }
      />

      <div className={styles.body}>
        {isFormOpen && (
          <ExpenseForm
            initialValues={getEmptyFormValues(today)}
            expenses={expenses}
            todayIso={todayIso}
            onSubmit={handleSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        )}
        {rejectingExpense && (
          <RejectForm
            key={rejectingExpense.id}
            expense={rejectingExpense}
            onSubmit={handleReject}
            onCancel={() => setRejectingId(null)}
          />
        )}
        <div className={styles.filters}>
          <label htmlFor="expense-filter-query" className="visually-hidden">
            Filter expenses
          </label>
          <input
            id="expense-filter-query"
            type="search"
            className={styles.searchInput}
            placeholder="Filter this list"
            value={filters.query}
            onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))}
          />
          <SelectField
            id="expense-filter-status"
            label="Status"
            isLabelHidden
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
          />
        </div>
        <ExpensesTable
          expenses={visibleExpenses}
          canApprove={canApprove}
          onApprove={(expense) => replaceExpense(approveExpense(expense, currentUser.name))}
          onReject={(expense) => setRejectingId(expense.id)}
        />
      </div>
    </>
  );
}
