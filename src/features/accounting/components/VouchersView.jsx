import { useState } from 'react';

import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { SelectField } from '@/components/SelectField';
import { formatCurrency } from '@/utils/formatCurrency';

import { ALL_FILTER_VALUE, VOUCHER_STATUSES, VOUCHER_TYPE_DETAILS } from '../constants';
import {
  cancelVoucher,
  createVoucher,
  filterVouchers,
  getEmptyVoucherValues,
  getVoucherTotal,
} from '../utils/vouchers';
import { VoucherDrawer } from './VoucherDrawer';
import { VoucherForm } from './VoucherForm';
import { VouchersTable } from './VouchersTable';
import styles from './Accounting.module.css';

const TYPE_FILTER_OPTIONS = [
  { value: ALL_FILTER_VALUE, label: 'All types' },
  ...Object.entries(VOUCHER_TYPE_DETAILS).map(([value, { label }]) => ({ value, label })),
];

function formatSummary(vouchers) {
  const posted = vouchers
    .filter((voucher) => voucher.status === VOUCHER_STATUSES.POSTED)
    .reduce((sum, voucher) => sum + getVoucherTotal(voucher), 0);
  const noun = vouchers.length === 1 ? 'voucher' : 'vouchers';
  return `${vouchers.length} ${noun}, ${formatCurrency(posted)} posted.`;
}

/**
 * Every voucher in the books, with entry of new ones.
 *
 * @param {object} props
 * @param {ReturnType<import('../hooks/useAccounting').useAccounting>} props.books
 * @param {object[]} props.accounts
 * @param {Date} props.today
 * @param {string} props.todayIso
 */
export function VouchersView({ books, accounts, today, todayIso }) {
  const [filters, setFilters] = useState({ query: '', type: ALL_FILTER_VALUE });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [openVoucherId, setOpenVoucherId] = useState(null);

  const visibleVouchers = filterVouchers(books.vouchers, accounts, filters);
  const openVoucher = books.vouchers.find((voucher) => voucher.id === openVoucherId);

  function handleSubmit(values) {
    const voucher = createVoucher(values, books.vouchers);
    books.addVoucher(voucher);
    setIsFormOpen(false);
    setOpenVoucherId(voucher.id);
  }

  return (
    <>
      <PageHeader
        title="Vouchers"
        description={formatSummary(visibleVouchers)}
        actions={
          <Button onClick={() => setIsFormOpen(true)} disabled={isFormOpen}>
            New voucher
          </Button>
        }
      />
      <div className={styles.body}>
        {isFormOpen && (
          <VoucherForm
            initialValues={getEmptyVoucherValues(today)}
            accounts={accounts}
            todayIso={todayIso}
            onSubmit={handleSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        )}
        <div className={styles.filters}>
          <label htmlFor="voucher-filter-query" className="visually-hidden">
            Filter vouchers
          </label>
          <input
            id="voucher-filter-query"
            type="search"
            className={styles.searchInput}
            placeholder="Filter this list"
            value={filters.query}
            onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))}
          />
          <SelectField
            id="voucher-filter-type"
            label="Voucher type"
            isLabelHidden
            options={TYPE_FILTER_OPTIONS}
            value={filters.type}
            onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}
          />
        </div>
        <VouchersTable
          vouchers={visibleVouchers}
          accounts={accounts}
          onOpen={(voucher) => setOpenVoucherId(voucher.id)}
        />
      </div>
      {openVoucher && (
        <VoucherDrawer
          voucher={openVoucher}
          accounts={accounts}
          onCancelVoucher={(reason) => books.replaceVoucher(cancelVoucher(openVoucher, reason))}
          onClose={() => setOpenVoucherId(null)}
        />
      )}
    </>
  );
}
