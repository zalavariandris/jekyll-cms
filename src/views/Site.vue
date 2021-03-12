<template>
  <v-container>
    <v-navigation-drawer app clipped permanent>
      <v-list
        dense
        nav
      >
        <v-subheader inset>Contents</v-subheader>

        <v-list-item 
          link
          :to="{name: 'listProjects'}"
        >
          <v-list-item-action>
            <v-icon>mdi-pencil-ruler</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Projects</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item 
          link
          :to="{name: 'listPosts'}"
        >
          <v-list-item-action>
            <v-icon>mdi-pin</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Posts</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item 
          link
          :to="{name: 'listPages'}"
        >
          <v-list-item-action>
            <v-icon>mdi-file-document</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Pages</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-subheader inset>Advanced</v-subheader>

        <v-list-item 
          link
          :to="{name: 'dashboard'}"
        >
          <v-list-item-action>
            <v-icon>mdi-view-dashboard</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Dashboard</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item 
          link
          :to="{name: 'static_files'}"
        >
          <v-list-item-action>
            <v-icon>mdi-view-dashboard</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Static Files</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

      </v-list>
    </v-navigation-drawer>

    <v-main app>
      <router-view></router-view> 
    </v-main>

  </v-container>
</template>

<script lang="ts">
import navigation from '@/components/navigation.vue'
import Vue from 'vue'
export default Vue.extend({
  name: "App",
  components: {navigation},
  data: function(){
    return {}
  },
  mounted: function(){
    
  }
})
</script>