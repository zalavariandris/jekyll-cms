<template>
  <div id="app">
    <div class="auth">
      {{status}}
      <div v-if="status=='logged-in'">
        <button @click="on_logout">
          <span class="material-icons">logout</span>
          logout
        </button>
      </div>
    </div>

    <router-view></router-view>
    
    <vue-progress-bar></vue-progress-bar>

    <div v-if="status==='logging-in'" class="modal">
      <h2>Jekyll</h2>
      {{status}}...
    </div>

  </div>
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
    on_logout(){
      this.$store.dispatch('logout')
      .then((response)=>{
        this.$router.push({name:'login'})
      })
    }
  }
})
</script>

<style scoped lang="scss">
/* @import '@mdi/font/css/materialdesignicons.css'; */
@import '@/style/form.scss';
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

.auth{
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: white;
  box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
  padding: 0.5rem 1rem;
}

.modal{
  display: block;
  width: 100vw;
  height: 100vh;
  background-color: rgba(255,255,255,0.95);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>