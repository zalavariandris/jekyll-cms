<template>
    <v-container>
        <v-row>
            <v-col cols="6">
                <v-chip>{{text.encoding}}</v-chip><br>
                <v-chip>{{text.sha}}</v-chip><br>
                <v-chip :color="calc_sha(text.content) != text.sha ? 'error' : 'success'">
                    {{calc_sha(text.content)}}
                </v-chip>
                <pre>{{text.content | decode}}</pre>
            </v-col>

            <v-col cols="6">
                <img :src="image.dataURL"/><br>
                <v-chip>{{text.encoding}}</v-chip><br>
                <v-chip>{{image.sha}}</v-chip> <br>
                <v-chip :color="calc_sha(image.content) != image.sha ? 'error' : 'success'">
                    {{calc_sha(image.content)}}
                </v-chip>
                <pre>{{image.content | decode}}</pre>
            </v-col>
            
        </v-row>
    </v-container>
</template>

<style scoped>
    pre{
        border: 1px dashed black;
    }
</style>

<script>
import { Octokit } from "@octokit/rest";
import {mapState} from 'vuex'
import mime from 'mime-types'
import {sha_from_content} from '@/jekyll2'
import sha1 from 'sha1'
import {b64DecodeUnicode, b64EncodeUnicode} from '@/utils'
import hasha from 'hasha'
import {Base64} from 'js-base64';

export default {
    data: function() {
        return {
            image: {
                path: "assets/images/portrezj.jpg",
                sha: null,
                content: null,
                dataURL: null
            },
            text: {
                path: "_posts/2021-03-12-my_new_post.md",
                sha: null,
                content: null
            }
        }
    },

    mounted(){
        const octokit = new Octokit({
            auth: localStorage.getItem('accessToken')
        }); 

        // get text content
        octokit.repos.getContent({
            owner: this.host.owner, 
            repo: this.host.repo,
            ref: this.host.branch,
            path: this.text.path,
            headers: {'If-None-Match': ''} //prevent cache
        }).then((response)=>{
            const filename = response.data.name
            this.text.sha = response.data.sha
            this.text.content = response.data.content
            this.text.encoding = response.data.encoding
        })

        // get image content
        octokit.repos.getContent({
            owner: this.host.owner, 
            repo: this.host.repo,
            ref: this.host.branch,
            path: this.image.path,
            headers: {'If-None-Match': ''} //prevent cache
        }).then((response)=>{
            const filename = response.data.name
            this.image.sha = response.data.sha
            this.image.content = response.data.content
            this.image.dataURL = "data:"+mime.lookup(filename)+";base64,"+this.image.content
            this.image.encoding = response.data.encoding
        })
    },

    computed: {
        ...mapState(['site', 'page', 'host']),
    },
    
    methods: {
        calc_sha(base64_content){
            if(!base64_content)
                return null
            
            const str = Base64.toUint8Array(base64_content) // decode base64 to uint8 array
            const blob = new Blob([str])
            return hasha([`blob ${blob.size}\0`, str], { algorithm: "sha1" })
        }
    },

    filters: {
        decode(bytes){
            return bytes ? Base64.decode(bytes) : null // decode base64 to utf8
        }
    }
}
</script>
