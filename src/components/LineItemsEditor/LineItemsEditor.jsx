import { Button } from '@/components/Button';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import { GST_RATES, createEmptyLine } from '@/utils/lineItems';

import styles from './LineItemsEditor.module.css';

const GST_OPTIONS = GST_RATES.map((rate) => ({ value: String(rate), label: `${rate}%` }));

/**
 * Editable product/service lines for billing documents. Each line has its own GST rate, an
 * optional description (printed in italics), and optionally an HSN/SAC code.
 *
 * @param {object} props
 * @param {object[]} props.items - Form-value lines (string fields), see createEmptyLine.
 * @param {(items: object[]) => void} props.onChange
 * @param {boolean} [props.showHsn=false] - Show the HSN/SAC code field.
 * @param {string} [props.legend='Products / services']
 */
export function LineItemsEditor({
  items,
  onChange,
  showHsn = false,
  legend = 'Products / services',
}) {
  function updateItem(itemId, field, value) {
    onChange(items.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)));
  }

  return (
    <fieldset className={styles.items}>
      <legend className={styles.legend}>{legend}</legend>
      {items.map((item, index) => {
        const lineNumber = index + 1;
        return (
          <div key={item.id} className={styles.itemBlock}>
            <div className={styles.itemRow}>
              <TextField
                id={`line-product-${item.id}`}
                label={`Item ${lineNumber}`}
                value={item.product}
                onChange={(event) => updateItem(item.id, 'product', event.target.value)}
              />
              <TextField
                id={`line-quantity-${item.id}`}
                label={`Quantity, item ${lineNumber}`}
                type="number"
                min="1"
                value={item.quantity}
                onChange={(event) => updateItem(item.id, 'quantity', event.target.value)}
              />
              <TextField
                id={`line-price-${item.id}`}
                label={`Unit price (₹), item ${lineNumber}`}
                type="number"
                min="0"
                value={item.unitPrice}
                onChange={(event) => updateItem(item.id, 'unitPrice', event.target.value)}
              />
              <SelectField
                id={`line-gst-${item.id}`}
                label={`GST, item ${lineNumber}`}
                options={GST_OPTIONS}
                value={item.gstRate}
                onChange={(event) => updateItem(item.id, 'gstRate', event.target.value)}
              />
              <Button
                variant="ghost"
                className={styles.removeItem}
                onClick={() => onChange(items.filter((line) => line.id !== item.id))}
                disabled={items.length === 1}
              >
                Remove <span className="visually-hidden">item {lineNumber}</span>
              </Button>
            </div>
            <div className={showHsn ? styles.detailRow : undefined}>
              <TextField
                id={`line-description-${item.id}`}
                label={`Description, item ${lineNumber} (optional)`}
                value={item.description}
                onChange={(event) => updateItem(item.id, 'description', event.target.value)}
              />
              {showHsn && (
                <TextField
                  id={`line-hsn-${item.id}`}
                  label={`HSN / SAC, item ${lineNumber}`}
                  inputMode="numeric"
                  value={item.hsn}
                  onChange={(event) => updateItem(item.id, 'hsn', event.target.value)}
                />
              )}
            </div>
          </div>
        );
      })}
      <Button variant="secondary" onClick={() => onChange([...items, createEmptyLine()])}>
        Add line
      </Button>
    </fieldset>
  );
}
