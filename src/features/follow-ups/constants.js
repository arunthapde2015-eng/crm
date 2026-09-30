export const FOLLOW_UP_TYPES = {
  CALL: 'call',
  EMAIL: 'email',
  MEETING: 'meeting',
  WHATSAPP: 'whatsapp',
  VISIT: 'visit',
};

export const FOLLOW_UP_TYPE_LABELS = {
  [FOLLOW_UP_TYPES.CALL]: 'Call',
  [FOLLOW_UP_TYPES.EMAIL]: 'Email',
  [FOLLOW_UP_TYPES.MEETING]: 'Meeting',
  [FOLLOW_UP_TYPES.WHATSAPP]: 'WhatsApp',
  [FOLLOW_UP_TYPES.VISIT]: 'Visit',
};

export const FOLLOW_UP_GROUP_IDS = {
  OVERDUE: 'overdue',
  TODAY: 'today',
  TOMORROW: 'tomorrow',
  LATER: 'later',
};

// Display order of the sections on the page.
export const FOLLOW_UP_GROUPS = [
  { id: FOLLOW_UP_GROUP_IDS.OVERDUE, label: 'Overdue' },
  { id: FOLLOW_UP_GROUP_IDS.TODAY, label: 'Today' },
  { id: FOLLOW_UP_GROUP_IDS.TOMORROW, label: 'Tomorrow' },
  { id: FOLLOW_UP_GROUP_IDS.LATER, label: 'Later' },
];

export const DEFAULT_FOLLOW_UP_TIME = '11:30';

const { CALL, EMAIL, MEETING, WHATSAPP } = FOLLOW_UP_TYPES;

// Placeholder follow-ups until the leads API exists. Dates are ISO (YYYY-MM-DD), times 24h.
// Formatting is skipped so each follow-up stays on one line and the seed data reads as a table.
// prettier-ignore
export const INITIAL_FOLLOW_UPS = [
  followUp(1, 'Metro Fitness Studio', 'Aditya Naik', '9823010012', '2026-09-26', '11:30', CALL, 'Asked to call after month end', 'rohan'),
  followUp(2, 'Sai Krupa Diagnostics', 'Dr. Neha Kulkarni', '9823010009', '2026-09-28', '11:30', EMAIL, 'Reviewing with partners', 'sneha'),
  followUp(3, 'Deccan Institute of Management', 'Prof. Kavita Rao', '9823010006', '2026-09-30', '11:30', MEETING, 'Board approval pending', 'rohan'),
  followUp(4, 'City Care Pharmacy', 'Pooja Deshmukh', '9823010016', '2026-09-30', '11:30', WHATSAPP, 'Wants 12 standees', 'sneha'),
  followUp(5, 'Green Leaf Organic Store', 'Manoj Shetty', '9823010004', '2026-10-01', '11:30', WHATSAPP, 'Will compare with bank POS', 'sneha'),
  followUp(6, 'Royal Caterers', 'Farhan Qureshi', '9823010001', '2026-10-01', '15:00', CALL, 'Sent standee samples', 'rohan'),
  followUp(7, 'Bluebell Montessori', 'Anjali Menon', '9823010003', '2026-10-08', '10:00', MEETING, 'Demo for the principal', 'sneha'),
  followUp(8, 'Shivneri Urban Credit Society', 'Mahesh Jadhav', '9823010020', '2026-10-14', '12:00', CALL, 'Needs API documentation', 'vikram'),
];

function followUp(
  sequence,
  leadName,
  contactName,
  mobile,
  dueDate,
  dueTime,
  type,
  lastDiscussion,
  ownerId,
) {
  return {
    id: `follow-up-${sequence}`,
    leadName,
    contactName,
    mobile,
    dueDate,
    dueTime,
    type,
    lastDiscussion,
    ownerId,
  };
}
