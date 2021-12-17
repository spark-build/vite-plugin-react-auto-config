/* eslint-disable import/no-unresolved */
import 'virtual:windi.css';
// import 'virtual:windi-devtools';

import './permission';

import { useTranslation } from '@@/index';
import { Radio } from 'antd';
import { Form } from 'antd';
import { useMemo, useState } from 'react';

import { getThemeVariable } from '@spark-build/transform-antd-theme-variable/dist/generateThemeVariable/getThemeVariable';

// @ts-ignore
import { variables as originVariables } from '../antdThemeVariables';

const GlobalComp = ({ children }: React.PropsWithChildren<{}>) => {
  const [variables, setVariables] = useState(originVariables);
  const { i18n, t } = useTranslation();

  useMemo(() => {
    window.addEventListener('primary-color-change', (e) => {
      setVariables(getThemeVariable((e as CustomEvent<{ primaryColor: string }>).detail));
    });
  }, []);

  return (
    <div
      id="App"
      data-primary-color={variables['--primary-color']}
      className="p-24px"
      style={variables}
    >
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
