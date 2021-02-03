import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Home from '../views/Home.vue'
import ListProjects from '../views/ListProjects.vue'
import NewProject from '../views/NewProject.vue'
import EditProject from '../views/EditProject.vue'

import ListPosts from '../views/ListPosts.vue'
import NewPost from '../views/NewPost.vue'
import EditPost from '../views/EditPost.vue'

import ListPages from '../views/ListPages.vue'
import EditPage from "../views/EditPage.vue"

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  { path: '/projects', name: "listProjects", component: ListProjects },
  { path: '/projects/new', name: 'newProject', component: NewProject },
  { path: '/projects/:id/edit', name: 'editProject', component: EditProject },

  { path: '/posts', name: "listPosts", component: ListPosts },
  { path: '/posts/new', name: 'newPost', component: NewPost },
  { path: '/posts/:id/edit', name: 'editPost', component: EditPost },

  { path: "/pages", name: 'listPages', component: ListPages},
  { path: "/pages/:id/edit", name: 'editPage', component: EditPage}
]

const router = new VueRouter({
  routes
})

export default router
