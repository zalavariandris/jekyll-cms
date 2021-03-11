import Vue from 'vue'
import Vuex, { Store } from 'vuex'
import axios from 'axios'
import Jekyll from '@/jekyll'
import {b64EncodeUnicode} from '@/jekyll'
import { Octokit } from '@octokit/rest'
// import token from "@/../tests/token"

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

import {IBlob, ISite, IPage, pull, site_to_git, site_from_git, push, Git} from '@/jekyll2'

export default new Vuex.Store({
  state: {
    status: '',
    user:{
      token: localStorage.getItem('accessToken')
    },

    host: {
      type: '',
      owner: 'zalavariandris',
      repo: 'zalavaridesign_jekyll',
      branch: 'master'
    },

    site: {
      drafts: Array<[string, IBlob]>(),
      includes: Array<[string, IBlob]>(),
      layouts: Array<[string, IBlob]>(),
      posts: Array<IBlob>(),
      data: Array<[string, IBlob]>(),
      sass: Array<[string, IBlob]>(),
      pages: Array<IPage>(),
      static_files: Array<[string, IBlob]>(),
      ignored: Array<[string, IBlob]>(),
      collections: Array<string>()
    },
    page: null,
    origin: null,
    projects_status:'',
  	jekyll
  },

  getters: {
    git(state): Git{
      return site_to_git(state.site)
    }
  },

  mutations: {
    auth_request(state){
      state.status = 'logging-in';
    },
    auth_success(state, {user, host}){
      state.status = "logged-in";
      state.user = user
      state.host = host

      localStorage.setItem('accessToken', user.token)
      localStorage.setItem('host', JSON.stringify(host))

      // jekyll.configure({
      //   owner: state.host.owner,
      //   repo: state.host.repo,
      //   branch: state.host.branch,
      //   token: state.user.token
      // })
    },
    auth_error(state){
      state.status = "login-error"
    },
    logout(state){
      state.host = {type: '', owner: '', repo: '', branch: ''};
      state.status = ''
    },
    set_projects(state, projects){
      // state.site.projects = projects
    },
    set_posts(state, posts){
      state.site.posts = posts
    },
    set_pages(state, pages){
      state.site.pages = pages
    },
    set_page(state, page){
      state.page = page
    }
  },

  actions: {
    async pull({commit, state}):Promise<void>{
      return new Promise((resolve)=>{
        pull({
          owner: state.host.owner,
          repo: state.host.repo,
          branch: state.host.branch,
          token: state.user.token
        })
        .then((git)=>{
          state.origin = git

          state.site = site_from_git(git)
          resolve()
        })
        .catch(err=>{
          debugger
        })
      })
    },

    async push({commit, state}):Promise<void>{
      return new Promise((resolve, reject)=>{
        push({
          owner: state.host.owner, 
          repo: state.host.repo, 
          branch: state.host.branch, 
          token: state.user.token!, 
          git: this.getters.git,
          message: "push"
        })
        .then(()=>{
          resolve()
        })
        .catch(err=>{
          reject(err)
        })
      })

    }

    // loadProjects({commit}){
    //   return jekyll.listProjects()
    //   .then((projects)=>{
    //     commit("set_projects", projects)
    //   }).catch(error=>{
    //     commit("set_pages", [])
    //   })
    // },

    // loadPosts({commit}){
    //   return jekyll.listPosts()
    //   .then((posts)=>{
    //     commit("set_posts", posts)
    //   }).catch(error=>{
    //     commit("set_pages", [])
    //   })
    // },

    // loadPages({commit}){
    //   return jekyll.listPages()
    //   .then((pages)=>{
    //     commit("set_pages", pages)
    //   }).catch(error=>{
    //     commit("set_pages", [])
    //   })
    // },

    // loadProject({commit, state}, project_id){
    //   return jekyll.fetchProject(project_id)
    //   .then(project=>{
    //     commit('set_page', project)
    //   })
    // },

    // loadPost({commit, state}, post_id){
    //   return jekyll.fetchPost(post_id)
    //   .then(post=>{
    //     commit('set_page', post)
    //   })
    // },

    // loadPage({commit, state}, page_id){
    //   return jekyll.fetchPage(page_id)
    //   .then(page=>{
    //     commit('set_page', page)
    //   })
    // },

    // saveProject({commit, state}, {project_id, project}){
    //   return jekyll.saveProject(project_id, project)
    // },

    // savePost({commit, state}, {post_id, post}){
    //   return jekyll.savePost(post_id, post)
    // },

    // savePage({commit, state}, {page_id, page}){
    //   return jekyll.savePage(page_id, page)
    // },

    // deleteProject({commit, state}, project_id){
    //   return jekyll.deleteProject(project_id)
    // },

    // deletePost({commit, state}, post_id){
    //   return jekyll.deletePost(post_id)
    // },

    // autologin({commit, state}):Promise<void>{
    //   return new Promise( (resolve, reject)=>{        
    //       // grab token from local storage
    //       const token = localStorage.getItem('accessToken')
    //       const IsTokenValid = token!.length!=40

    //       // grab host from local storage
    //       const host = 'host' in localStorage ? JSON.parse(localStorage.getItem('host')!) : null
    //       const IsHostValid = host && host.owner && host.repo && host.branch

    //       if(IsTokenValid && IsHostValid){
    //         commit('auth_success', {
    //           user: {token},
    //           host: host
    //         })
    //         resolve()
    //       }
    
    //       // grab repo from config
    //       axios("./admin.config.json")
    //       .then(response=>{
    //         commit('auth_success', {
    //           user: {token},
    //           host: response.data.host
    //         })
    //         resolve()
    //       })
    //       .catch(error=>{
    //         reject(error)
    //       })
    //     });
    // },

    // login({commit, state}, {owner, repo, branch, token}):Promise<unknown>{
    //   return new Promise((resolve, reject)=>{
    //     commit('auth_request');

    //     const octokit = new Octokit({
    //       auth: token
    //     });

    //     let sha = undefined;
    //     octokit.repos.getContent({
    //         owner: owner,
    //         repo: repo,
    //         ref: branch,
    //         path: "/admin/admin.config.json",
    //         headers: {'If-None-Match': ''} //prevent cache
    //     })
    //     .then( (response:any)=>{
    //         sha = response.data.sha;
    //     } )
    //     .catch( error=>{
    //         sha = undefined
    //     } )
    //     .finally( ()=>{
    //       const content = JSON.stringify({owner, repo, branch})
    //       octokit.repos.createOrUpdateFileContents({
    //         owner,
    //         repo,
    //         branch,
    //         path: "admin/admin.config.json",
    //         message: "authenticate by updating ghpages.config",
    //         content: b64EncodeUnicode(content),
    //         sha: sha
    //       })
    //       .then( response=>{
    //         commit('auth_success', {owner, repo, branch, token})
    //         resolve(response)
    //       })
    //       .catch( error=>{
    //         commit('auth_error')
    //         reject(error)
    //       })
    //     })
    //   })
    // },

    // logout({commit}):Promise<void>{
    //   return new Promise((resolve, reject)=>{
    //     commit('logout')
    //     localStorage.removeItem('accessToken')
    //     resolve()
    //   })
    // }
  }
})
