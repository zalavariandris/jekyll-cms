<template>
    <v-form @submit.prevent="save">
        <v-container v-if="page">
            <v-toolbar flat>
                <v-toolbar-title>New Project</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn
                    color="primary"
                    outlined
                    @click="save"
                >
                    <v-icon left>
                        mdi-content-save
                    </v-icon>
                    save
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
                    ></v-file-input>
                </v-row>
                <v-row>
                    <draggable v-model="page.gallery" style="display: flex; gap: 1rem;">
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
import YAML from 'yaml'
import {resizeImage} from '../utils'
import slugify from 'slugify'

export default {
    name: "EditProject",
    components: {draggable},
    data:function(){
        return {
            page: {
                title: "",
                gallery: [],
                content: ""
            }
        }
    },

    computed: {
        filename: function(){
            const jekyll = this.$store.state.jekyll;
            return jekyll.slugify(this.title)+".md"
        }
    },

    methods:{
        save(){
            let project_id = slugify(this.page.title)+".md"
            
            this.$Progress.start()
            this.$store.dispatch('saveProject', {
                project_id: project_id, 
                project: this.page
            })
            .then((new_project_id)=>{
                this.$Progress.finish()
                alert(`project ${new_project_id} saved`)
                this.$router.push({name: 'listProjects'})
            })
            .catch((error)=>{
                this.$Progress.fail();
                alert(error.message)
            })
        },
        
        imageUrl(image){
            const jekyll = this.$store.state.jekyll
            if(image.url.startsWith("data:")){
                return image.url
            }else{
                return jekyll.getRawContentUrl(image.url)
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
                            this.gallery.push({
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
            this.gallery = this.gallery.filter(fig=>fig.image.title!=figure.image.title)
        }
    }
}
</script>