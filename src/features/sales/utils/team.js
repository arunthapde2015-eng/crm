import { EMPLOYEE_ID_PREFIX, ID_DIGITS, SALESPERSON_STATUSES } from '../constants';

export const EMPTY_SALESPERSON_VALUES = {
  name: '',
  mobile: '',
  email: '',
  territory: '',
  joinedOn: '',
  monthlyTarget: '',
};

export function toSalespersonFormValues(member) {
  return {
    name: member.name,
    mobile: member.mobile,
    email: member.email,
    territory: member.territory,
    joinedOn: member.joinedOn,
    monthlyTarget: String(member.monthlyTarget),
  };
}

function cleanValues(values) {
  return {
    name: values.name.trim(),
    mobile: values.mobile.trim(),
    email: values.email.trim().toLowerCase(),
    territory: values.territory.trim(),
    joinedOn: values.joinedOn,
    monthlyTarget: Number(values.monthlyTarget) || 0,
  };
}

function getNextEmployeeId(team) {
  const highest = team.reduce(
    (max, member) => Math.max(max, Number(member.employeeId.split('-')[1]) || 0),
    0,
  );
  return `${EMPLOYEE_ID_PREFIX}-${String(highest + 1).padStart(ID_DIGITS, '0')}`;
}

export function createSalesperson(values, team) {
  return {
    id: crypto.randomUUID(),
    employeeId: getNextEmployeeId(team),
    department: 'Sales',
    status: SALESPERSON_STATUSES.ACTIVE,
    ...cleanValues(values),
  };
}

export function updateSalesperson(member, values) {
  return { ...member, ...cleanValues(values) };
}

/** Someone else on the team already uses this mobile or email: avoids duplicate profiles. */
export function findDuplicateSalesperson(values, team, ignoreId = null) {
  const mobile = values.mobile.trim();
  const email = values.email.trim().toLowerCase();
  return (
    team.find(
      (member) => member.id !== ignoreId && (member.mobile === mobile || member.email === email),
    ) ?? null
  );
}

export function isActiveSalesperson(member) {
  return member.status === SALESPERSON_STATUSES.ACTIVE;
}
