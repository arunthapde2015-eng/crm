import { PageHeader } from '@/components/PageHeader';
import { CURRENT_USER } from '@/constants/session';
import { MyHrPanel } from '@/features/hr';

export function MyHrPage() {
  return (
    <>
      <PageHeader title="My HR" description={`${CURRENT_USER.name}, ${CURRENT_USER.designation}`} />
      <MyHrPanel />
    </>
  );
}
