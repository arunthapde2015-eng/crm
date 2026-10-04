import { useId } from 'react';

import { Drawer } from '@/components/Drawer';
import { NAV_IDS } from '@/constants/navigation';
import { CURRENT_USER } from '@/constants/session';

import { getToggledStatus } from '../utils/merchantDetails';
import { MerchantDetails } from './MerchantDetails';

/**
 * Side panel for one merchant. Connects the panel's buttons to the merchant list actions and to
 * other pages.
 *
 * @param {object} props
 * @param {object} props.merchant
 * @param {ReturnType<import('../hooks/useMerchants').useMerchants>} props.actions
 * @param {(navId: string) => void} props.onNavigate
 * @param {(merchant: object) => void} props.onEdit - Opens the edit form (the panel closes first).
 * @param {(merchant: object) => void} props.onCopy - Opens the copy form (the panel closes first).
 * @param {() => void} props.onClose
 */
export function MerchantDetailDrawer({ merchant, actions, onNavigate, onEdit, onCopy, onClose }) {
  const headingId = useId();

  const handlers = {
    onNewQuotation: () => onNavigate(NAV_IDS.QUOTATIONS),
    onNewInvoice: () => onNavigate(NAV_IDS.SALES_INVOICES),
    onEdit: () => {
      onClose();
      onEdit(merchant);
    },
    onCopy: () => {
      onClose();
      onCopy(merchant);
    },
    onToggleStatus: () => actions.setStatus([merchant.id], getToggledStatus(merchant)),
    onDelete: () => {
      onClose();
      actions.deleteMerchant(merchant.id);
    },
    onAddOutlet: (outletName) => actions.addOutlet(merchant.id, outletName),
    onAddRemark: (text) => actions.addRemark(merchant.id, text, CURRENT_USER.name),
  };

  return (
    <Drawer labelledBy={headingId} onClose={onClose}>
      <MerchantDetails
        merchant={merchant}
        headingId={headingId}
        onClose={onClose}
        handlers={handlers}
      />
    </Drawer>
  );
}
