<template>
    <v-container>
        
        STATIC FILES
        <div class="grid">
        <v-card v-for="[path, blob] in site.static_files" :key="path" width="10rem">
            <div v-if="isImage(path)">
                <v-img :src="getRawDataUrl(path)"></v-img>
            </div>
            <v-card-text>
                {{blob.sha}}<br>
                {{sha_from_content(blob.content)}}
                <v-chip>{{path}}</v-chip>
            </v-card-text>
        </v-card>
        </div>
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

export default {
    computed: {
        ...mapState(['site']),
        ...mapGetters(['getRawDataUrl'])
    },
    methods:{
        isImage: (path)=>{
            const m = mime.lookup(path)
            if(!m){return false;}
            
            return m.split("/")[0] == "image"
        },

        sha_from_content(data){
            return sha_from_content(data)
        }

    }
    
}
</script>