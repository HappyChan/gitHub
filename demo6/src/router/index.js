import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import GoodList from '@/components/GoodList'
import linkNew from '@/components/linkNew'
import title from '@/components/title'
import img from '@/components/img'
import Cart from '@/components/Cart'

Vue.use(Router)
//默认为哈希模式，也可以用history，但路由的实现实际都是history这个api进行操作
export default new Router({
  mode: "history",
  routes: [
    {
      path: '/goods/:goodsId/user/:userName',
      name: 'GoodList',
      component: GoodList,
      children:[
        {
          path: 'title',
          name: 'title',
          component:title
        },{
          path: 'img',
          name: 'img',
          component: img
        }
      ]
    },{
      path: '/linkNew',
      name: 'linkNew',
      component: linkNew,
      children:[
        {
          path: 'title',
          name: 'title',
          component:title
        },{
          path: 'img',
          name: 'img',
          component: img
        }
      ]
    },
    {
      path: '/Cart',
      name: 'Cart',
      component: Cart
    }
  ]
})
