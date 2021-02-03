import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import YAML from 'yaml'
import urljoin from 'url-join'

declare global {
  interface Window { 
    YAML: any;
    urljoin: urljoin
  }
}

window.YAML = YAML;
window.urljoin = urljoin;

Vue.config.productionTip = false

import "./style/reset.css"
import "./style/icons.scss"

// SimpleMDE
import VueSimplemde from 'vue-simplemde'
import 'simplemde/dist/simplemde.min.css'

Vue.component('vue-simplemde', VueSimplemde)

import VueProgressBar from 'vue-progressbar'

Vue.use(VueProgressBar, {
  color: 'rgb(143, 255, 199)',
  failedColor: 'red',
  height: '2px',
  autoFinish: false
})

import TextareaAutosize from 'vue-textarea-autosize'
Vue.use(TextareaAutosize)

new Vue({
  data: {
    loading: false
  },
  router,
  store,
  render: h => h(App)
}).$mount('#app')
