import { useId, useState } from 'react';

import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { SelectField } from '@/components/SelectField';
import { Tabs } from '@/components/Tabs';
import { formatCurrency } from '@/utils/formatCurrency';
import { toIsoDate } from '@/utils/formatDate';

import { ALL_FILTER_VALUE, BILL_STATUS_LABELS, TABS, TAB_IDS } from '../constants';
import { usePurchases } from '../hooks/usePurchases';
import {
  createBill,
  createVendor,
  filterBills,
  findVendor,
  getEmptyBillValues,
  getEmptyPaymentValues,
  getEmptyVendorValues,
  getPayable,
  getVendorRows,
  payBill,
} from '../utils/purchases';
import { BillForm } from './BillForm';
import { BillsTable } from './BillsTable';
import { PayVendorForm } from './PayVendorForm';
import { VendorForm } from './VendorForm';
import { VendorsTable } from './VendorsTable';
import styles from './Purchases.module.css';

const STATUS_OPTIONS = [
  { value: ALL_FILTER_VALUE, label: 'All statuses' },
  ...Object.entries(BILL_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];
const FORMS = { BILL: 'bill', VENDOR: 'vendor' };

/**
 * Vendors and the bills received from them: what's been bought and what's still to pay.
 *
 * @param {object} props
 * @param {Date} [props.today] - Default form dates; injectable for tests.
 */
export function PurchasesPanel({ today = new Date() }) {
  const todayIso = toIsoDate(today);
  const { vendors, bills, addBill, replaceBill, addVendor } = usePurchases();
  const [activeTabId, setActiveTabId] = useState(TAB_IDS.BILLS);
  const [filters, setFilters] = useState({ query: '', status: ALL_FILTER_VALUE });
  const [openForm, setOpenForm] = useState(null);
  const [payingBillId, setPayingBillId] = useState(null);
  const tabIdPrefix = useId();

  const payingBill = bills.find((bill) => bill.id === payingBillId);

  function handleBillSubmit(values) {
    addBill(createBill(values, bills));
    setOpenForm(null);
    setActiveTabId(TAB_IDS.BILLS);
  }

  function handleVendorSubmit(values) {
    addVendor(createVendor(values, vendors));
    setOpenForm(null);
    setActiveTabId(TAB_IDS.VENDORS);
  }

  function handlePaymentSubmit(values) {
    replaceBill(payBill(payingBill, values));
    setPayingBillId(null);
  }

  function renderForm() {
    if (openForm === FORMS.BILL) {
      return (
        <BillForm
          initialValues={getEmptyBillValues(today)}
          bills={bills}
          vendors={vendors}
          todayIso={todayIso}
          onSubmit={handleBillSubmit}
          onCancel={() => setOpenForm(null)}
        />
      );
    }
    if (openForm === FORMS.VENDOR) {
      return (
        <VendorForm
          initialValues={getEmptyVendorValues()}
          vendors={vendors}
          onSubmit={handleVendorSubmit}
          onCancel={() => setOpenForm(null)}
        />
      );
    }
    return null;
  }

  return (
    <>
      <PageHeader
        title="Purchases"
        description={`${formatCurrency(getPayable(bills))} payable to vendors.`}
        actions={
          <>
            <Button variant="secondary" onClick={() => setOpenForm(FORMS.VENDOR)}>
              Add vendor
            </Button>
            <Button onClick={() => setOpenForm(FORMS.BILL)}>Add purchase bill</Button>
          </>
        }
      />

      <div className={styles.body}>
        {renderForm()}
        {payingBill && (
          <PayVendorForm
            key={payingBill.id}
            bill={payingBill}
            vendorName={findVendor(vendors, payingBill.vendorId)?.name ?? 'vendor'}
            initialValues={getEmptyPaymentValues(today)}
            bills={bills}
            todayIso={todayIso}
            onSubmit={handlePaymentSubmit}
            onCancel={() => setPayingBillId(null)}
          />
        )}

        <Tabs
          tabs={TABS}
          activeTabId={activeTabId}
          onTabChange={setActiveTabId}
          label="Purchases"
          idPrefix={tabIdPrefix}
        >
          {activeTabId === TAB_IDS.VENDORS ? (
            <VendorsTable vendors={getVendorRows(vendors, bills)} />
          ) : (
            <div className={styles.body}>
              <div className={styles.filters}>
                <label htmlFor="bill-filter-query" className="visually-hidden">
                  Filter purchase bills
                </label>
                <input
                  id="bill-filter-query"
                  type="search"
                  className={styles.searchInput}
                  placeholder="Filter this list"
                  value={filters.query}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, query: event.target.value }))
                  }
                />
                <SelectField
                  id="bill-filter-status"
                  label="Status"
                  isLabelHidden
                  options={STATUS_OPTIONS}
                  value={filters.status}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, status: event.target.value }))
                  }
                />
              </div>
              <BillsTable
                bills={filterBills(bills, vendors, filters)}
                vendors={vendors}
                onPay={(bill) => setPayingBillId(bill.id)}
              />
            </div>
          )}
        </Tabs>
      </div>
    </>
  );
}
