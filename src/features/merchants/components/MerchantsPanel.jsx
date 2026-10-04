import { useState } from 'react';

import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { useSelection } from '@/hooks/useSelection';

import { DEFAULT_MERCHANT_FILTERS, FORM_MODES } from '../constants';
import { useMerchants } from '../hooks/useMerchants';
import {
  EMPTY_MERCHANT_FORM_VALUES,
  createMerchant,
  toCopyFormValues,
  toFormValues,
} from '../utils/merchantChanges';
import { filterMerchants, getMerchantStates, getMerchantSummary } from '../utils/merchantQueries';
import { BulkStatusBar } from './BulkStatusBar';
import { MerchantDetailDrawer } from './MerchantDetailDrawer';
import { MerchantFilters } from './MerchantFilters';
import { MerchantForm } from './MerchantForm';
import { MerchantsTable } from './MerchantsTable';
import styles from './MerchantsPanel.module.css';

const PAGE_NOTE = 'Inactive merchants can’t be picked for new quotations, invoices or outlets.';

function getFormConfig({ mode, merchant }) {
  if (mode === FORM_MODES.EDIT) {
    return {
      title: `Edit ${merchant.name}`,
      submitLabel: 'Save changes',
      initialValues: toFormValues(merchant),
    };
  }
  if (mode === FORM_MODES.COPY) {
    return {
      title: `New merchant from ${merchant.name}`,
      submitLabel: 'Add merchant',
      initialValues: toCopyFormValues(merchant),
    };
  }
  return {
    title: 'New merchant',
    submitLabel: 'Add merchant',
    initialValues: EMPTY_MERCHANT_FORM_VALUES,
  };
}

/**
 * @param {object} props
 * @param {(navId: string) => void} props.onNavigate - Opens another page (e.g. Quotation).
 */
export function MerchantsPanel({ onNavigate }) {
  const merchantActions = useMerchants();
  const { merchants, addMerchant, updateMerchant, setStatus } = merchantActions;
  const [filters, setFilters] = useState(DEFAULT_MERCHANT_FILTERS);
  // null when closed, otherwise { mode, merchant? } describing what the form is doing.
  const [openForm, setOpenForm] = useState(null);
  // Looked up from the live list so the panel shows edits, and closes if the merchant is deleted.
  const [detailMerchantId, setDetailMerchantId] = useState(null);
  const detailMerchant = merchants.find((merchant) => merchant.id === detailMerchantId);

  const visibleMerchants = filterMerchants(merchants, filters);
  const selection = useSelection(visibleMerchants.map((merchant) => merchant.id));
  const selectedCount = selection.selectedVisibleIds.length;
  const formConfig = openForm && getFormConfig(openForm);

  function handleFilterChange(name, value) {
    setFilters((previous) => ({ ...previous, [name]: value }));
  }

  function handleFormSubmit(values) {
    if (openForm.mode === FORM_MODES.EDIT) updateMerchant(openForm.merchant.id, values);
    else addMerchant(createMerchant(values, merchants));
    setOpenForm(null);
  }

  function handleBulkStatus(status) {
    setStatus(selection.selectedVisibleIds, status);
    selection.clearSelection();
  }

  return (
    <>
      <PageHeader
        title="Merchants"
        description={`${getMerchantSummary(merchants)} ${PAGE_NOTE}`}
        actions={
          <Button onClick={() => setOpenForm({ mode: FORM_MODES.ADD })}>Add merchant</Button>
        }
      />

      <div className={styles.body}>
        {formConfig && (
          <MerchantForm
            key={`${openForm.mode}-${openForm.merchant?.id ?? 'new'}`}
            {...formConfig}
            onSubmit={handleFormSubmit}
            onCancel={() => setOpenForm(null)}
          />
        )}
        <MerchantFilters
          filters={filters}
          states={getMerchantStates(merchants)}
          onFilterChange={handleFilterChange}
        />
        {selectedCount > 0 && (
          <BulkStatusBar
            selectedCount={selectedCount}
            onSetStatus={handleBulkStatus}
            onClear={selection.clearSelection}
          />
        )}
        <MerchantsTable
          merchants={visibleMerchants}
          selection={selection}
          onOpen={(merchant) => setDetailMerchantId(merchant.id)}
          onEdit={(merchant) => setOpenForm({ mode: FORM_MODES.EDIT, merchant })}
          onCopy={(merchant) => setOpenForm({ mode: FORM_MODES.COPY, merchant })}
          onSetStatus={setStatus}
        />
      </div>

      {detailMerchant && (
        <MerchantDetailDrawer
          merchant={detailMerchant}
          actions={merchantActions}
          onNavigate={onNavigate}
          onEdit={(merchant) => setOpenForm({ mode: FORM_MODES.EDIT, merchant })}
          onCopy={(merchant) => setOpenForm({ mode: FORM_MODES.COPY, merchant })}
          onClose={() => setDetailMerchantId(null)}
        />
      )}
    </>
  );
}
