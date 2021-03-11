<template>
    <v-form @submit.prevent="save">
        <v-container v-if="page">
            <v-toolbar flat>
                <v-toolbar-title>Edit Project</v-toolbar-title>
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
                            <v-img :src="imageUrl(fig.image)" height="200px"></v-img>
                            <v-card-text>
                                <v-textarea v-model="fig.caption" rows="1" auto-grow/>
                            </v-card-text>
                            <v-card-actions>
                                <v-btn
                                    icon
                                    @click="removeFigure(fig)"
                                >
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
import cardinput from '@/components/cardinput'
import { mapState } from 'vuex'
import {getRawContentUrl} from '@/jekyll2'
import _ from 'lodash'

export default {
    name: "EditProject",
    components: {draggable, cardinput},

    data:function(){
        return {}
    },

    computed: mapState(['site', 'page']),

    methods:{
        delete(){
            // remove project from site
			this.$store.dispatch('deleteProject', this.page.id)
            .then(()=>{
                this.$router.push({name: 'listProjects'})
            })
        },

        imageUrl(image){
            const jekyll = this.$store.state.jekyll
            if(image.url.startsWith("data:")){
                return image.url
            }else{
                return getRawContentUrl(image.url, {owner: "zalavariandris", repo: "zalavaridesign_jekyll", branch: "master"})
            }
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
                            this.page.gallery.splice(0, 0, {
                                image: {
                                    url: dataURL,
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
            const idx = this.page.gallery.indexOf(figure)
            if(idx>=0){
                this.page.gallery.splice(idx, 1)
            }
        }
    }
}
</script>