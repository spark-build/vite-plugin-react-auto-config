import { useNavigate, useTranslation } from '@@/index';
import { Button } from 'antd';

export default function Other() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div>
      <Button onClick={() => navigate('/')}>
        {t('goTo')}
        {t('route.home')}
      </Button>
    </div>
  );
}
