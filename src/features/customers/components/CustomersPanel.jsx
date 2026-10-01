import { useState } from 'react';

import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { useSelection } from '@/hooks/useSelection';

import { DEFAULT_CUSTOMER_FILTERS, FORM_MODES } from '../constants';
import { useCustomers } from '../hooks/useCustomers';
import {
  EMPTY_CUSTOMER_FORM_VALUES,
  createCustomer,
  toCopyFormValues,
  toFormValues,
} from '../utils/customerChanges';
import { filterCustomers, getCustomerStates, getCustomerSummary } from '../utils/customerQueries';
import { BulkStatusBar } from './BulkStatusBar';
import { CustomerFilters } from './CustomerFilters';
import { CustomerForm } from './CustomerForm';
import { CustomersTable } from './CustomersTable';
import styles from './CustomersPanel.module.css';

const PAGE_NOTE = 'Inactive customers can’t be picked for new quotations, invoices or merchants.';

function getFormConfig({ mode, customer }) {
  if (mode === FORM_MODES.EDIT) {
    return {
      title: `Edit ${customer.name}`,
      submitLabel: 'Save changes',
      initialValues: toFormValues(customer),
    };
  }
  if (mode === FORM_MODES.COPY) {
    return {
      title: `New customer from ${customer.name}`,
      submitLabel: 'Add customer',
      initialValues: toCopyFormValues(customer),
    };
  }
  return {
    title: 'New customer',
    submitLabel: 'Add customer',
    initialValues: EMPTY_CUSTOMER_FORM_VALUES,
  };
}

export function CustomersPanel() {
  const { customers, addCustomer, updateCustomer, setStatus } = useCustomers();
  const [filters, setFilters] = useState(DEFAULT_CUSTOMER_FILTERS);
  // null when closed, otherwise { mode, customer? } describing what the form is doing.
  const [openForm, setOpenForm] = useState(null);

  const visibleCustomers = filterCustomers(customers, filters);
  const selection = useSelection(visibleCustomers.map((customer) => customer.id));
  const selectedCount = selection.selectedVisibleIds.length;
  const formConfig = openForm && getFormConfig(openForm);

  function handleFilterChange(name, value) {
    setFilters((previous) => ({ ...previous, [name]: value }));
  }

  function handleFormSubmit(values) {
    if (openForm.mode === FORM_MODES.EDIT) updateCustomer(openForm.customer.id, values);
    else addCustomer(createCustomer(values, customers));
    setOpenForm(null);
  }

  function handleBulkStatus(status) {
    setStatus(selection.selectedVisibleIds, status);
    selection.clearSelection();
  }

  return (
    <>
      <PageHeader
        title="Customers"
        description={`${getCustomerSummary(customers)} ${PAGE_NOTE}`}
        actions={
          <Button onClick={() => setOpenForm({ mode: FORM_MODES.ADD })}>Add customer</Button>
        }
      />

      <div className={styles.body}>
        {formConfig && (
          <CustomerForm
            key={`${openForm.mode}-${openForm.customer?.id ?? 'new'}`}
            {...formConfig}
            onSubmit={handleFormSubmit}
            onCancel={() => setOpenForm(null)}
          />
        )}
        <CustomerFilters
          filters={filters}
          states={getCustomerStates(customers)}
          onFilterChange={handleFilterChange}
        />
        {selectedCount > 0 && (
          <BulkStatusBar
            selectedCount={selectedCount}
            onSetStatus={handleBulkStatus}
            onClear={selection.clearSelection}
          />
        )}
        <CustomersTable
          customers={visibleCustomers}
          selection={selection}
          onEdit={(customer) => setOpenForm({ mode: FORM_MODES.EDIT, customer })}
          onCopy={(customer) => setOpenForm({ mode: FORM_MODES.COPY, customer })}
          onSetStatus={setStatus}
        />
      </div>
    </>
  );
}
