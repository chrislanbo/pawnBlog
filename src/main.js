import Vue from 'vue'
import VuerResource from 'vue-resource'
import App from './App'
import router from './router'
import { currentUser } from './bmob'

import '@/assets/style/reset.css'
import '@/assets/style/markdown.less'
import '@/assets/font_icon/iconfont.css'

Vue.use(VuerResource);

Vue.http.options.emulateJSON = true;	/*vue-resource的坑，post请求头不对*/
Vue.config.productionTip = false;


/* eslint-disable no-new */
var vm = new Vue({
	el: '#app',
	router,
	template: '<App/>',
	components: { App },
})

router.beforeEach((to, from, next) => {
	// 要去的路由需要登录
	if (to.meta.requireAuth) {
    // 获取cookie，判断是否要重新发送请求
    currentUser().then((result) => {
      next()
			return;
    }, (res) => {
      if (res.code === '001') {
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
      }
    })
	} else {
		next();
	}
})
