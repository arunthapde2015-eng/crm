import { MerchantsPanel } from '@/features/merchants';

/**
 * @param {object} props
 * @param {(navId: string) => void} props.onNavigate
 */
export function MerchantsPage({ onNavigate }) {
  return <MerchantsPanel onNavigate={onNavigate} />;
}
