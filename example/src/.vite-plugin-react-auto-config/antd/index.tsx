import { ConfigProvider } from 'antd';
import { useEffect, useState } from 'react';

import { useTranslation } from '../index';

import enUS from 'antd/es/locale/en_US';
import zhCN from 'antd/es/locale/zh_CN';


const locales = {
  'en-US': enUS,
  'zh-CN': zhCN
} as const;


export const RenderAntdConfigProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [locale, setLocale] = useState(locales['zh-CN']);
  const { i18n } = useTranslation();

  useEffect(() => {
    i18n.on('languageChanged', (l: keyof typeof locales) => {
      if (locales[l]) {
        setLocale(locales[l]);
      }
    });
  }, []);

  return (
    <ConfigProvider
      {...{
        locale,
      }}
    >
      {children}
    </ConfigProvider>
  );
};
