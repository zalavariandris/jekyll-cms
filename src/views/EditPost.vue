<template>
    <v-container v-if="page">
        <v-toolbar flat>
            <v-toolbar-title>Edit Post</v-toolbar-title>
            <v-spacer></v-spacer>

            <v-btn
                color="error"
                outlined
                @click="this.delete"
            >
                <v-icon left>
                    mdi-delete
                </v-icon>
                delete
            </v-btn>
        </v-toolbar>

        <v-text-field
            v-model="page.title"
            label="title"
        ></v-text-field>
        

        <v-text-field
            v-model="page.date"
            label="date"
        ></v-text-field>
        <v-chip>id: {{page.id}}</v-chip>
        <v-chip>path: {{page.path}}</v-chip>

        <v-container>
            <v-file-input
                multiple
                hide-input
                label="image"
                @change="(files)=>setImage(files[0])"
            ></v-file-input>
            <v-img
                v-if="page.image"
                :src="getRawDataUrl(page.image.url)"
                max-height="200"
                max-width="200"
            >
            </v-img>
            <v-btn
                v-if="page.image"
                icon
                @click="setImage(null)"
            >
                <v-icon left>
                    mdi-delete
                </v-icon>
            </v-btn>
        </v-container>


        <v-textarea
            v-model="page.content"
            auto-grow
            rows="2"
            label="content"
        ></v-textarea>

    </v-container>
</template>

<script lang="js">
import moment from 'moment'
import {resizeImage} from '../utils'
import { mapState, mapGetters } from 'vuex'
import slugify from 'slugify'
import {sha_from_content} from '@/jekyll2'
import parseDataUrl from 'parse-data-url'

export default {
    name: "NewPost",


    computed: {
        ...mapState(['site', 'page']),
        ...mapGetters(['getRawDataUrl'])
    },

    watch:{
        'page.title': function(){
            this.update()
        },
        'page.date': function(){
            this.update()
        }
    },

    methods:{
        update(){
            this.page.path = "_posts"+"/"+moment(this.page.date).format("YYYY-MM-DD")+"-"+slugify(this.page.title, "_").toLowerCase()+".md"
            this.page.id = "/"+moment(this.page.date).format("YYYY/MM/DD")+"/"+slugify(this.page.title, "_").toLowerCase()
        },

        delete(){
            // remove project from site
			this.$store.dispatch('deletePost', this.page.id)
            .then(()=>{
                this.$router.push({name: 'listPosts'})
            })
        },

        setImage(file){
            if(!file){
                // remove image from static files
                const idx = this.site.static_files.findIndex(([p, b])=>p==this.page.image.url)
                this.site.static_files.splice(idx, 1)

                // set frontmatter
                this.page.image = null
            }else{
                var reader = new FileReader();
                reader.addEventListener('load', e=>{
                    let dataURL = e.target.result;

                    resizeImage(dataURL)
                    .then(dataUrl=>{
                        // add image to static files
                        const parsed = parseDataUrl(dataUrl)
                        // const data = dataUrl.split("base64,")[1] this is the same without a package
                        // image data seem to start with a '/'
                        debugger
                        this.site.static_files.push(["media/"+file.name, {
                            sha: sha_from_content(parsed.data),
                            content: parsed.data
                        }])

                        // set frontmatter
                        this.page.image = {
                            url: "media/"+file.name,
                            title: file.name,
                            alt: ""
                        }
                    })
                })
                reader.readAsDataURL(file); // convert to base64 string
            }
        }
    }
}
</script>