// Stand-in for the team until users come from the API. Order is the display order.
export const SALESPERSONS = [
  { id: 'vikram', name: 'Vikram Joshi' },
  { id: 'rohan', name: 'Rohan Kulkarni' },
  { id: 'sneha', name: 'Sneha Patil' },
];

// Everyone who can be given work, including non-sales staff such as accounts.
export const TEAM_MEMBERS = [...SALESPERSONS, { id: 'meera', name: 'Meera Iyer' }];

export const SALESPERSON_NAMES = new Map(
  SALESPERSONS.map((salesperson) => [salesperson.id, salesperson.name]),
);

export const TEAM_MEMBER_NAMES = new Map(TEAM_MEMBERS.map((member) => [member.id, member.name]));
