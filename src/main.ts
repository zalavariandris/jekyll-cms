import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import YAML from 'yaml'
import urljoin from 'url-join'
import pathParse from 'path-parse'
import axios from 'axios'

declare global {
  interface Window { 
    YAML: any;
    urljoin: urljoin,
    pathParse: any
  }
}

window.YAML = YAML;
window.urljoin = urljoin;
window.pathParse = pathParse

Vue.config.productionTip = false

/*** STYLE ***/
import "./style/reset.css"
import "./style/icons.scss"


/*** PLUGINS ***/
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
  data: {},
  mounted(){
    window.app = this;

    axios("./admin.config.json")
    .then(response=>{
      const owner = response.data.host.owner;
      const repo = response.data.host.repo;
      const branch = response.data.host.branch;
      const token = localStorage['accessToken']
      
      this.$store.dispatch('login', {owner, repo, branch, token})
      .then(response=>{
        this.$router.push({name: "site"})
      })
      .catch(error=>{
        this.$router.push({name: 'login'})
      })
    })
  },
  router,
  store,
  render: h => h(App)
}).$mount('#app')
