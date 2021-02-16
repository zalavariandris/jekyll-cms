import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import Jekyll from '@/jekyll'
import {b64EncodeUnicode} from '@/jekyll'
import { Octokit } from '@octokit/rest'

const jekyll = new Jekyll()

declare global {
  interface Window {
    jekyll: any,
    axios: any,
    app: any
  }
}

window.jekyll = jekyll
window.axios = axios

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    status: '',
    host: {
      owner: '',
      repo: '',
      branch: '',
      token: ''
    },

  	jekyll
  },

  mutations: {
    auth_request(state){
      state.status = 'logging-in';
    },

    auth_success(state, {owner, repo, branch, token}){
      state.status = "logged-in";
      state.host = {owner, repo, branch, token};
    },

    auth_error(state){
      state.status = "login-error"
    },

    logout(state){
      state.host = {owner: '', repo: '', branch: '', token: ''};
      state.status = ''
    }
  },

  actions: {
    login({commit}, {owner, repo, branch, token}):Promise<unknown>{
      return new Promise((resolve, reject)=>{
        commit('auth_request');

        const octokit = new Octokit({
          auth: token
        });

        let sha = undefined;
        octokit.repos.getContent({
            owner,
            repo,
            ref: branch,
            path: "/admin/ghpages.config.json",
            headers: {'If-None-Match': ''} //prevent cache
        })
        .then( (response:any)=>{
            sha = response.data.sha;
        } )
        .catch( error=>{
            sha = undefined
        } )
        .finally( ()=>{
          const content = JSON.stringify({owner, repo, branch})
          octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            branch,
            path: "admin/ghpages.config.json",
            message: "authenticate by updating ghpages.config",
            content: b64EncodeUnicode(content),
            sha: sha
          })
          .then( response=>{
            jekyll.configure({owner, repo, branch, token})
            commit('auth_success', {owner, repo, branch, token})
            resolve(response)
          })
          .catch( error=>{
            commit('auth_error')
            reject(error)
          })
        })

      })
    },

    logout({commit}):Promise<void>{
      return new Promise((resolve, reject)=>{
        commit('logout')
        localStorage.removeItem('accessToken')
        resolve()
      })
    },

    listProjects({commit}){
      return jekyll.listProjects()
    }
  },

  modules: {

  }
})
