import { RouterHelper } from '@@/router';

import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

NProgress.configure({ showSpinner: false });

const sleep = (num: number) => new Promise((r) => setTimeout(r, num));

const checkPermission = async () => {
  await sleep(160);

  return true;
};

const initInitializeApplication = async () => {
  await sleep(360);

  return true;
};

/**
 * 类似 vue-router-next 的全局前置守卫
 *
 * @returns {boolean|undefined} 返回 false 则取消路由初始化、路由跳转，返回 undefined、true 则正常执行
 */
RouterHelper.beforeEach(async ({ from }) => {
  // 路由跳转前，开启进度条
  NProgress.start();

  // 初始化的时候 from 是为空的
  if (!from) {
    // 可以在这里做整个应用的初始化
    return initInitializeApplication();
  }

  // 可以在这里做路由跳转前的权限校验
  return checkPermission();
});

/**
 * 类似 vue-router-next 的全局后置钩子
 */
RouterHelper.afterEach(() => {
  // 路由跳转后，关闭进度条
  NProgress.done();
});
