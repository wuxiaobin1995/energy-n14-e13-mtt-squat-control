/*
 * @Author      : Mr.bin
 * @Date        : 2023-04-14 15:23:55
 * @LastEditTime: 2023-04-28 17:17:01
 * @Description : 路由
 */
import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

// 解决ElementUI导航栏中的vue-router在3.0版本以上重复点菜单报错问题
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

const routes = [
  /*
   * 前面加"/"表示绝对路径，不加"/"表示相对路径
   * 一般嵌套路由中的子路由不需要加"/"，它会在父路由后自动加上"/子路由"
   * 比如父 "/father"，子 "child"，要想访问子路由，跳转链接需要写成 "/father/child"
   */

  {
    path: '/',
    name: 'layout',
    component: () => import('@/layout'),
    redirect: '/home',
    children: [
      // 首页
      {
        path: 'home',
        name: 'home',
        component: () => import('@/views/home'),
        meta: ['首页']
      },
      // 调零
      {
        path: 'set-zero',
        name: 'set-zero',
        component: () => import('@/views/set/set-zero'),
        meta: ['调零']
      },
      // 设置K
      {
        path: 'set-k',
        name: 'set-k',
        component: () => import('@/views/set/set-k'),
        meta: ['设置K']
      },
      // 开发者
      {
        path: 'set-developer',
        name: 'set-developer',
        component: () => import('@/views/set/set-developer'),
        meta: ['开发者']
      },

      // 任务详情页
      {
        path: 'task',
        name: 'task',
        component: () => import('@/views/task'),
        meta: ['任务详情页']
      },

      /* 评估 */
      // 精准负重测试-具体测量
      {
        path: 'precision-weight-measure',
        name: 'precision-weight-measure',
        component: () => import('@/views/test-mode/precision-weight/measure'),
        meta: ['精准负重测试-具体测量']
      },
      // 站立稳定测试-具体测量
      {
        path: 'standing-stability-measure',
        name: 'standing-stability-measure',
        component: () => import('@/views/test-mode/standing-stability/measure'),
        meta: ['站立稳定测试-具体测量']
      }
    ]
  },

  {
    path: '/refresh',
    name: 'refresh',
    component: () => import('@/views/refresh')
  },

  {
    path: '*',
    redirect: '/'
  }
]

const router = new VueRouter({
  routes,
  /* 自定义路由切换时页面如何滚动 */
  scrollBehavior(to, from, savedPosition) {
    return { x: 0, y: 0 } // 回到顶部
  }
})
export default router
