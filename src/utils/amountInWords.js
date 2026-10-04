const ONES = [
  'ZERO',
  'ONE',
  'TWO',
  'THREE',
  'FOUR',
  'FIVE',
  'SIX',
  'SEVEN',
  'EIGHT',
  'NINE',
  'TEN',
  'ELEVEN',
  'TWELVE',
  'THIRTEEN',
  'FOURTEEN',
  'FIFTEEN',
  'SIXTEEN',
  'SEVENTEEN',
  'EIGHTEEN',
  'NINETEEN',
];
const TENS = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];

// Indian numbering: crore (10^7), lakh (10^5), thousand, hundred.
const SCALES = [
  { value: 10000000, word: 'CRORE' },
  { value: 100000, word: 'LAKH' },
  { value: 1000, word: 'THOUSAND' },
  { value: 100, word: 'HUNDRED' },
];

const TEEN_LIMIT = 20;
const TEN = 10;
const PAISE_PER_RUPEE = 100;

function underHundred(number) {
  if (number < TEEN_LIMIT) return ONES[number];
  const tens = TENS[Math.floor(number / TEN)];
  const ones = number % TEN;
  return ones === 0 ? tens : `${tens}-${ONES[ones]}`;
}

function wholeNumberToWords(number) {
  if (number === 0) return ONES[0];

  const words = [];
  let remainder = number;
  SCALES.forEach(({ value, word }) => {
    if (remainder >= value) {
      // Crores can exceed 99 (e.g. 150 crore), so recurse for the count.
      words.push(`${wholeNumberToWords(Math.floor(remainder / value))} ${word}`);
      remainder %= value;
    }
  });
  if (remainder > 0) words.push(underHundred(remainder));
  return words.join(' ');
}

/**
 * Amount in words as printed on Indian commercial documents.
 * 59000 → "FIFTY-NINE THOUSAND RUPEES ONLY"; 1250.5 → "ONE THOUSAND TWO HUNDRED FIFTY RUPEES AND FIFTY PAISE ONLY".
 */
export function amountInWords(amount) {
  const totalPaise = Math.round(Math.abs(amount) * PAISE_PER_RUPEE);
  const rupees = Math.floor(totalPaise / PAISE_PER_RUPEE);
  const paise = totalPaise % PAISE_PER_RUPEE;

  const rupeeWords = `${wholeNumberToWords(rupees)} RUPEES`;
  return paise > 0 ? `${rupeeWords} AND ${underHundred(paise)} PAISE ONLY` : `${rupeeWords} ONLY`;
}
