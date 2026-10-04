// Placeholder business records that every report is built from, until a reports API exists.
// Keeping one source means collections, outstanding and GST always agree with the invoices.
// Dates are ISO (YYYY-MM-DD). Formatting is skipped so each record stays on one line.

/* prettier-ignore */
const INVOICES = [
  invoice(1, '2026-04-18', 'Vidya Vikas School Trust', 'Maharashtra', 'rohan', 'School fee collection software', 120000, 18, [payment('2026-04-25', 'NEFT', 141600)]),
  invoice(2, '2026-05-06', 'Nirmal Co-operative Credit Society', 'Maharashtra', 'rohan', 'Custom API integration', 150000, 18, [payment('2026-05-20', 'NEFT', 177000)]),
  invoice(3, '2026-06-12', 'Sahyadri Multispeciality Clinic', 'Maharashtra', 'sneha', 'Payment gateway integration', 90500, 18, [payment('2026-06-30', 'UPI', 87790)]),
  invoice(4, '2026-07-03', 'Deccan Motors', 'Maharashtra', 'rohan', 'Dealer management CRM', 16000, 12, [payment('2026-07-15', 'Cheque', 17920)]),
  invoice(5, '2026-07-22', 'Metro Fitness Studio', 'Maharashtra', 'rohan', 'Smart POS terminal', 25250, 18, [payment('2026-08-05', 'UPI', 3980)]),
  invoice(6, '2026-08-10', 'Konkan Fresh Mart', 'Goa', 'sneha', 'Smart POS terminal', 4800, 12, []),
  invoice(7, '2026-08-28', 'Shivneri Hotels', 'Maharashtra', 'rohan', 'Hotel POS and billing', 35000, 18, []),
  invoice(8, '2026-09-14', 'Nirmal Co-operative Credit Society', 'Maharashtra', 'rohan', 'Custom API integration', 52500, 18, []),
];

/* prettier-ignore */
const LEADS = [
  lead('2026-04-10', 'rohan', 'won'), lead('2026-04-22', 'rohan', 'won'), lead('2026-05-02', 'rohan', 'lost'),
  lead('2026-06-15', 'rohan', 'won'), lead('2026-07-01', 'rohan', 'open'), lead('2026-08-19', 'rohan', 'open'),
  lead('2026-09-05', 'rohan', 'won'), lead('2026-09-21', 'rohan', 'open'),
  lead('2026-05-11', 'sneha', 'won'), lead('2026-06-02', 'sneha', 'open'), lead('2026-07-27', 'sneha', 'won'),
  lead('2026-08-30', 'sneha', 'open'), lead('2026-09-18', 'sneha', 'lost'),
  lead('2026-06-08', 'vikram', 'lost'), lead('2026-08-14', 'vikram', 'lost'),
];

/* prettier-ignore */
const QUOTATIONS = [
  quotation(1, '2026-04-12', 'Vidya Vikas School Trust', 'rohan', 141600, 'accepted'),
  quotation(2, '2026-04-29', 'Nirmal Co-operative Credit Society', 'rohan', 177000, 'accepted'),
  quotation(3, '2026-05-30', 'Sahyadri Multispeciality Clinic', 'sneha', 106790, 'accepted'),
  quotation(4, '2026-06-20', 'Western Ghats Resorts', 'vikram', 165200, 'rejected'),
  quotation(5, '2026-07-18', 'Metro Fitness Studio', 'rohan', 29795, 'accepted'),
  quotation(6, '2026-08-21', 'Deccan Institute of Management', 'rohan', 212400, 'sent'),
  quotation(7, '2026-09-02', 'Green Leaf Organic Store', 'sneha', 47200, 'sent'),
  quotation(8, '2026-09-09', 'Laxmi Textiles', 'vikram', 21948, 'expired'),
];

/* prettier-ignore */
const MERCHANTS = [
  merchant('MID-1001', 'Nirmal Credit - Head Office', 'Nirmal Co-operative Credit Society', '2026-05-25', 'rohan', 'active'),
  merchant('MID-1002', 'Konkan Fresh Mart - Margao', 'Konkan Fresh Mart', '2026-06-04', 'sneha', 'active'),
  merchant('MID-1003', 'Konkan Fresh Mart - Panaji', 'Konkan Fresh Mart', '2026-06-18', 'sneha', 'active'),
  merchant('MID-1004', 'Sahyadri Clinic - OPD Counter', 'Sahyadri Multispeciality Clinic', '2026-07-09', 'sneha', 'pending-kyc'),
  merchant('MID-1005', 'Metro Fitness - Kothrud', 'Metro Fitness Studio', '2026-08-07', 'rohan', 'active'),
  merchant('MID-1006', 'Shivneri Hotels - Front Desk', 'Shivneri Hotels', '2026-09-03', 'rohan', 'pending-kyc'),
];

/* prettier-ignore */
const AMC_CONTRACTS = [
  amc('AMC-2026-0001', 'Vidya Vikas School Trust', 'School fee collection software', '2026-04-20', '2027-04-19', 18000),
  amc('AMC-2026-0002', 'Nirmal Co-operative Credit Society', 'Custom API integration', '2026-05-21', '2026-10-20', 22500),
  amc('AMC-2026-0003', 'Deccan Motors', 'Dealer management CRM', '2026-07-05', '2027-07-04', 4800),
  amc('AMC-2025-0014', 'Sai Krupa Jewellers', 'Smart POS terminal', '2025-09-15', '2026-09-14', 3600),
];

/** Every record the reports use. Shaped like a future `GET /reports/data` response. */
export function getReportData() {
  return {
    invoices: INVOICES,
    leads: LEADS,
    quotations: QUOTATIONS,
    merchants: MERCHANTS,
    amcContracts: AMC_CONTRACTS,
  };
}

function invoice(
  sequence,
  date,
  customer,
  customerState,
  executiveId,
  product,
  taxable,
  gstRate,
  payments,
) {
  const number = `INV-2026-${String(sequence).padStart(4, '0')}`;
  return {
    id: number,
    number,
    date,
    customer,
    customerState,
    executiveId,
    product,
    taxable,
    gstRate,
    payments,
  };
}

function payment(date, mode, amount) {
  return { date, mode, amount };
}

function lead(date, executiveId, outcome) {
  return { date, executiveId, outcome };
}

function quotation(sequence, date, customer, executiveId, total, status) {
  const number = `QT-2026-${String(sequence).padStart(4, '0')}`;
  return { id: number, number, date, customer, executiveId, total, status };
}

function merchant(id, name, customer, onboardedDate, executiveId, status) {
  return { id, name, customer, onboardedDate, executiveId, status };
}

function amc(id, customer, product, startDate, endDate, amount) {
  return { id, customer, product, startDate, endDate, amount };
}
