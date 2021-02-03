import Vue from 'vue'
import Vuex from 'vuex'

import Jekyll from '../jekyll'

const jekyll = new Jekyll({
	owner: "zalavariandris",
	repo: "cms-sandbox",
  branch: "master",
  token: localStorage['accessToken']
})

import axios from 'axios'

declare global {
  interface Window {
    jekyll: any,
    axios: any
  }
}

window.jekyll = jekyll
window.axios = axios

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  	jekyll
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  }
})
