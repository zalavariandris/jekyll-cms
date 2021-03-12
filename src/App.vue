<template>
  <v-app>
    <vue-progress-bar></vue-progress-bar>

    <v-app-bar app clipped-left flat>
      <v-toolbar-title>Jekyll-cms</v-toolbar-title>
      <v-spacer></v-spacer>
      
      {{$store.state.host.repo}}<br/><v-chip>{{$store.state.host.branch}}</v-chip>
      <v-btn @click="pull">pull</v-btn>
      <v-btn @click="push">push</v-btn>

      <v-tooltip bottom v-if="isGitModified" show>
        <template v-slot:activator="{ on, attrs }">
          <v-chip 
            v-bind="attrs"
            v-on="on"
          >
          modified
          </v-chip>
        </template>
        <pre style="white-space: pre-wrap">{{change | pretty}}</pre>
      </v-tooltip>
      
      <v-spacer></v-spacer>
      {{status}}
      <v-btn elevation="0">
        <v-icon left>mdi-logout</v-icon>
        logout
      </v-btn>
    </v-app-bar>

    <v-main>
      <router-view></router-view>
    </v-main>
    
    <v-footer app>
      <small><i>powered by:</i></small>
      <img src="@/assets/logo.png" 
      style="height:1.3rem; margin-bottom: -0.35em; margin-left: 0.3em;">
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import {diff} from '@/jekyll2'
import YAML from 'yaml'
export default Vue.extend({
  computed: {
    showtooltip(){
      return true
    },
    status(){
      return this.$store.state.status;
    },

    change(){
      if(this.$store.getters.git && this.$store.state.origin){
        return diff(this.$store.getters.git, this.$store.state.origin) 
      }
    },

    isGitModified(){
      if(this.change){
        for(let path in this.change){
          return true;
        }
        return false;
      }
    }
  },

  filters: {
          pretty(value){
            return YAML.stringify(value)
        }
  },

  methods: {
    pull(){
      this.$store.dispatch('pull')
      .then(()=>{
        alert("pull done")
      })
      .catch(err=>{
        alert(err.message)
      })
    },

    push(){
      this.$store.dispatch('push')
      .then(()=>{
        alert("push done")
      })
      .catch(err=>{
        alert(err.message)
      })
    },

    on_logout(){
      this.$store.dispatch('logout')
      .then((response)=>{
        this.$router.push({name:'login'})
      })
    }
  }
})
</script>