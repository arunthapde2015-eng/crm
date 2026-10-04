import { ProformasPanel } from '@/features/proformas';

/**
 * @param {object} props
 * @param {(navId: string) => void} props.onNavigate
 */
export function ProformasPage({ onNavigate }) {
  return <ProformasPanel onNavigate={onNavigate} />;
}
