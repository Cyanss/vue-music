import 'babel-polyfill';
import Vue from 'vue';
import App from './App';
import router from './router';
import store from './store';
import FastClick from 'fastclick';
import 'common/stylus/index.styl';
// import VConsole from 'vconsole';
import VueLazyLoad from 'vue-lazyload';
Vue.config.productionTip = false;
FastClick.attach(document.body);
/* eslint-disable no-unused-vars */
// let vConsole = new VConsole();
Vue.use(VueLazyLoad, {
  loading: require('common/image/default.png')
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
});
