<template>
    <div class="fire-login">

    </div>
</template>

<script lang="js">

import firebase from 'firebase/app';
import "firebase/auth";

let data = {};
let config = {
    apiKey: "AIzaSyBCRnEq8D67Gd8NyQc1ZEutergO7oLSRtc",
    authDomain: "jekyll-cms-d1f7a.firebaseapp.com",
    projectId: "jekyll-cms-d1f7a",
    storageBucket: "jekyll-cms-d1f7a.appspot.com",
    messagingSenderId: "906772981563",
    appId: "1:906772981563:web:e39c583d3f92f8103b791e"
};

const auth = async () => {
  firebase.initializeApp(config);
  var provider = new firebase.auth.GithubAuthProvider();
  provider.addScope('repo');

  try {
    const result = await firebase.auth().signInWithPopup(provider);
    debugger
    // This gives you a GitHub Access Token. You can use it to access the GitHub API.
    var token = result.credential.accessToken;
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(result.user.toJSON()));

    console.log(`Welcome ${result.user}`);
    return result;
  } catch (error) {
    // Handle Errors here.
    console.log(error);
    console.log(`Unable to login: ${error.message}`)
  }
};

window.auth = auth

import Vue from 'vue'
export default Vue.extend({
    created(){
    }
})
</script>