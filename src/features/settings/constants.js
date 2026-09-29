export const SETTINGS_TAB_IDS = {
  COMPANY: 'company',
  DOCUMENTS: 'documents',
  NUMBERING: 'numbering',
  AMC_REMINDERS: 'amc-reminders',
  APPROVALS: 'approvals',
  TERMS: 'terms',
  DATA: 'data',
};

export const SETTINGS_TABS = [
  { id: SETTINGS_TAB_IDS.COMPANY, label: 'Company' },
  { id: SETTINGS_TAB_IDS.DOCUMENTS, label: 'Documents' },
  { id: SETTINGS_TAB_IDS.NUMBERING, label: 'Numbering' },
  { id: SETTINGS_TAB_IDS.AMC_REMINDERS, label: 'AMC reminders' },
  { id: SETTINGS_TAB_IDS.APPROVALS, label: 'Approvals' },
  { id: SETTINGS_TAB_IDS.TERMS, label: 'Terms' },
  { id: SETTINGS_TAB_IDS.DATA, label: 'Data' },
];

export const DEFAULT_SETTINGS_TAB_ID = SETTINGS_TAB_IDS.DOCUMENTS;

export const ADDRESS_ROWS = 4;

export const DEFAULT_DOCUMENT_SETTINGS = {
  letterheadName: 'FinSolis Software solutions Pvt. Ltd.',
  legalName: 'FINSOLIS SOFTWARE SOLUTIONS PRIVATE LIMITED',
  registeredAddress: 'Ho No 10 Rayyan Colony Pathri\nPathri\nPathri, Maharashtra - 431506',
  phone: '9665446944',
  email: 'arun@finsolisx.com',
  cin: '',
  bankName: 'State Bank Of India',
  bankBranch: 'Pathri',
  accountName: '',
  accountNumber: '',
  ifscCode: '',
};
