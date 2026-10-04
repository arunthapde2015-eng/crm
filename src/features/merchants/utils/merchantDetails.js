import { toIsoDate } from '@/utils/formatDate';

import { LIFECYCLE_STAGES, MAX_REMARK_LENGTH, MERCHANT_STATUSES } from '../constants';

/** Linked record counts, with the outlet count taken from the merchant's outlet list. */
export function getLinkedCounts(merchant) {
  return { ...merchant.linkedRecords, outlets: merchant.outlets.length };
}

/**
 * The lifecycle stages with whether this merchant has reached each one.
 * A stage counts as reached when at least one record of that kind exists.
 */
export function getLifecycleStages(merchant) {
  const counts = getLinkedCounts(merchant);
  return LIFECYCLE_STAGES.map((stage) => {
    if (stage.id === 'lead') return { ...stage, isDone: merchant.isFromLead };
    if (stage.id === 'merchant') return { ...stage, isDone: true };
    return { ...stage, isDone: (counts[stage.id] ?? 0) > 0 };
  });
}

export function isActiveMerchant(merchant) {
  return merchant.status === MERCHANT_STATUSES.ACTIVE;
}

/** The status a Deactivate/Activate toggle switches to. */
export function getToggledStatus(merchant) {
  return isActiveMerchant(merchant) ? MERCHANT_STATUSES.INACTIVE : MERCHANT_STATUSES.ACTIVE;
}

/**
 * Deleting would orphan financial records, so merchants with invoices or receipts can only be
 * deactivated. Returns the reason deletion is blocked, or null if it's allowed.
 */
export function getDeleteBlocker(merchant) {
  const { invoices = 0, receipts = 0 } = merchant.linkedRecords;
  if (invoices > 0 || receipts > 0) {
    return 'Has invoices or receipts, so it can only be deactivated.';
  }
  return null;
}

/** What has been invoiced, received and is still due. Received is derived from the totals. */
export function getAccountSummary(merchant) {
  return {
    invoiced: merchant.totalSales,
    received: merchant.totalSales - merchant.outstanding,
    outstanding: merchant.outstanding,
  };
}

export function addOutlet(merchant, outletName, addedOn = new Date()) {
  const outlet = { id: crypto.randomUUID(), name: outletName.trim(), addedOn: toIsoDate(addedOn) };
  return { ...merchant, outlets: [...merchant.outlets, outlet] };
}

export function addRemark(merchant, text, author, addedAt = new Date()) {
  const remark = {
    id: crypto.randomUUID(),
    text: text.trim().slice(0, MAX_REMARK_LENGTH),
    author,
    addedOn: toIsoDate(addedAt),
  };
  return { ...merchant, remarks: [...merchant.remarks, remark] };
}

/**
 * Events for the Timeline tab, newest first: remarks, outlets added, and the record's creation.
 * Each event is { id, date, text, detail? }.
 */
export function getTimelineEvents(merchant) {
  const events = [
    ...merchant.remarks.map((remark) => ({
      id: remark.id,
      date: remark.addedOn,
      text: remark.text,
      detail: `Remark by ${remark.author}`,
    })),
    ...merchant.outlets.map((outlet) => ({
      id: outlet.id,
      date: outlet.addedOn,
      text: `Outlet added: ${outlet.name}`,
    })),
    {
      id: 'created',
      date: merchant.createdOn,
      text: merchant.isFromLead ? 'Converted from a lead' : 'Merchant created',
    },
  ];
  // Stable sort keeps same-day events in the order above (remarks before system events).
  return events.sort((first, second) => second.date.localeCompare(first.date));
}
