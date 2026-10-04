import { PageHeader } from '@/components/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { MyHrPanel } from '@/features/hr';

export function MyHrPage() {
  const { currentUser, currentRole } = useAuth();
  return (
    <>
      <PageHeader
        title="My HR"
        description={`${currentUser.name}, ${currentUser.designation || currentRole.name}`}
      />
      <MyHrPanel />
    </>
  );
}
