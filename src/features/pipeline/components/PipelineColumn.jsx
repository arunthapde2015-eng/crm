import { useId } from 'react';

import { formatCurrency } from '@/utils/formatCurrency';

import { DEAL_DRAG_TYPE } from '../constants';
import { DealCard } from './DealCard';
import styles from './PipelineColumn.module.css';

function isDealDrag(event) {
  return event.dataTransfer.types.includes(DEAL_DRAG_TYPE);
}

/**
 * One stage of the board and a drop target for dragged deals.
 *
 * @param {object} props
 * @param {{ id: string, label: string, deals: object[], totalValue: number }} props.column
 * @param {boolean} props.isDropTarget - A deal is being dragged over this column.
 * @param {(stageId: string | null) => void} props.onDropTargetChange
 * @param {(dealId: string, stageId: string) => void} props.onMoveDeal
 */
export function PipelineColumn({ column, isDropTarget, onDropTargetChange, onMoveDeal }) {
  const headingId = useId();
  const columnClassNames = [styles.column, isDropTarget && styles.dropTarget]
    .filter(Boolean)
    .join(' ');

  function handleDragOver(event) {
    if (!isDealDrag(event)) return;
    // Cancelling dragover is what marks this element as a valid drop target.
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (!isDropTarget) onDropTargetChange(column.id);
  }

  function handleDragLeave(event) {
    // dragleave also fires when moving between the column's own children.
    if (!event.currentTarget.contains(event.relatedTarget)) onDropTargetChange(null);
  }

  function handleDrop(event) {
    event.preventDefault();
    const dealId = event.dataTransfer.getData(DEAL_DRAG_TYPE);
    if (dealId) onMoveDeal(dealId, column.id);
    onDropTargetChange(null);
  }

  return (
    <section
      className={columnClassNames}
      aria-labelledby={headingId}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <header className={styles.header}>
        <h2 id={headingId} className={styles.title}>
          {column.label}
        </h2>
        <span className={styles.summary}>
          {column.deals.length}
          <span className="visually-hidden"> deals worth</span>
          <span aria-hidden="true">,</span> {formatCurrency(column.totalValue)}
        </span>
      </header>
      {column.deals.length === 0 ? (
        <p className={styles.empty}>No deals</p>
      ) : (
        <ul className={styles.list}>
          {column.deals.map((deal) => (
            <li key={deal.id}>
              <DealCard
                deal={deal}
                onStageChange={(stageId) => onMoveDeal(deal.id, stageId)}
                onDragEnd={() => onDropTargetChange(null)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
