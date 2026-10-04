import { getGstSplit, getTotal } from '@/utils/lineItems';

import { INITIAL_PROFORMAS, PROFORMA_STATUSES } from '../constants';
import {
  canConvert,
  duplicateProforma,
  getDisplayStatus,
  getEmptyFormValues,
  getListSummary,
  getMailtoUrl,
  getPanFromGstin,
  getPrintFileName,
  getWhatsAppUrl,
  reviseProforma,
  toFormValues,
  validateFormValues,
} from './proformas';

const byNumber = (number) => INITIAL_PROFORMAS.find((proforma) => proforma.number === number);

describe('proforma list', () => {
  it('adds up to the screenshot total', () => {
    expect(getListSummary(INITIAL_PROFORMAS)).toEqual({ count: 5, total: 261995 });
    expect(getTotal(byNumber('PI-2026-0005'))).toBe(59000);
    expect(getGstSplit(byNumber('PI-2026-0005'))).toEqual({ cgst: 4500, sgst: 4500, igst: 0 });
  });

  it('shows issued proformas as expired after their validity, and stops conversion', () => {
    const nirmal = byNumber('PI-2026-0002');
    expect(getDisplayStatus(nirmal, '2026-09-30')).toBe(PROFORMA_STATUSES.ISSUED);
    expect(getDisplayStatus(nirmal, '2026-10-01')).toBe(PROFORMA_STATUSES.EXPIRED);
    expect(canConvert(nirmal, '2026-10-01')).toBe(false);
  });
});

describe('document details', () => {
  const mauli = byNumber('PI-2026-0004');

  it('derives the PAN from the GSTIN', () => {
    expect(getPanFromGstin('27AAEAM3823E1ZT')).toBe('AAEAM3823E');
    expect(getPanFromGstin('')).toBe('');
  });

  it('names the PDF and builds share links with an encoded message', () => {
    expect(getPrintFileName(mauli)).toBe(
      'Proforma-PI-2026-0004-Mauli-Nagri-Sahakari-Patsanstha-Marya-Ma',
    );
    const whatsApp = getWhatsAppUrl(mauli);
    expect(whatsApp).toMatch(/^https:\/\/wa\.me\/919689814242\?text=/);
    expect(decodeURIComponent(whatsApp.split('text=')[1])).toContain(
      'proforma invoice PI-2026-0004 dated 29-Sep-2026 for ₹37,500, valid till 06-Oct-2026',
    );
    expect(getMailtoUrl(byNumber('PI-2026-0001'))).toMatch(
      /^mailto:office%40vidyavikas\.org\?subject=Proforma%20invoice%20PI-2026-0001/,
    );
  });

  it('has no WhatsApp link without a 10-digit mobile', () => {
    expect(getWhatsAppUrl({ ...mauli, customer: { ...mauli.customer, phone: '' } })).toBeNull();
  });
});

describe('editing', () => {
  it('re-issues every edit as the next revision', () => {
    const nirmal = byNumber('PI-2026-0002');
    const revised = reviseProforma(nirmal, { ...toFormValues(nirmal), validTill: '2026-10-10' });
    expect(revised).toMatchObject({
      revision: 2,
      status: PROFORMA_STATUSES.ISSUED,
      validTill: '2026-10-10',
    });
    expect(getDisplayStatus(revised, '2026-10-03')).toBe(PROFORMA_STATUSES.ISSUED);
  });

  it('duplicates as a fresh issued proforma valid for 7 days', () => {
    const copy = duplicateProforma(
      byNumber('PI-2026-0004'),
      INITIAL_PROFORMAS,
      new Date(2026, 9, 3),
    );
    expect(copy).toMatchObject({
      number: 'PI-2026-0006',
      date: '2026-10-03',
      validTill: '2026-10-10',
      revision: 1,
    });
  });

  it('validates lines and dates', () => {
    const values = getEmptyFormValues(new Date(2026, 9, 3));
    expect(validateFormValues({ ...values, validTill: '2026-10-01' })).toEqual([
      'Add at least one product or service.',
      'Valid till must be on or after the date.',
    ]);
  });
});
