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

interface IUser{
  token: string | null;
}

interface IHost{
  type: string;
  owner: string;
  repo: string;
  branch: string;
}

interface IState{
  status: string;
  user: IUser;
  host: IHost;
  site: ISite;
  page: IPage | null;
  origin: Git | null;
}

const state: IState = {
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

  page: null,

  site: {
    drafts: [],
    includes: [],
    layouts: [],
    posts: [],
    data: [],
    sass: [],
    pages: [],
    static_files: [],
    ignored: [],
    collections: []
  },
  
  origin: null,
  // projects_status:'',
  // jekyll
}

import mime from 'mime-types'
import urljoin from 'url-join'

export default new Vuex.Store({
  state,

  getters: {
    git(state): Git{
      return site_to_git(state.site)
    },

    getRawContentUrl: (state, getters)=>(path)=>{
        //resolve path
        if(path.startsWith("/")){
          path = path.substring(1)
        }

        const blob = getters.git.tree[path]
        if(!blob){
            return null
        }else if(blob.content){
            return "data:"+mime.lookup(path)+";base64,"+blob.content
        }else{
            return urljoin(`https://raw.githubusercontent.com/${state.host.owner}/${state.host.repo}/${state.host.branch}/`, path);
        }
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
          state.origin = JSON.parse(JSON.stringify(this.getters.git)) // !!!! DEEP COPY
          resolve()
        })
        .catch(err=>{
          reject(err)
        })
      })

    },

    createPost({commit, state}){
      const site:ISite = state.site
      const post: IPage = {
				title: "Untitled",
				date: "2020-01-01",
				id: "_posts/untitled.md",
				categories: [],
				collection: "posts",
				tags: [],
				name: "untitled.md",
				path: "_posts/untitled.md",
				content: "",
        image: null
			}
			site.posts.splice(0, 0, post)
      return post.id
		},

    deletePost({commit, state}, post_id){
      const site:ISite = state.site
			const idx = site.posts.findIndex(p=>p.id===post_id)
			site.posts.splice(idx, 1)
		},

		createProject({commit, state}){
      const site:ISite = state.site
      const project:IPage = {
				title: "Untitled",
				date: "2020-01-01",
				id: "_projects/untitled.md",
				categories: [],
				collection: "projects",
				tags: [],
				name: "untitled.md",
				path: "_projects/untitled.md",
				content: "",
        gallery: []
			}
			site.projects.splice(0, 0, project)
      return project.id
		},
    
		deleteProject({commit, state}, project_id){
      const site:ISite = state.site
			const idx = site.projects.findIndex(p=>p.id===project_id)
			site.projects.splice(idx, 1)
		}
  }
})
