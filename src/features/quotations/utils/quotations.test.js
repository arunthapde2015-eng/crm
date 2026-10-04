import { APPROVAL_STATUSES, INITIAL_QUOTATIONS, QUOTATION_STATUSES } from '../constants';
import {
  duplicateQuotation,
  getAvailableActions,
  getDisplayStatus,
  getEmptyFormValues,
  getGstSplit,
  getGstRateLabel,
  getListSummary,
  getPrintFileName,
  getProposalSubject,
  getSendBlocker,
  getTaxable,
  getTotal,
  reviseQuotation,
  toFormValues,
  validateFormValues,
} from './quotations';

const byNumber = (number) => INITIAL_QUOTATIONS.find((quotation) => quotation.number === number);

describe('quotation money', () => {
  it('discounts before GST', () => {
    const shreeji = byNumber('QTN-2026-0001');
    expect(getTaxable(shreeji)).toBe(87750);
    expect(getTotal(shreeji)).toBe(103545);
  });

  it('charges GST per line at each line’s rate', () => {
    // ₹60,000 at 18% + ₹8,000 at 12%.
    const sahyadri = byNumber('QTN-2026-0002');
    expect(getTaxable(sahyadri)).toBe(68000);
    expect(getTotal(sahyadri)).toBe(79760);
    expect(getGstRateLabel(sahyadri)).toBe('12–18%');
  });

  it('adds up to the list total', () => {
    expect(getListSummary(INITIAL_QUOTATIONS)).toEqual({ count: 8, total: 575950 });
  });
});

describe('status rules', () => {
  it('shows sent quotations as expired once validity has passed', () => {
    const sahyadri = byNumber('QTN-2026-0002');
    expect(getDisplayStatus(sahyadri, '2026-10-03')).toBe(QUOTATION_STATUSES.SENT);
    expect(getDisplayStatus(sahyadri, '2026-10-04')).toBe(QUOTATION_STATUSES.EXPIRED);
    expect(getAvailableActions(sahyadri, '2026-10-04').canRecordResponse).toBe(false);
  });

  it('blocks sending until a large discount is approved', () => {
    const shreeji = byNumber('QTN-2026-0001');
    expect(getSendBlocker(shreeji)).toMatch(/need approval/);
    expect(getSendBlocker({ ...shreeji, approval: APPROVAL_STATUSES.APPROVED })).toBeNull();
    expect(getSendBlocker({ ...shreeji, approval: APPROVAL_STATUSES.REJECTED })).toMatch(
      /not approved/,
    );
  });
});

describe('editing', () => {
  it('edits drafts in place but revises shared quotations', () => {
    const draft = byNumber('QTN-2026-0001');
    const accepted = byNumber('QTN-2026-0006');

    expect(reviseQuotation(draft, toFormValues(draft))).toMatchObject({
      revision: 1,
      status: QUOTATION_STATUSES.DRAFT,
    });
    expect(reviseQuotation(accepted, toFormValues(accepted))).toMatchObject({
      revision: 2,
      status: QUOTATION_STATUSES.DRAFT,
    });
  });

  it('re-checks approval when the discount changes', () => {
    const draft = byNumber('QTN-2026-0001');
    const lowered = reviseQuotation(draft, { ...toFormValues(draft), discountPercent: '5' });
    expect(lowered.approval).toBe(APPROVAL_STATUSES.NOT_NEEDED);
  });

  it('duplicates as a fresh draft with the next number', () => {
    const copy = duplicateQuotation(
      byNumber('QTN-2026-0007'),
      INITIAL_QUOTATIONS,
      new Date(2026, 9, 1),
    );
    expect(copy).toMatchObject({
      number: 'QTN-2026-0009',
      date: '2026-10-01',
      validUntil: '2026-10-16',
      status: QUOTATION_STATUSES.DRAFT,
      revision: 1,
    });
  });
});

describe('validateFormValues', () => {
  it('needs at least one line and a sensible validity', () => {
    const values = getEmptyFormValues(new Date(2026, 9, 1));
    expect(validateFormValues({ ...values, validUntil: '2026-09-01' })).toEqual([
      'Add at least one product or service.',
      'Valid until must be on or after the date.',
    ]);
  });
});

describe('document helpers', () => {
  const swarjy = byNumber('QTN-2026-0007');

  it('splits GST into CGST/SGST in-state and IGST out of state', () => {
    expect(getGstSplit(swarjy)).toEqual({ cgst: 4500, sgst: 4500, igst: 0 });
    expect(getGstSplit({ ...swarjy, placeOfSupply: 'Goa' })).toEqual({
      cgst: 0,
      sgst: 0,
      igst: 9000,
    });
  });

  it('names the products in the covering letter and the PDF file', () => {
    expect(getProposalSubject(swarjy)).toBe(
      'UPI Autopay and eNach Service CIBIL/Credit Score Verification, Wallet Balance',
    );
    expect(getPrintFileName(swarjy)).toBe(
      'Quotation-QTN-2026-0007-SWARJY-URBAN-CO-OP-CREDIT-SOCIETY-LI-PAT',
    );
  });

  it('round-trips extra sections through the form, one point per line', () => {
    const values = toFormValues(swarjy);
    expect(values.sections[2].pointsText).toBe(
      'First Year: **FREE**\nFrom the second year onwards: ₹12,000 + GST per branch, per annum.',
    );
    const revised = reviseQuotation(swarjy, {
      ...values,
      sections: [...values.sections, { id: 'blank', title: '', pointsText: '  ' }],
    });
    expect(revised.sections).toEqual(swarjy.sections);
  });

  it('needs a heading on any extra section with points', () => {
    const values = toFormValues(swarjy);
    expect(
      validateFormValues({
        ...values,
        sections: [{ id: 'x', title: '', pointsText: 'A point' }],
      }),
    ).toEqual(['Each extra section needs a heading.']);
  });
});
