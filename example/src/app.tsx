/* eslint-disable import/no-unresolved */
import 'virtual:windi.css';
// import 'virtual:windi-devtools';

import { useTranslation } from '@@/index';
import { Radio } from 'antd';
import { Form } from 'antd';

const GlobalComp = ({ children }: React.PropsWithChildren<{}>) => {
  const { i18n, t } = useTranslation();

  return (
    <div className="p-24px">
      <div>
        <h1 className="mb-24px font-bold text-lg">{t('global.message')}</h1>

        <Form.Item label={t('switchLanguage')}>
          <Radio.Group
            options={[
              { label: '简体中文', value: 'zh-CN' },
              { label: 'English', value: 'en-US' },
            ]}
            onChange={(e) => {
              i18n.changeLanguage(e.target.value);
            }}
            value={i18n.language}
            optionType="button"
            buttonStyle="solid"
          />
        </Form.Item>
      </div>

      {children}
    </div>
  );
};

export const rootContainer = (children?: React.ReactElement) => <GlobalComp>{children}</GlobalComp>;
