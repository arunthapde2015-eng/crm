import { useState } from 'react';

/**
 * Checkbox selection for a list, limited to the items currently shown so that
 * rows hidden by a filter are never acted on.
 *
 * @param {string[]} visibleIds - Ids of the rows currently rendered, in order.
 */
export function useSelection(visibleIds) {
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const selectedVisibleIds = visibleIds.filter((id) => selectedIds.has(id));
  const isAllSelected = visibleIds.length > 0 && selectedVisibleIds.length === visibleIds.length;
  const isPartlySelected = selectedVisibleIds.length > 0 && !isAllSelected;

  function toggle(id) {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllVisible() {
    setSelectedIds(isAllSelected ? new Set() : new Set(visibleIds));
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  return {
    selectedVisibleIds,
    isSelected: (id) => selectedIds.has(id),
    isAllSelected,
    isPartlySelected,
    toggle,
    toggleAllVisible,
    clearSelection,
  };
}
