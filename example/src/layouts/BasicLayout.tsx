import { Button } from 'antd';
import { useTranslation } from '@@/index';
import { RouterHelper, Outlet, useLocation } from '@@/router';

const GoToHome = () => {
  const { t } = useTranslation();
  const location = useLocation();

  if (location.pathname === '/') {
    return null;
  }

  return (
    <Button className="mb-24px" onClick={() => RouterHelper.push('/')}>
      {t('goTo')}
      {t('route.home')}
    </Button>
  );
};

export default function BasicLayout() {
  return (
    <>
      <GoToHome />

      <Outlet />
    </>
  );
}
