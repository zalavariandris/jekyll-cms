import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

import ListProjects from '@/views/ListProjects.vue'
import EditProject from '@/views/EditProject.vue'

import ListPosts from '@/views/ListPosts.vue'
import EditPost from '@/views/EditPost.vue'

import ListPages from '@/views/ListPages.vue'
import EditPage from "@/views/EditPage.vue"

import Dashboard from "@/views/Dashboard.vue"

import IDE from "@/components/IDE.vue"

import store from '@/store'


import Login from "@/views/Login.vue"

import Site from "@/views/Site.vue"

import ListStaticFiles from '@/views/ListStaticFiles.vue'

import axios from 'axios'

import JekyllTree from '@/views/JekyllTree.vue'
import Jekyll from '@/jekyll'
import * as jekyll2 from '@/jekyll2'
import TestSHA from "@/views/TestSHA.vue"

Vue.use(VueRouter)


const routes: Array<RouteConfig> = [
  {path: "/test", component: TestSHA},
  { path: "/login", name: "login", component: Login,},

  { path: "/jekyll", component: JekyllTree},

  { 
    path: "/",
    name: 'site',
    component: Site,
    beforeEnter(to, from, next){
      console.log("pull...")
      store.dispatch('pull', {
        owner: "zalavariandris",
        repo: "zalavaridesign_jekyll",
        branch: "master",
        token: localStorage.getItem('accessToken')
      })
      .then(()=>{
        console.log("done!")
        next()
      })
    },

    children: [
      { 
        path: 'projects', 
        name: "listProjects", 
        component: ListProjects,
        // beforeEnter(to, from, next){
        //   store.dispatch('loadProjects')
        //   .then(()=>next())
        // }
       },
  
      { 
        path: 'projects/:id/edit', 
        name: 'editProject', 
        component: EditProject,
        beforeEnter(to, from, next){
          
          const project_id = to.params.id
          const site:jekyll2.ISite = store.state.site
          const idx = site.projects.findIndex(p=>p.id==project_id)
          store.state.page = site.projects[idx]
          next()
          // const project_id = to.params.id
          // store.dispatch('loadProject', project_id)
          // .then(()=>next())
        }
     },
    
      { 
        path: 'posts', 
        name: "listPosts", 
        component: ListPosts,
        // beforeEnter(to, from, next){
        //   store.dispatch('loadPosts')
        //   .then(()=>next())
        // }
      },
      { path: 'posts/:id/edit', name: 'editPost', component: EditPost,
        beforeEnter(to, from, next){
          const post_id = to.params.id
          const site:jekyll2.ISite = store.state.site
          const idx = site.posts.findIndex(p=>p.id==post_id)
          store.state.page = site.posts[idx]
          next()
        }
    },
    
      { 
        path: "pages", 
        name: 'listPages', 
        component: ListPages,
      },
      { 
        path: "pages/:id/edit", 
        name: 'editPage', 
        component: EditPage,
        beforeEnter(to, from, next){
          const page_id = to.params.id
          const site:jekyll2.ISIte = store.state.site
          const idx = site.pages.findIndex(p=>p.id==page_id)
          store.state.page = site.pages[idx]
          next()
        }
      },
    
      { path: "dashboard", name: 'dashboard', component: Dashboard},
    
      { path: "IDE", name: 'IDE', component: IDE},

      { path: 'static_files', name: 'static_files', component: ListStaticFiles}
    ]
  }
]

const router = new VueRouter({
  routes
})

// router.beforeEach( (to, from, next)=>{
//   console.log(from.path, to.path)
//   const LoggedIn = store.state.status === 'logged-in'
//   if(LoggedIn || to.name=="login"){
//     next()
//   }else{
//     next({name: "login"})
//   }
// })

export default router
