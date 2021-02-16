<template>
  <nav class="menu">
    <h3 class="menu-label">Contents</h3>
    <ul class="menu-list">
      <li>
        <router-link :to="{name: 'listProjects'}">Projects</router-link>
      </li>
      <li>
        <router-link :to="{name: 'listPosts'}">Posts</router-link>
      </li>
      <li>
        <router-link :to="{name: 'listPages'}">Pages</router-link>
      </li>
    </ul>
    <h3>Advanced</h3>
    <ul>
      <li>
        <router-link :to="{name: 'dashboard'}">Dashboard</router-link>
      </li>
    </ul>
  </nav>
</template>

<style>
  nav ul{
    list-style: none;
    padding: 0;
    margin: 0;
  }
  nav a{
    color: inherit;
    text-decoration: none;
  }
  nav a:hover{
    text-decoration: underline;
  }
  nav h3{
    font-size: 0.6rem;
    text-transform: uppercase;
    margin-top: 3em;
    margin-bottom: 0.5em;
  }
</style>

<script>
  export default{
    name: 'navigation'
  };
</script>