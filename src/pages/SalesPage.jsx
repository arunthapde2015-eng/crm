import { SalesPanel } from '@/features/sales';

/**
 * @param {object} props
 * @param {(navId: string) => void} props.onNavigate
 */
export function SalesPage({ onNavigate }) {
  return <SalesPanel onNavigate={onNavigate} />;
}
