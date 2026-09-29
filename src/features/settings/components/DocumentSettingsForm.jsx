import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';

import { ADDRESS_ROWS } from '../constants';
import { useDocumentSettings } from '../hooks/useDocumentSettings';
import { SettingsSection } from './SettingsSection';
import styles from './DocumentSettingsForm.module.css';

export function DocumentSettingsForm({ initialSettings }) {
  const { settings, hasUnsavedChanges, updateField, saveSettings } =
    useDocumentSettings(initialSettings);

  function getFieldProps(fieldName) {
    return {
      id: `document-settings-${fieldName}`,
      name: fieldName,
      value: settings[fieldName],
      onChange: (event) => updateField(fieldName, event.target.value),
    };
  }

  function handleSubmit(event) {
    event.preventDefault();
    saveSettings();
  }

  return (
    <form onSubmit={handleSubmit}>
      <SettingsSection title="Letterhead and contact">
        <div className={styles.column}>
          <TextField label="Name on quotation letterhead" {...getFieldProps('letterheadName')} />
          <TextField
            label="Registered address (one line each)"
            rows={ADDRESS_ROWS}
            {...getFieldProps('registeredAddress')}
          />
        </div>
        <div className={styles.column}>
          <TextField label="Legal name on invoices" {...getFieldProps('legalName')} />
          <TextField label="Mobile / phone" type="tel" {...getFieldProps('phone')} />
          <TextField label="Email" type="email" {...getFieldProps('email')} />
          <TextField label="CIN (optional)" {...getFieldProps('cin')} />
        </div>
      </SettingsSection>

      <SettingsSection title="Bank details printed on proformas and invoices">
        <TextField label="Bank name" {...getFieldProps('bankName')} />
        <TextField label="Branch" {...getFieldProps('bankBranch')} />
        <TextField label="Account name" {...getFieldProps('accountName')} />
        <TextField label="Account number" inputMode="numeric" {...getFieldProps('accountNumber')} />
        <TextField label="IFSC code" {...getFieldProps('ifscCode')} />
      </SettingsSection>

      <div className={styles.footer}>
        <p className={styles.status} aria-live="polite">
          {hasUnsavedChanges ? 'You have unsaved changes.' : 'All changes saved.'}
        </p>
        <Button type="submit" disabled={!hasUnsavedChanges}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
