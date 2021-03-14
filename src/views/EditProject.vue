<template>
    <v-form @submit.prevent="save">
        <v-container v-if="page">
            <v-toolbar flat>
                <v-toolbar-title>Edit Project</v-toolbar-title>
                
                <v-spacer></v-spacer>

                <v-tooltip bottom show>
                    <template v-slot:activator="{ on, attrs }">
                        <v-chip 
                            v-bind="attrs"
                            v-on="on"
                        >
                        md
                        </v-chip>
                    </template>
                    <span>{{md[0]}}</span>
                    <pre style="white-space: pre-wrap">{{md[1]}}</pre>
                </v-tooltip>

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
            
            <v-chip>id: {{page.id}}</v-chip>
            <v-chip>path: {{page.path}}</v-chip>

            <v-container>
                <v-row>
                    <v-file-input
                        multiple
                        hide-input
                        label="image"
                        @change="addFigures"
                    ></v-file-input>
                </v-row>
                <v-row>
                    <draggable v-model="page.gallery" style="display: flex; flex-wrap: wrap; gap: 1rem;">
                        <v-card
                        outlined
                        style="width: 10rem;"
                        v-for="fig in page.gallery"
                        :key="fig.image.url"
                        >
                            <img :src="getRawContentUrl(fig.image.url)" height="200px"></img>
                            <v-card-title>{{fig.image.title}}</v-card-title>
                            <v-card-subtitle>{{fig.image.url}}</v-card-subtitle>
                            <v-card-text>
                                <v-textarea label="caption" v-model="fig.caption" rows="1" auto-grow/>
                            </v-card-text>
                            <v-card-actions>
                                <v-btn icon @click="removeFigure(fig)">
                                    <v-icon>mdi-delete</v-icon>
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </draggable>
                </v-row>
            </v-container>

            <v-textarea
                v-model="page.content"
                auto-grow
                rows="2"
                label="content"
            ></v-textarea>

        </v-container>
    </v-form>
</template>

<script lang="js">
import draggable from 'vuedraggable'
import {resizeImage} from '../utils'
import { mapState, mapGetters } from 'vuex'
import {getRawContentUrl, page_to_blob} from '@/jekyll2'
import _ from 'lodash'
import slugify from 'slugify'
import parseDataUrl from 'parse-data-url'
import {Base64} from 'js-base64';

export default {
    name: "EditProject",
    components: {draggable},

    computed: {
        ...mapState(['site', 'page']),
        ...mapGetters(['getRawContentUrl']),
        md(){
            const [path, blob] = page_to_blob(this.page)
            return [path, Base64.decode(blob.content)]
        }
    },

    watch:{
        'page.title': function() {
            this.update()
        }
    },

    methods:{
        update(){
            this.page.path = "_"+this.page.collection+"/"+slugify(this.page.title, "_").toLowerCase()+".md";
            this.page.id = "/"+this.page.collection+"/"+slugify(this.page.title, "_").toLowerCase()
        },

        delete(){
            // remove project from site
			this.$store.dispatch('deleteProject', this.page.id)
            .then(()=>{
                this.$router.push({name: 'listProjects'})
            })
        },

        onFilesChange(event){
            this.addFigures(event.target.files)
            event.target.value = ""
        },

        addFigures(files){
            if (files && files[0]) {
                for(let file of files){
                    var reader = new FileReader();
                    reader.addEventListener('load', e=>{
                        
                        let dataURL = e.target.result
                        resizeImage(dataURL)
                        .then(dataURL=>{
                            // parse data url
                            const parsed = parseDataUrl(dataURL)

                            // add image to static files
                            this.site.static_files.push([`media/${file.name}`, {
                                sha: sha_from_content(parsed.data),
                                content: parsed.data
                            }])


                            // add image to frontmatter
                            this.page.gallery.splice(0, 0, {
                                image: {
                                    url: `media/${file.name}`,
                                    title: file.name.startsWith("_") ? file.name.slice(1) : file.name,
                                    alt: ""
                                },
                                caption: ""
                            })
                        })
                    })                    
                    reader.readAsDataURL(file); // convert to base64 string
                }
            }
        },

        removeFigure(figure){
            // remove image from static files
            this.site.static_files = this.site.static_files.filter( ([p, b])=>p!=figure.image.url )

            // remove image from frontmatter
            const idx = this.page.gallery.indexOf(figure)
            if(idx>=0){
                this.page.gallery.splice(idx, 1)
            }
        }
    }
}
</script>