import { BADGE_TONES, Badge } from '@/components/Badge';
import { formatDayMonthYear, parseIsoDate } from '@/utils/formatDate';

import { DOCUMENT_STATUSES, DOCUMENT_STATUS_LABELS } from '../constants';
import styles from './AmcDrawer.module.css';

const DOCUMENT_TONES = {
  [DOCUMENT_STATUSES.VERIFIED]: BADGE_TONES.SUCCESS,
  [DOCUMENT_STATUSES.UPLOADED]: BADGE_TONES.WARNING,
  [DOCUMENT_STATUSES.MISSING]: BADGE_TONES.DANGER,
};

/**
 * KYC and agreement documents and whether each has been checked.
 *
 * @param {object} props
 * @param {object} props.contract
 */
export function AmcDocumentsTab({ contract }) {
  return (
    <ul className={styles.list}>
      {contract.documents.map((document) => (
        <li key={document.name} className={styles.listRow}>
          <span>
            {document.name}
            {document.status !== DOCUMENT_STATUSES.MISSING && (
              <span className={styles.subtext}>
                Uploaded {formatDayMonthYear(parseIsoDate(document.date))}
              </span>
            )}
          </span>
          <Badge tone={DOCUMENT_TONES[document.status]}>
            {DOCUMENT_STATUS_LABELS[document.status]}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
