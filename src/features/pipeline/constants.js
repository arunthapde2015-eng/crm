export const PIPELINE_STAGE_IDS = {
  NEW: 'new',
  CONTACTED: 'contacted',
  INTERESTED: 'interested',
  FOLLOW_UP: 'follow-up',
  DEMO_SCHEDULED: 'demo-scheduled',
  QUOTATION_SENT: 'quotation-sent',
  NEGOTIATION: 'negotiation',
  WON: 'won',
  LOST: 'lost',
};

// Board column order, left to right.
export const PIPELINE_STAGES = [
  { id: PIPELINE_STAGE_IDS.NEW, label: 'New' },
  { id: PIPELINE_STAGE_IDS.CONTACTED, label: 'Contacted' },
  { id: PIPELINE_STAGE_IDS.INTERESTED, label: 'Interested' },
  { id: PIPELINE_STAGE_IDS.FOLLOW_UP, label: 'Follow-up' },
  { id: PIPELINE_STAGE_IDS.DEMO_SCHEDULED, label: 'Demo Scheduled' },
  { id: PIPELINE_STAGE_IDS.QUOTATION_SENT, label: 'Quotation Sent' },
  { id: PIPELINE_STAGE_IDS.NEGOTIATION, label: 'Negotiation' },
  { id: PIPELINE_STAGE_IDS.WON, label: 'Won' },
  { id: PIPELINE_STAGE_IDS.LOST, label: 'Lost' },
];

// MIME type for the dragged deal id; a custom type keeps unrelated drops (text, files) out.
export const DEAL_DRAG_TYPE = 'application/x-finsolis-deal-id';

const {
  NEW,
  CONTACTED,
  INTERESTED,
  FOLLOW_UP,
  DEMO_SCHEDULED,
  QUOTATION_SENT,
  NEGOTIATION,
  WON,
  LOST,
} = PIPELINE_STAGE_IDS;

// Placeholder deals until the pipeline API exists. Close dates are ISO (YYYY-MM-DD).
// Formatting is skipped so each deal stays on one line and the seed data reads as a table.
// prettier-ignore
export const INITIAL_DEALS = [
  deal(1, 'Royal Caterers', ['Dynamic QR standee kit'], 12000, 'rohan', '2026-11-12', NEW),
  deal(2, 'City Care Pharmacy', ['Dynamic QR standee kit'], 9600, 'sneha', '2026-11-13', NEW),
  deal(3, 'Shivneri Urban Credit Society', ['Custom API integration'], 120000, null, '2026-11-14', NEW),
  deal(4, 'Green Leaf Organic Store', ['Smart POS terminal'], 40000, 'sneha', '2026-11-02', CONTACTED),
  deal(5, 'Mahalaxmi Mahila Patsanstha', ['UPI Autopay and eNach Service', 'CIBIL/Credit Score Verification'], 65000, null, '2026-11-14', CONTACTED),
  deal(6, 'Bluebell Montessori', ['School fee collection software'], 70000, 'sneha', '2026-11-08', INTERESTED),
  deal(7, 'Metro Fitness Studio', ['Smart POS terminal'], 25000, 'rohan', '2026-11-05', FOLLOW_UP),
  deal(8, 'Anand Urban Credit Society', ['Custom API integration'], 220000, 'vikram', '2026-10-30', DEMO_SCHEDULED),
  deal(9, 'Sunrise Diagnostics', ['Payment gateway integration'], 48000, 'rohan', '2026-10-25', QUOTATION_SENT),
  deal(10, 'Hotel Panchavati', ['Hotel POS and billing'], 85000, 'vikram', '2026-10-20', NEGOTIATION),
  deal(11, 'Vidya Vikas School Trust', ['School fee collection software'], 120000, 'rohan', '2026-09-15', WON),
  deal(12, 'Laxmi Textiles', ['GST billing software'], 18600, 'vikram', '2026-09-10', LOST),
];

function deal(sequence, name, products, value, salespersonId, expectedCloseDate, stageId) {
  return {
    id: `deal-${sequence}`,
    name,
    products,
    value,
    salespersonId,
    expectedCloseDate,
    stageId,
  };
}
