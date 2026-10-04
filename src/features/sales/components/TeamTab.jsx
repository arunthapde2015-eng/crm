import { useState } from 'react';

import { BADGE_TONES, Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { DataTable } from '@/components/DataTable';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';
import { formatMobile } from '@/utils/formatPhone';

import { SALESPERSON_STATUSES } from '../constants';
import {
  EMPTY_SALESPERSON_VALUES,
  createSalesperson,
  isActiveSalesperson,
  toSalespersonFormValues,
} from '../utils/team';
import { SalespersonForm } from './SalespersonForm';
import layout from './SalesLayout.module.css';

/**
 * @param {object} props
 * @param {object[]} props.team
 * @param {(member: object) => void} props.onAdd
 * @param {(memberId: string, values: object) => void} props.onUpdate
 * @param {(memberId: string, status: string) => void} props.onSetStatus
 */
export function TeamTab({ team, onAdd, onUpdate, onSetStatus }) {
  // null when closed; { member: null } to add; { member } to edit.
  const [openForm, setOpenForm] = useState(null);
  const editingMember = openForm?.member ?? null;

  function handleSubmit(values) {
    if (editingMember) onUpdate(editingMember.id, values);
    else onAdd(createSalesperson(values, team));
    setOpenForm(null);
  }

  return (
    <div className={layout.stack}>
      <div className={layout.toolbar}>
        <p className={layout.note}>
          Inactive salespersons keep their history but can’t be given new orders.
        </p>
        <Button onClick={() => setOpenForm({ member: null })} disabled={Boolean(openForm)}>
          Add salesperson
        </Button>
      </div>
      {openForm && (
        <SalespersonForm
          key={editingMember?.id ?? 'new'}
          title={editingMember ? `Edit ${editingMember.name}` : 'New salesperson'}
          initialValues={
            editingMember ? toSalespersonFormValues(editingMember) : EMPTY_SALESPERSON_VALUES
          }
          team={team}
          editingId={editingMember?.id ?? null}
          onSubmit={handleSubmit}
          onCancel={() => setOpenForm(null)}
        />
      )}
      <DataTable caption="Sales team" tableClassName={layout.table}>
        <thead>
          <tr>
            <th scope="col">Salesperson</th>
            <th scope="col">Mobile</th>
            <th scope="col">Email</th>
            <th scope="col">Territory</th>
            <th scope="col">Joined</th>
            <th scope="col" className={layout.numeric}>
              Monthly target
            </th>
            <th scope="col">Status</th>
            <th scope="col">
              <span className="visually-hidden">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {team.map((member) => {
            const isActive = isActiveSalesperson(member);
            return (
              <tr key={member.id}>
                <th scope="row">
                  {member.name}
                  <span className={layout.secondary}>
                    {member.employeeId}, {member.department}
                  </span>
                </th>
                <td className={layout.nowrap}>{formatMobile(member.mobile)}</td>
                <td>{member.email}</td>
                <td>{member.territory || '—'}</td>
                <td className={layout.nowrap}>
                  {formatDayMonthYear(parseIsoDate(member.joinedOn))}
                </td>
                <td className={layout.numeric}>{formatCurrency(member.monthlyTarget)}</td>
                <td>
                  <Badge tone={isActive ? BADGE_TONES.SUCCESS : BADGE_TONES.NEUTRAL}>
                    {isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className={layout.nowrap}>
                  <button
                    type="button"
                    className={layout.textButton}
                    onClick={() => setOpenForm({ member })}
                  >
                    Edit <span className="visually-hidden">{member.name}</span>
                  </button>{' '}
                  <button
                    type="button"
                    className={layout.textButton}
                    onClick={() =>
                      onSetStatus(
                        member.id,
                        isActive ? SALESPERSON_STATUSES.INACTIVE : SALESPERSON_STATUSES.ACTIVE,
                      )
                    }
                  >
                    {isActive ? 'Deactivate' : 'Activate'}{' '}
                    <span className="visually-hidden">{member.name}</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </DataTable>
    </div>
  );
}
