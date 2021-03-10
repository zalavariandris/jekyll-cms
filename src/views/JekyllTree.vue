<template>
    <v-container>
        <v-row>
            <v-col>
                <v-text-field v-model="token" label="token"></v-text-field>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols=1>
                <h2>HOST</h2>
                <v-text-field v-model="host.owner"></v-text-field>
                <v-text-field v-model="host.repo"></v-text-field>
                <v-text-field v-model="host.branch"></v-text-field>
                <v-btn @click="load">load</v-btn>
                <v-btn @click="save">save</v-btn>
            </v-col>
            <v-col cols=2>
                <h2>SITE</h2>
                title: {{site.title}}
                <h3>pages</h3>
                <ul>
                    <li 
                      v-for="aPage in site.pages" 
                      :key="aPage.path"
                      @click="currentPage = aPage"
                      :class="{active: currentPage.path==aPage.path}"
                    >
                        {{aPage.title}}<br/>
                        <small>{{aPage.path}}</small>
                    </li>
                </ul>

                <template v-for="collection in site.collections">
                <h3 :key="collection">{{collection}}</h3>
                <ul :key="collection+'ul'">
                    <li 
                        v-for="aPage in site[collection]" 
                        :key="aPage.path"
                        @click="currentPage = aPage"
                    >
                        {{aPage.title}}<br/>
                        <small>{{aPage.path}}</small>
                    </li>
                </ul>
                </template>

                <h3>static files</h3>
                <ul>
                    <li v-for="blob in site.static_files" :key="blob.path">
                        <small>{{blob.path}}</small>
                    </li>
                </ul>
            </v-col>

            <v-col cols=3>
                <div v-if="!currentPage">
                    loading page...
                </div>
                <div v-else>
                    <h2>PAGE</h2>
                    <autoform :value="currentPage" @input="onFormUpdate" :schema="schema" name="Page"></autoform>
                    <hr/>
                    <pre>{{currentPage | frontmatter | pretty}}</pre>
                    
                    <span>{{currentPage.content}}</span>
                </div>
            </v-col>

            <v-col cols=3>
                <h2>GIT</h2>
                
                <ul>
                    <li 
                      v-for="[path, blob] in Object.entries(git.tree)" 
                      :key="path"
                      @click="currentBlob = [path, blob]"
                      :class="{active: currentBlob[0]===path, 'is-modified': status(path)=='M'}"
                    >
                        {{path}}<span>{{status(blob.path)}}</span>
                    </li>
                </ul>
            </v-col>
            <v-col cols=3>
                <div>
                    <template v-if="!git || !origin">
                        loading git...
                    </template>
                    <template v-else>
                        {{Object.keys(git.tree).length}} - {{Object.keys(origin.tree).length}}
                    </template>
                </div>

                <div v-if="currentBlob && originBlob">
                    <p>modified: {{currentBlob[1].sha != originBlob[1].sha}}</p>
                    <p>{{currentBlob[1].sha}}</p>
                    <p>{{originBlob[1].sha}}</p>
                </div>
                <h2>ORIGIN</h2>
                <div v-if="origin && originBlob">
                    <pre>{{originBlob[0]}}</pre>
                    <pre>{{originBlob[1].sha}}</pre>
                    <hr/>
                    <pre>{{originBlob[1].content | decode}}</pre>
                </div>
                <h2>BLOB</h2>
                <div v-if="currentBlob">
                    {{currentBlob[0]}}
                    <pre>{{currentBlob[1].sha}}</pre>
                    <hr/>
                    <pre>{{currentBlob[1].content | decode}}</pre>
                </div>
                
            </v-col>
        </v-row>
    </v-container>
</template>

<style>
    body{
        font-size: 12px;
    }

    pre{
        white-space: pre-wrap;
    }

    .col{
        overflow-x: auto;
    }

    .active{
        color: black;
        background-color: bisque;
    }

    li:hover{
        cursor: pointer;
        /* background-color: antiquewhite; */
        /* transform: translateX(1px); */
        opacity: 0.7;
        border-left: 1px solid transparent;
    }

    li.is-modified{
        color: darkgoldenrod;
        /* text-decoration: underline; */
    }
</style>

<script lang="js">
import { Octokit } from "@octokit/rest";
import {b64DecodeUnicode, b64EncodeUnicode} from "@/utils"
import parsePath from 'parse-path'
import matter from 'gray-matter'
import pathParse from 'path-parse'
import _ from 'lodash'

import {sha_from_content} from '@/jekyll2'
import {Git, pull, push, site_from_git, site_to_git, page_from_path} from '@/jekyll2'

import autoform from '@/components/autoform.vue'

// window.b64EncodeUnicode = b64EncodeUnicode;
// window.sha = sha_from_content

let octokit = new Octokit({
    auth: localStorage.getItem('accessToken')
});

import Vue from 'vue'
export default Vue.extend({
    components: {autoform},
    name: "jekyll-tree",
    data(){
        return {
            host: {
                owner: "zalavariandris",
                repo: "zalavaridesign_jekyll",
                branch: "master"
            },

            site: {
                drafts: [],
                includes: [],
                layouts: [],
                posts: [],
                data: [],
                sass: [],
                pages: [],
                static_files: [],
                ignored: [],
                collections: []
            },

            currentPage: null,
            currentBlob: null,
            originBlob: null,

            origin: null,

            schema: {
                type: 'object',
                properties: {
                    title: {type: 'string'},
                    date: {type: 'string'},
                    id: {type: 'string'},
                    collection: {type: 'string'},
                    name: {type: 'string'},
                    path: {type: 'string'},
                    categories: {type: 'array', items: {type: 'string'}},
                    // content: {type: 'text'},
                    image: {
                        type: 'object', 
                        properties: {
                            title: {type: 'string'},
                            url: {type: 'string'}
                        }
                    },

                }
            }
        }
    },
    computed:{
        token: {
            get(){
                return localStorage.getItem('accessToken');
            },
            set(val){
                if(val === null){
                    localStorage.removeItem('accessToken')
                }else{
                    localStorage.setItem('accessToken', val);
                }
            }
        },
        git(){
            return site_to_git(this.site)
        }
    },

    watch: {
        currentPage(){
            this.currentBlob = [this.currentPage.path, {...this.git.tree[this.currentPage.path]}]
        },

        currentBlob(){
            const path = this.currentBlob[0]
            this.originBlob = [path, {...this.origin.tree[path]}]
        },
        
    },

    mounted(){
        window.app = this
        this.load()
    },

    methods: {
        onFormUpdate(value){
            this.currentPage = value
        },
        load(){
            pull({
                owner: this.host.owner,
                repo: this.host.repo,
                branch: this.host.branch,
                token: this.token
            })
            .then(git=>{
                this.site = site_from_git(git)
                this.origin = _.cloneDeep(git)
                this.currentPage = this.site.pages[0]

                window.app = this
            })
        },

        save(){
            push({
                owner: this.host.owner,
                repo: this.host.repo,
                branch: this.host.branch,
                token: this.token,
                git: this.git
            })
            .then(()=>{
                alert("saved")
            })
        },

        status(path){
            if(this.git.tree && this.git.origin){
                return this.git.tree[path].sha != this.origin.tree[path].sha ? "M" : ""
            } else{
                return ""
            }
        }
    },

    filters: {
        pretty(value){
            return YAML.stringify(value)
        },

        frontmatter(value){
            let {content, ...frontmatter} = value
            return frontmatter
        },

        decode(value){
            if(!value){
                return
            }
            return b64DecodeUnicode(value)
        }
    }
})
</script>