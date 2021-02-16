<template>
  <div class="site">
    <header>
      <h1>Jekyll</h1>
      <div>
        {{repo}}
        <span class="label">{{branch}}</span>
      </div>
    </header>

    <navigation></navigation>

    <main>
      <router-view></router-view> 
    </main>

    <footer>
      <small><i>powered by:</i></small>
      <img src="@/assets/logo.png" 
      style="height:1.3rem; margin-bottom: -0.35em; margin-left: 0.3em;">
    </footer>
  </div>
</template>

<script lang="ts">
import navigation from '@/components/navigation.vue'
import Vue from 'vue'
export default Vue.extend({
    name: "App",
    components: {navigation},
    data: function(){
        return {
        logs: []
        }
    },
    mounted: function(){
      
    },
    computed: {
        repo(){
            return this.$store.state.jekyll.repo
        },

        branch(){
            return this.$store.state.jekyll.branch
        },

        connected(){
            const jekyll = this.$store.state.jekyll;
            return jekyll.owner && jekyll.repo && jekyll.branch && jekyll.token
        }
    }
})
</script>

<style>
@keyframes fadeIn {
  0% {opacity:0;}
  100% {opacity:1;}
}

/* *{
  animation: fadeIn ease 0.25s;
} */

.consol{
    background-color: white;
    left: 0;
    bottom: 0;
    max-height: 10em;
    overflow: hidden;
    /* overflow: auto scroll; */
    /* box-shadow: 2px 2px 10px rgb(0 0 0 / 10%); */
    max-height: 3em;
    color: grey;
    font-style: italic;
}

.modal{
  position: fixed;
  z-index: 9998;
  background: rgba(255, 255, 255, 0.95);
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.site{
  display: grid;
  grid-template-columns: max-content 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    'header main'
    'nav main'
    'footer main';

  gap: 2rem;
  min-height: 100vh;
  padding: 3rem;
  box-sizing: border-box;
  margin: auto;
}
.site>header{
  grid-area: header;
}
.site>nav{
  grid-area: nav;
}
.site>main{
  grid-area: main;
}
.site>footer{
  grid-area: footer;
}
</style>