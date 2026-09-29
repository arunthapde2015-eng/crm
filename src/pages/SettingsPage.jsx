import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { SettingsPanel } from '@/features/settings';

export function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="How quotations, proformas, invoices and receipts look when printed or shared."
        actions={
          <>
            <Button variant="secondary">Preview a quotation</Button>
            <Button variant="secondary">Preview an invoice</Button>
          </>
        }
      />
      <SettingsPanel />
    </>
  );
}
