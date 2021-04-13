# vite-plugin-react-auto-config

依托于 [vite](https://github.com/vitejs/vite) 的插件机制实现的类 [umi](https://github.com/umijs/umi) 的按照约定配置，自动生成路由以及集成的 react 生态库相关配置的脚手架

## Support

- [x] 基于 [react-router-dom@6.0.0-beta.0](https://github.com/vitejs/vite/tree/main/packages/plugin-react-refresh#readme) 实现的路由系统
  - [x] 配置式路由
  - [ ] 约定式路由
  - [ ] 类似 `vue-router@4` 的路由守卫
- [x] 基于 [react-i18next](https://github.com/i18next/react-i18next) 实现的国际化（i18n）
- [x] 基于 [@loadable/component](https://loadable-components.com/docs/getting-started/) 实现路由懒加载、路由代码切割
- [x] 内置基于 [@vitejs/plugin-react-refresh](https://github.com/vitejs/vite/tree/main/packages/plugin-react-refresh#readme) 实现的 `react-refresh`, 默认启用，可以通过配置进行关闭
- [x] 内置基于 [vite-plugin-style-import](https://github.com/anncwb/vite-plugin-style-import) 实现的 `antd` 等库的按需加载, 默认对 `antd`、`@ant-design/icons` 进行按需加载，可以通过配置进行关闭、拓展
- [x] 类似 umi 的运行时配置（未实现全部功能）
- [x] 内置配置了 `@` 映射到 `project/src` 的路径别名
- [x] 跟 umi 类似的插件系统
- [x] 检测配置文件变化，自动应用配置变更进行编译

## Installation

```bash
yarn add -D @spark-build/vite-plugin-react-auto-config
```

## Usage

#### 引入插件

```typescript
// vite.config.ts

import { defineConfig } from 'vite';
import { reactAutoConfig } from '@spark-build/vite-plugin-react-auto-config';

export default defineConfig({
  // ...
  plugins: [...reactAutoConfig()],
  // ...
});
```

#### 配置文件

```typescript
// config/index.ts  该文件需要自己创建
import { defineConfig } from '@spark-build/vite-plugin-react-auto-config/lib/core';
import routes from './routes';

/**
 * 跟 umi 一样的配置方式
 *
 * @see https://umijs.org/zh-CN/config
 */
export default defineConfig({
  routes: [
    {
      path: '/',
      component: '@/layouts/App',
      routes: [
        {
          path: '/',
          component: '@/layouts/BasicLayout',
          routes: [
            {
              path: 'hello',
              component: '@/pages/Hello',
            },
          ],
        },
      ],
    },
    {
      path: '*',
      component: '@/pages/NotFound',
    },
  ],
  strictMode: true,
  dynamicImport: {
    loading: '@/pages/Loading',
    delay: 60,
  },
  locale: {
    default: 'zh-CN',
  },
  antd: {},
});
```

#### 运行时配置

约定 `src/app.{tsx|ts|js|jsx}` 为运行时配置，`app.{css|less|scss}` 为全局样式文件，这两个文件创建后会自动引入

```typescript
// src/app.tsx

import { UseRequestProvider } from 'ahooks';

/**
 * 修改交给 react-dom 渲染时的根组件。
 * 1、比如用于在外面包一个 Provider
 * 2、比如用于渲染之前做权限校验
 */
export const rootContainer = (children?: React.ReactElement) => {
  return (
    <UseRequestProvider
      value={{
        requestMethod: requestMethod: (param)=> axios(param),
      }}
    >
      {children}
    </UseRequestProvider>
  );
};
```

```less
// src/app.less

:root {
  --primary-color: @primary-color;
}
```
