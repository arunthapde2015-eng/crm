import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import { formatCurrency } from '@/utils/formatCurrency';

import { RULE_TYPE_LABELS, RULE_TYPES } from '../constants';
import { describeRule, getSlabFrom, validateRule } from '../utils/rules';
import { PersonCell } from './PersonCell';
import styles from './Incentives.module.css';

const DEFAULT_SLABS = [
  { id: 'slab-1', upTo: 100000, rate: 1 },
  { id: 'slab-2', upTo: null, rate: 2 },
];
const TYPE_OPTIONS = Object.entries(RULE_TYPE_LABELS).map(([value, label]) => ({ value, label }));

function isSlabType(type) {
  return type === RULE_TYPES.ORDER_SLABS || type === RULE_TYPES.MONTHLY_SLABS;
}

function toDraft(rule) {
  return {
    type: rule?.type ?? RULE_TYPES.FIXED_PER_ORDER,
    amount: String(rule?.amount ?? ''),
    percent: String(rule?.percent ?? ''),
    slabs: (rule?.slabs ?? DEFAULT_SLABS).map((slab) => ({
      id: slab.id,
      upTo: slab.upTo === null ? '' : String(slab.upTo),
      rate: String(slab.rate),
    })),
  };
}

function fromDraft(draft) {
  if (draft.type === RULE_TYPES.FIXED_PER_ORDER) {
    return { type: draft.type, amount: Number(draft.amount) };
  }
  if (draft.type === RULE_TYPES.PERCENT_OF_ORDER) {
    return { type: draft.type, percent: Number(draft.percent) };
  }
  return {
    type: draft.type,
    slabs: draft.slabs.map((slab, index) => ({
      id: slab.id,
      upTo: index === draft.slabs.length - 1 ? null : Number(slab.upTo),
      rate: Number(slab.rate),
    })),
  };
}

/**
 * Edits one salesperson's incentive rule. Saving re-prices their unpaid orders only.
 *
 * @param {object} props
 * @param {{ id: string, name: string, designation?: string }} props.person
 * @param {object | undefined} props.rule
 * @param {boolean} props.isFocused - Move keyboard focus here (after "Set rate").
 * @param {(rule: object) => void} props.onSave
 */
export function RuleEditor({ person, rule, isFocused, onSave }) {
  const [draft, setDraft] = useState(() => toDraft(rule));
  const [errors, setErrors] = useState([]);
  const [savedMessage, setSavedMessage] = useState('');
  const typeRef = useRef(null);
  const idPrefix = `rule-${person.id}`;
  const parsed = fromDraft(draft);

  useEffect(() => {
    if (isFocused) typeRef.current?.focus();
  }, [isFocused]);

  function update(changes) {
    setDraft((previous) => ({ ...previous, ...changes }));
    setSavedMessage('');
  }

  function updateSlab(index, field, value) {
    update({
      slabs: draft.slabs.map((slab, slabIndex) =>
        slabIndex === index ? { ...slab, [field]: value } : slab,
      ),
    });
  }

  function addSlab() {
    // New slabs go before the open-ended top slab.
    update({
      slabs: [
        ...draft.slabs.slice(0, -1),
        { id: crypto.randomUUID(), upTo: '', rate: '' },
        draft.slabs[draft.slabs.length - 1],
      ],
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validateRule(parsed);
    setErrors(validationErrors);
    if (validationErrors.length > 0) return;
    onSave(parsed);
    setSavedMessage(`Saved: ${describeRule(parsed)}. Unpaid orders now use this rate.`);
  }

  return (
    <form
      className={styles.card}
      onSubmit={handleSubmit}
      aria-label={`Incentive rate for ${person.name}`}
    >
      <PersonCell name={person.name} designation={person.designation} />
      <div className={styles.formGrid}>
        <SelectField
          ref={typeRef}
          id={`${idPrefix}-type`}
          label="Calculate as"
          options={TYPE_OPTIONS}
          value={draft.type}
          onChange={(event) => update({ type: event.target.value })}
        />
        {draft.type === RULE_TYPES.FIXED_PER_ORDER && (
          <TextField
            id={`${idPrefix}-amount`}
            label="Amount per order (₹)"
            type="number"
            min="0"
            required
            value={draft.amount}
            onChange={(event) => update({ amount: event.target.value })}
          />
        )}
        {draft.type === RULE_TYPES.PERCENT_OF_ORDER && (
          <TextField
            id={`${idPrefix}-percent`}
            label="Percent of order value"
            type="number"
            min="0"
            max="100"
            step="0.1"
            required
            value={draft.percent}
            onChange={(event) => update({ percent: event.target.value })}
          />
        )}
      </div>

      {isSlabType(draft.type) && (
        <>
          <p className={styles.note}>
            {draft.type === RULE_TYPES.MONTHLY_SLABS
              ? 'The month’s total sales pick the rate, which is then paid on every order that month.'
              : 'Each order’s value picks the rate for that order.'}{' '}
            The whole amount earns the rate of the slab it reaches.
          </p>
          <table className={styles.slabTable}>
            <caption className="visually-hidden">Slabs for {person.name}</caption>
            <thead>
              <tr>
                <th scope="col">From</th>
                <th scope="col">Up to (₹)</th>
                <th scope="col">Rate (%)</th>
                <th scope="col">
                  <span className="visually-hidden">Remove</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {draft.slabs.map((slab, index) => {
                const isLast = index === draft.slabs.length - 1;
                const fromAmount = getSlabFrom(parsed.slabs, index);
                return (
                  <tr key={slab.id}>
                    <th scope="row">
                      {Number.isFinite(fromAmount) ? formatCurrency(fromAmount) : '—'}
                    </th>
                    <td>
                      {isLast ? (
                        <span className={styles.note}>No limit</span>
                      ) : (
                        <input
                          type="number"
                          min="1"
                          aria-label={`${person.name} slab ${index + 1} upper limit`}
                          className={styles.inlineInput}
                          value={slab.upTo}
                          onChange={(event) => updateSlab(index, 'upTo', event.target.value)}
                        />
                      )}
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        aria-label={`${person.name} slab ${index + 1} rate`}
                        className={styles.inlineInput}
                        value={slab.rate}
                        onChange={(event) => updateSlab(index, 'rate', event.target.value)}
                      />
                    </td>
                    <td>
                      {!isLast && (
                        <button
                          type="button"
                          className={styles.textButton}
                          onClick={() =>
                            update({ slabs: draft.slabs.filter((_, i) => i !== index) })
                          }
                        >
                          Remove <span className="visually-hidden">slab {index + 1}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}

      {errors.length > 0 && (
        <ul className={styles.errors} role="alert">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
      <p className={styles.status} role="status">
        {savedMessage}
      </p>
      <div className={styles.formActions}>
        {isSlabType(draft.type) && (
          <Button variant="secondary" onClick={addSlab}>
            Add slab
          </Button>
        )}
        <Button type="submit">Save rate</Button>
      </div>
    </form>
  );
}
