import { InlineTextForm } from '@/components/InlineTextForm';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';

import { MAX_REMARK_LENGTH } from '../constants';
import { getTimelineEvents } from '../utils/merchantDetails';
import styles from './MerchantDetails.module.css';

const REMARK_ROWS = 3;

/**
 * @param {object} props
 * @param {object} props.merchant
 * @param {boolean} props.isFormOpen
 * @param {(text: string) => void} props.onAddRemark
 * @param {() => void} props.onCancel
 */
export function MerchantTimeline({ merchant, isFormOpen, onAddRemark, onCancel }) {
  return (
    <>
      {isFormOpen && (
        <InlineTextForm
          id={`new-remark-${merchant.id}`}
          label="Remark"
          submitLabel="Save remark"
          rows={REMARK_ROWS}
          maxLength={MAX_REMARK_LENGTH}
          onSubmit={onAddRemark}
          onCancel={onCancel}
        />
      )}
      <ol className={styles.list} aria-label="Timeline">
        {getTimelineEvents(merchant).map((event) => (
          <li key={event.id}>
            {event.text}
            <span className={styles.listMeta}>
              {formatDayMonthYear(parseIsoDate(event.date))}
              {event.detail && ` · ${event.detail}`}
            </span>
          </li>
        ))}
      </ol>
    </>
  );
}
