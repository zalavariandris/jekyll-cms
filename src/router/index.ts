import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

import ListProjects from '@/views/ListProjects.vue'
import NewProject from '@/views/NewProject.vue'
import EditProject from '@/views/EditProject.vue'

import ListPosts from '@/views/ListPosts.vue'
import NewPost from '@/views/NewPost.vue'
import EditPost from '@/views/EditPost.vue'

import ListPages from '@/views/ListPages.vue'
import EditPage from "@/views/EditPage.vue"

import Dashboard from "@/views/Dashboard.vue"

import IDE from "@/components/IDE.vue"

import store from '@/store'


import Login from "@/views/Login.vue"
import FireLogin from '@/views/FireLogin.vue'

import Site from "@/views/Site.vue"

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  { path: "/login", name: "login", component: Login},

  { 
    path: "/",
    name: 'site',
    component: Site,

    children: [
      { path: 'projects', name: "listProjects", component: ListProjects },
  
      { path: 'projects/new', name: 'newProject', component: NewProject },
      { path: 'projects/:id/edit', name: 'editProject', component: EditProject },
    
      { path: 'posts', name: "listPosts", component: ListPosts },
      { path: 'posts/new', name: 'newPost', component: NewPost   },
      { path: 'posts/:id/edit', name: 'editPost', component: EditPost },
    
      { path: "pages", name: 'listPages', component: ListPages},
      { path: "pages/:id/edit", name: 'editPage', component: EditPage},
    
      { path: "dashboard", name: 'dashboard', component: Dashboard},
    
      { path: "IDE", name: 'IDE', component: IDE},
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach( (to, from, next)=>{
  console.log(from.path, to.path)
  const LoggedIn = store.state.status === 'logged-in'
  if(LoggedIn || to.name=="login"){
    next()
  }else{
    next({name: "login"})
  }
})

export default router
