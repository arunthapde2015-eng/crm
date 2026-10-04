import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';

import { createEmptySection } from '../utils/quotations';
import styles from './QuotationForm.module.css';

const POINTS_ROWS = 4;

/**
 * Optional sections printed after the price table, such as transaction charges, AMC or notes.
 * Each is a heading plus bullet points, one per line. **Double asterisks** make text bold.
 *
 * @param {object} props
 * @param {{ id: string, title: string, pointsText: string }[]} props.sections
 * @param {(sections: object[]) => void} props.onChange
 */
export function SectionsEditor({ sections, onChange }) {
  function updateSection(sectionId, field, value) {
    onChange(
      sections.map((section) =>
        section.id === sectionId ? { ...section, [field]: value } : section,
      ),
    );
  }

  return (
    <fieldset className={styles.items}>
      <legend className={styles.legend}>Extra sections (optional)</legend>
      <p className={styles.hint}>
        For charges, AMC or notes. One bullet point per line; wrap text in **double asterisks** to
        make it bold.
      </p>
      {sections.map((section, index) => {
        const sectionNumber = index + 1;
        return (
          <div key={section.id} className={styles.itemBlock}>
            <div className={styles.sectionHeader}>
              <TextField
                id={`quotation-section-title-${section.id}`}
                label={`Section ${sectionNumber} heading`}
                value={section.title}
                onChange={(event) => updateSection(section.id, 'title', event.target.value)}
              />
              <Button
                variant="ghost"
                className={styles.removeItem}
                onClick={() => onChange(sections.filter((item) => item.id !== section.id))}
              >
                Remove <span className="visually-hidden">section {sectionNumber}</span>
              </Button>
            </div>
            <TextField
              id={`quotation-section-points-${section.id}`}
              label={`Section ${sectionNumber} points`}
              rows={POINTS_ROWS}
              value={section.pointsText}
              onChange={(event) => updateSection(section.id, 'pointsText', event.target.value)}
            />
          </div>
        );
      })}
      <Button variant="secondary" onClick={() => onChange([...sections, createEmptySection()])}>
        Add section
      </Button>
    </fieldset>
  );
}
