// The company's own details, as printed on quotations and other documents.
// Text wrapped in **double asterisks** is printed in bold.

// Registered state: sales inside it carry CGST + SGST; sales to other states carry IGST.
export const COMPANY_STATE = 'Maharashtra';

export const COMPANY = {
  letterheadName: 'FinSolis Software solutions Pvt. Ltd.',
  legalName: 'Finsolis Software Solutions Private Limited',
  email: 'arun@finsolisx.com',
  mobile: '9665446944',
  state: COMPANY_STATE,
  // As entered under Settings → Documents; printed on proformas and invoices.
  registeredAddress: ['Ho No 10 Rayyan Colony Pathri', 'Pathri', 'Pathri, Maharashtra - 431506'],
  bank: {
    bankName: 'State Bank Of India',
    branch: 'Pathri',
    accountName: '',
    accountNumber: '',
    ifscCode: '',
  },
  overview: [
    '**Finsolis Software Solutions Pvt. Ltd.** is a technology-driven Fintech company focused on simplifying and automating recurring payment collections and digital financial operations. The platform primarily serves NBFCs, cooperative banks, cooperative societies, Nidhi companies, and financial institutions by providing scalable payment, collection, and digital verification solutions.',
    'Finsolis is actively building a robust financial ecosystem through integrations such as **eNACH, UPI Autopay mandates, CIBIL/Credit Score Verification, and digital payment infrastructure** to enable seamless, secure, and automated financial transactions. Our platform empowers financial institutions with end-to-end automation for mandate management, recurring collections, credit assessment, and digital financial services.',
    'Our vision is to modernize traditional financial systems through innovation, automation, secure credit intelligence, and technology-led growth, enabling financial institutions to deliver faster, smarter, and more reliable services to their customers.',
  ],
  closingNote:
    'Please feel free to contact us for any clarification or further discussion. We look forward to building a long-term business relationship with you.',
  signatory: { name: 'Arun Thapde', mobile: '9665446944' },
};
