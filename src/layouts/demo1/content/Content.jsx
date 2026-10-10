import { Outlet } from 'react-router';
import { Container } from '@/components/container';
import { useResponsive } from '@/hooks';
import { Breadcrumbs } from '../';
import StudentNavigationBar from '@/components/StudentNavigationBar';
import { useAuthContext } from '../../../auth/useAuthContext';

const Content = () => {
  const mobileMode = useResponsive('down', 'lg');
  const { auth } = useAuthContext();
  const isStudent = auth?.user?.role === 'student';

  return <div className="grow content pt-5" role="content">
      {mobileMode && <Container>
          <Breadcrumbs />
        </Container>}
      {isStudent && (
        <Container>
          <StudentNavigationBar />
        </Container>
      )}
      <Outlet />
    </div>;
};
export { Content };
