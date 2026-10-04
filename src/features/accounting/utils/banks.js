import {
  ACCOUNT_NUMBER_PATTERN,
  BANK_ACCOUNT_TYPES,
  CHART_OF_ACCOUNTS,
  IFSC_PATTERN,
  VISIBLE_ACCOUNT_DIGITS,
} from '../constants';

const OVERDRAFT = 'Overdraft';
// Bank account codes run 1010, 1020, ... in the assets range, skipping codes already taken.
const FIRST_BANK_CODE = 1010;
const BANK_CODE_STEP = 10;

/** "50200012345678" → "XXXX5678" */
export function maskAccountNumber(accountNumber) {
  return `XXXX${accountNumber.slice(-VISIBLE_ACCOUNT_DIGITS)}`;
}

export function getEmptyBankValues() {
  return {
    name: '',
    bankName: '',
    accountNumber: '',
    ifsc: '',
    branch: '',
    accountType: BANK_ACCOUNT_TYPES[0],
    openingBalance: '0',
  };
}

/** Problems with a new bank account. Names and account numbers must be unique. */
export function validateBank(values, banks) {
  const errors = [];
  const name = values.name.trim().toLowerCase();
  const accountNumber = values.accountNumber.trim();
  const openingBalance = Number(values.openingBalance);
  const takenNames = [...banks, ...CHART_OF_ACCOUNTS].map((item) => item.name.toLowerCase());

  if (name === '') errors.push('Enter a name for this account, e.g. "ICICI current account".');
  else if (takenNames.includes(name)) errors.push(`${values.name.trim()} is already an account.`);
  if (values.bankName.trim() === '') errors.push('Enter the bank name.');
  if (!ACCOUNT_NUMBER_PATTERN.test(accountNumber)) {
    errors.push('Enter the account number: 9 to 18 digits.');
  } else if (banks.some((bank) => bank.accountNumber === accountNumber)) {
    errors.push('This account number is already added.');
  }
  if (!IFSC_PATTERN.test(values.ifsc.trim().toUpperCase())) {
    errors.push('Enter a valid 11-character IFSC, e.g. HDFC0001234.');
  }
  if (values.openingBalance === '' || Number.isNaN(openingBalance)) {
    errors.push('Enter the opening balance, or 0.');
  } else if (openingBalance < 0 && values.accountType !== OVERDRAFT) {
    errors.push('Only an overdraft account can open below zero.');
  }
  return errors;
}

function getNextBankCode(banks) {
  const takenCodes = new Set([...banks, ...CHART_OF_ACCOUNTS].map((item) => item.code));
  let code = FIRST_BANK_CODE;
  while (takenCodes.has(String(code))) code += BANK_CODE_STEP;
  return String(code);
}

export function createBank(values, banks) {
  return {
    code: getNextBankCode(banks),
    name: values.name.trim(),
    bankName: values.bankName.trim(),
    accountNumber: values.accountNumber.trim(),
    ifsc: values.ifsc.trim().toUpperCase(),
    branch: values.branch.trim(),
    accountType: values.accountType,
    openingBalance: Number(values.openingBalance),
    isActive: true,
  };
}

/** Why an account can't be closed yet, or '' if it can. Money left in it would vanish from view. */
export function getCloseBlocker(balance) {
  return balance === 0 ? '' : 'Bring the balance to ₹0 before closing this account.';
}
