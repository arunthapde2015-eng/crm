import { getConversionPercent } from '../utils/formatters';

import sectionStyles from './DashboardSection.module.css';
import styles from './SalesFunnel.module.css';

const TITLE = 'Sales funnel';

/**
 * Lead-to-payment stages, each showing its count relative to the stage before.
 *
 * @param {object} props
 * @param {Array<{ id: string, label: string, count: number }>} props.stages - In funnel order.
 */
export function SalesFunnel({ stages }) {
  return (
    <div className={sectionStyles.section}>
      <h2 className={sectionStyles.title}>{TITLE}</h2>
      <section aria-label={TITLE} className={styles.panel}>
        <ol className={styles.stages}>
          {stages.map((stage, index) => {
            const conversionPercent = getConversionPercent(stage.count, stages[index - 1]?.count);

            return (
              <li key={stage.id} className={styles.stage}>
                <span className={styles.label}>{stage.label}</span>
                <span className={styles.count}>{stage.count}</span>
                {conversionPercent !== null && (
                  <span className={styles.conversion}>{conversionPercent}% of previous</span>
                )}
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
