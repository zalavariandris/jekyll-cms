<template>
  <v-app>
    <vue-progress-bar></vue-progress-bar>

    <v-app-bar app clipped-left flat>
      <v-toolbar-title>Jekyll-cms</v-toolbar-title>
      <v-spacer></v-spacer>
      
      {{$store.state.host.repo}}<br/><v-chip>{{$store.state.host.branch}}</v-chip>
      <v-btn @click="pull">pull</v-btn>
      <v-btn @click="push">push</v-btn>
      
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
export default Vue.extend({
  computed: {
    status(){
      return this.$store.state.status;
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