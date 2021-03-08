import '@babel/polyfill'
import 'mutationobserver-shim'
import Vue from 'vue'
import './plugins/bootstrap-vue'
import App from './App.vue'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import './style/app.less'
import { formatDate } from "./utils.js";
Vue.use(BootstrapVue)

Vue.config.productionTip = false
Vue.filter('formatDate', formatDate)
new Vue({
  render: h => h(App),
}).$mount('#app')
