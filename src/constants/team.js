// Stand-in for the team until users come from the API. Order is the display order.
export const SALESPERSONS = [
  { id: 'vikram', name: 'Vikram Joshi', designation: 'Sales Manager' },
  { id: 'rohan', name: 'Rohan Kulkarni', designation: 'Sales Executive' },
  { id: 'sneha', name: 'Sneha Patil', designation: 'Sales Executive' },
];

// Everyone who can be given work, including non-sales staff such as accounts and support.
export const TEAM_MEMBERS = [
  ...SALESPERSONS,
  { id: 'meera', name: 'Meera Iyer' },
  { id: 'priya', name: 'Priya Sawant' },
];

export const SALESPERSON_NAMES = new Map(
  SALESPERSONS.map((salesperson) => [salesperson.id, salesperson.name]),
);

export const TEAM_MEMBER_NAMES = new Map(TEAM_MEMBERS.map((member) => [member.id, member.name]));
