import { act, renderHook } from '@testing-library/react';

import { useSelection } from './useSelection';

describe('useSelection', () => {
  it('selects all visible ids, then clears them', () => {
    const { result } = renderHook(() => useSelection(['a', 'b']));

    act(() => result.current.toggleAllVisible());
    expect(result.current.selectedVisibleIds).toEqual(['a', 'b']);
    expect(result.current.isAllSelected).toBe(true);

    act(() => result.current.toggleAllVisible());
    expect(result.current.selectedVisibleIds).toEqual([]);
  });

  it('reports a partial selection', () => {
    const { result } = renderHook(() => useSelection(['a', 'b']));

    act(() => result.current.toggle('a'));

    expect(result.current.isPartlySelected).toBe(true);
    expect(result.current.isSelected('a')).toBe(true);
  });

  it('ignores selected ids that are no longer visible', () => {
    const { result, rerender } = renderHook(({ ids }) => useSelection(ids), {
      initialProps: { ids: ['a', 'b'] },
    });

    act(() => result.current.toggle('a'));
    rerender({ ids: ['b'] });

    expect(result.current.selectedVisibleIds).toEqual([]);
  });
});
