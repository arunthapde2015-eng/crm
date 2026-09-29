import { useState } from 'react';

import { DEFAULT_DOCUMENT_SETTINGS } from '../constants';

/**
 * Editable letterhead and bank details, with a saved snapshot to detect unsaved edits.
 * Saving is local only until a settings API exists.
 */
export function useDocumentSettings(initialSettings = DEFAULT_DOCUMENT_SETTINGS) {
  const [settings, setSettings] = useState(initialSettings);
  const [savedSettings, setSavedSettings] = useState(initialSettings);

  const hasUnsavedChanges = settings !== savedSettings;

  function updateField(fieldName, value) {
    setSettings((current) => ({ ...current, [fieldName]: value }));
  }

  function saveSettings() {
    setSavedSettings(settings);
  }

  return { settings, hasUnsavedChanges, updateField, saveSettings };
}
