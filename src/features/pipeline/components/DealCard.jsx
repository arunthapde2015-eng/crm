import { SALESPERSON_NAMES } from '@/constants/team';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';

import { DEAL_DRAG_TYPE, PIPELINE_STAGES } from '../constants';
import styles from './DealCard.module.css';

function SalespersonName({ salespersonId }) {
  const fullName = SALESPERSON_NAMES.get(salespersonId);
  if (!fullName) {
    return (
      <>
        <span aria-hidden="true">—</span>
        <span className="visually-hidden">Unassigned</span>
      </>
    );
  }
  // Cards are narrow, so show the first name and keep the full name for hover and screen readers.
  return <span title={fullName}>{fullName.split(' ')[0]}</span>;
}

/**
 * A deal on the pipeline board. Drag it to another column, or pick a stage from its menu.
 *
 * @param {object} props
 * @param {object} props.deal
 * @param {(stageId: string) => void} props.onStageChange
 * @param {() => void} props.onDragEnd
 */
export function DealCard({ deal, onStageChange, onDragEnd }) {
  const stageSelectId = `deal-stage-${deal.id}`;

  function handleDragStart(event) {
    event.dataTransfer.setData(DEAL_DRAG_TYPE, deal.id);
    event.dataTransfer.effectAllowed = 'move';
  }

  return (
    <article
      className={styles.card}
      draggable
      aria-label={deal.name}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
    >
      <h3 className={styles.name}>{deal.name}</h3>
      {deal.products.map((product) => (
        <p key={product} className={styles.product}>
          {product}
        </p>
      ))}
      <div className={styles.meta}>
        <span>{formatCurrency(deal.value)}</span>
        <SalespersonName salespersonId={deal.salespersonId} />
      </div>
      <div className={styles.footer}>
        <span className={styles.closeDate}>
          Close {formatDayMonthYear(parseIsoDate(deal.expectedCloseDate))}
        </span>
        <label htmlFor={stageSelectId} className="visually-hidden">
          Stage for {deal.name}
        </label>
        <select
          id={stageSelectId}
          className={styles.stageSelect}
          value={deal.stageId}
          onChange={(event) => onStageChange(event.target.value)}
        >
          {PIPELINE_STAGES.map((stage) => (
            <option key={stage.id} value={stage.id}>
              {stage.label}
            </option>
          ))}
        </select>
      </div>
    </article>
  );
}
