import { useState } from 'react';

/**
 * Checkbox selection limited to the leads currently shown, so hidden rows are never acted on.
 *
 * @param {string[]} visibleLeadIds
 */
export function useLeadSelection(visibleLeadIds) {
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const selectedVisibleIds = visibleLeadIds.filter((id) => selectedIds.has(id));
  const isAllSelected =
    visibleLeadIds.length > 0 && selectedVisibleIds.length === visibleLeadIds.length;
  const isPartlySelected = selectedVisibleIds.length > 0 && !isAllSelected;

  function toggleLead(leadId) {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(leadId)) next.delete(leadId);
      else next.add(leadId);
      return next;
    });
  }

  function toggleAllVisible() {
    setSelectedIds(isAllSelected ? new Set() : new Set(visibleLeadIds));
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  return {
    selectedVisibleIds,
    isSelected: (leadId) => selectedIds.has(leadId),
    isAllSelected,
    isPartlySelected,
    toggleLead,
    toggleAllVisible,
    clearSelection,
  };
}
