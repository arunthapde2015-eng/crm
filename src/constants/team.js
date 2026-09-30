// Stand-in for the sales team until users come from the API. Order is the display order.
export const SALESPERSONS = [
  { id: 'vikram', name: 'Vikram Joshi' },
  { id: 'rohan', name: 'Rohan Kulkarni' },
  { id: 'sneha', name: 'Sneha Patil' },
];

export const SALESPERSON_NAMES = new Map(
  SALESPERSONS.map((salesperson) => [salesperson.id, salesperson.name]),
);
