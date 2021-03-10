import Vue from 'vue'
import App from './App.vue'
import router from '@/router'
import store from '@/store'
import YAML from 'yaml'
import urljoin from 'url-join'
import pathParse from 'path-parse'
import axios from 'axios'

declare global {
  interface Window { 
    YAML: any;
    urljoin: urljoin,
    pathParse: any,
    app: any
  }
}

window.YAML = YAML;
window.urljoin = urljoin;
window.pathParse = pathParse

Vue.config.productionTip = false


/*** PLUGINS ***/
import vuetify from '@/plugins/vuetify' // path to vuetify export

// simplemde
import VueSimplemde from 'vue-simplemde'
import 'simplemde/dist/simplemde.min.css'

Vue.component('vue-simplemde', VueSimplemde)

// progressbar
import VueProgressBar from 'vue-progressbar'

Vue.use(VueProgressBar, {
  color: 'rgb(143, 255, 199)',
  failedColor: 'red',
  height: '2px',
  autoFinish: false
})  

// autosize textarea
import TextareaAutosize from 'vue-textarea-autosize'
Vue.use(TextareaAutosize)

/*** MOUNT VUE ***/
new Vue({
  router,
  store,
  vuetify,
  data: {},
  mounted(){
    window.app = this;
  },
  render: h => h(App)
}).$mount('#app')
