<template>
    <v-container>
        <v-toolbar flat>
            <v-toolbar-title>Static Files</v-toolbar-title>
        </v-toolbar>
        <v-item-group class="grid">
            <v-item v-for="[path, blob] in site.static_files" 
                    :key="path" >
                <v-card 
                   
                    width="10rem"
                    height="14rem"
                >
                    <v-img 
                    v-if="isImage(path)" 
                    :src="getRawContentUrl(path)"
                    height="10rem"
                    ></v-img>
                    <v-card-text style="overflow: hidden;">
                        {{filename(path)}}
                    </v-card-text>
                </v-card>
            </v-item>
        </v-item-group>
    </v-container>
</template>

<style scoped>
.grid{
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}
</style>

<script>
import mime from 'mime-types'
import { mapState, mapGetters } from 'vuex'
import {sha_from_content} from "@/jekyll2"
import pathParse from 'path-parse'

export default {
    computed: {
        ...mapState(['site']),
        ...mapGetters(['getRawContentUrl'])
    },
    methods:{
        isImage: (path)=>{
            const m = mime.lookup(path)
            if(!m){return false;}
            
            return m.split("/")[0] == "image"
        },

        sha_from_content(data){
            return sha_from_content(data)
        },

        filename(path){
            const {base, name, dir} = pathParse(path)
            return base
        }

    }
}
</script>