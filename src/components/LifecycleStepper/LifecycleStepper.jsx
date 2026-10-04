import styles from './LifecycleStepper.module.css';

/**
 * Chevron strip showing which lifecycle stages a merchant has reached.
 *
 * @param {object} props
 * @param {{ id: string, label: string, isDone: boolean }[]} props.stages
 */
export function LifecycleStepper({ stages }) {
  return (
    <ol className={styles.stepper} aria-label="Lifecycle">
      {stages.map((stage) => (
        <li key={stage.id} className={stage.isDone ? styles.done : styles.step}>
          {stage.isDone && <span aria-hidden="true">✓ </span>}
          {stage.label}
          <span className="visually-hidden">{stage.isDone ? ', done' : ', not yet'}</span>
        </li>
      ))}
    </ol>
  );
}
