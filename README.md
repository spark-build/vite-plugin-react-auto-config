# vite-plugin-react-auto-config

依托于 [vite](https://github.com/vitejs/vite) 的插件机制实现的类 [umi](https://github.com/umijs/umi) 的按照约定配置，自动生成路由以及集成的 react 生态库相关配置的脚手架

## 破坏性更新
`react-router-dom@6.x` 后，需要使用 `<Outlet />` 来替代之前使用了 `children` 作为嵌套路由渲染的占位符

## Support

- [x] 基于 [react-router-dom@6.x](https://github.com/vitejs/vite/tree/main/packages/plugin-react-refresh#readme) 实现的路由系统
  - [x] 配置式路由
  - [ ] 约定式路由
  - [x] 类似 `vue-router@4.x` 的路由守卫, 详见 `example/src/permission.ts`
  - [x] 类似 `vue-router@4.x` 的路由别名以及编程式跳转，详见 `example` 示例
- [x] 内置基于 [@vitejs/plugin-react](https://www.npmjs.com/package/@vitejs/plugin-react) 实现 React 的 `automatic JSX runtime`、`react-refresh`
- [x] 基于 [react-i18next](https://github.com/i18next/react-i18next) 实现的国际化（i18n）
- [x] 基于 [@loadable/component](https://loadable-components.com/docs/getting-started/) 实现路由懒加载、路由代码切割
- [x] 内置 [vite-plugin-windicss](https://github.com/windicss/vite-plugin-windicss), 可以通过配置开启，默认关闭
- [x] 内置基于 [vite-plugin-style-import](https://github.com/anncwb/vite-plugin-style-import) 实现的 `antd` 等库的按需加载, 默认对 `antd`、`@ant-design/icons` 进行按需加载，可以通过配置进行关闭、拓展
- [x] 内置基于 [vite-plugin-mkcert](https://github.com/liuweiGL/vite-plugin-mkcert) 实现的使用 mkcert 为 vite https 开发服务提供证书支持，同时开启 http/2 来优化 vite http dev server 请求的并发问题
- [x] 内置基于 [@spark-build/transform-antd-theme-variable](https://github.com/spark-build/transform-antd-theme-variable) 实现对 `antd` 的 `less` 主题色变量转换为 `css variable`, 以达到无 `runtime` 的实时动态主题色切换
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

export default async () =>
  defineConfig({
    // ...
    plugins: await reactAutoConfig(), // or [...await reactAutoConfig(), otherPlugin()]
    // ...
  });
```

#### 配置文件

```typescript
// config/index.ts  该文件需要自己创建
import { defineConfig } from '@spark-build/vite-plugin-react-auto-config';

/**
 * 跟 umi 一样的配置方式
 *
 * @see https://umijs.org/zh-CN/config
 */
export default defineConfig({
  routes: [
    {
      path: '/',
      component: '@/layouts/BasicLayout',
      routes: [
        {
          index: true,
          // 支持类似 vue-router-next 的路由别名
          name: 'home',
          component: '@/pages/Home',
          routes: [
            {
              path: 'hello',
              name: 'hello',
              component: '@/pages/Hello',
            },
          ],
        },
        {
          path: '*',
          component: '@/pages/NotFound',
        },
      ],
    },
  ],
  strictMode: true,
  react: {
    // @see https://github.com/vitejs/vite/tree/main/packages/plugin-react#readme
  },
  dynamicImport: {
    loading: '@/pages/Loading',
    delay: 60,
  },
  locale: {
    default: 'zh-CN',
  },
  antd: {
    // 将主题色等 less 变量转换为 css variable
    // toCssVariable: true,
  },
  mkcert: true,
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
        requestMethod: (param) => axios(param),
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

#### 示例

```bash
git clone https://github.com/spark-build/vite-plugin-react-auto-config.git && cd vite-plugin-react-auto-config && yarn && yarn build && cd example && yarn && yarn dev
```
