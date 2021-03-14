import { ConfigProvider } from 'antd';
import { {{ #isI18n }}useEffect, {{ /isI18n }}useState } from 'react';

{{ #isI18n }}
import { useTranslation } from '../index';
{{ /isI18n }}

{{{ importsText }}}

{{{ localesText }}}

export const RenderAntdConfigProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [locale, setLocale] = useState(locales['{{{ defaultLocale }}}']);
  {{ #isI18n }}
  const { i18n } = useTranslation();

  useEffect(() => {
    i18n.on('languageChanged', (l: keyof typeof locales) => {
      if (locales[l]) {
        setLocale(locales[l]);
      }
    });
  }, []);
  {{ /isI18n }}

  return (
    <ConfigProvider
      {...{
        locale,
        {{ #componentSize }}
        componentSize: '{{{ componentSize }}}',
        {{ /componentSize }}
        {{ #autoInsertSpaceInButton }}
        autoInsertSpaceInButton: '{{{ autoInsertSpaceInButton }}}',
        {{ /autoInsertSpaceInButton }}
        {{ #csp }}
        csp: '{{{ csp }}}',
        {{ /csp }}
        {{ #iconPrefixCls }}
        iconPrefixCls: '{{{ iconPrefixCls }}}',
        {{ /iconPrefixCls }}
        {{ #prefixCls }}
        prefixCls: '{{{ prefixCls }}}',
        {{ /prefixCls }}
      }}
    >
      {children}
    </ConfigProvider>
  );
};
