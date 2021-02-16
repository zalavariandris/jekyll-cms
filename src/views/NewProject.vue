<template>
    <form @submit.prevent="create" class="editor">	
        <header>
            <h2>New Project</h2>

            <div class="actions">
                <input class="is-primary" type="submit" value="create">
            </div>
        </header>	

        <section>	
            <div class="field">
                <label>title</label>
                <div class="control">
                    <input v-model="title" type="text" placeholder="title">
                    <output class="label">{{filename}}</output>
                </div>
            </div>

            <div class="field" style="border: 0.5px solid grey; padding: 1em; border-radius: 0.3em;">
                <label>gallery</label>
                <draggable class="grid" tag="div" v-model="gallery" >
                    <div class="card" v-for="fig in gallery" :key="fig.image.title">
                        <div class="card-media">
                            <img :src="imageUrl(fig.image)" :title= "fig.image.title"/>
                        </div>
                        <div class="card-text">
                            <textarea-autosize rows="1" v-model="fig.caption" placeholder="caption"/>
                        </div>
                        <div class="card-buttons">
                            <button type="button" class="button icon" v-on:click="removeFigure(fig)">
                                <i class="trash"></i>
                            </button>
                        </div>
                    </div>
                </draggable>

                <div class="control">
                    <label class="file-input" for="gallery">+ add image</label>
                    <input 
                        name="gallery" 
                        id="gallery" 
                        type="file" 
                        accept="image/png image/jpg" 
                        v-on:change="onFilesChange"
                        multiple="" 
                    />
                </div>
            </div>
        </section>

        <section>
            <div class="field">
                <label>content</label>
                <div class="control">
                    <textarea-autosize rows="1" v-model="content" placeholder="markdown"></textarea-autosize>
                </div>
            </div>
        </section>
    </form>
</template>

<style scoped lang="scss">
@import"../style/form.scss";
@import "../style/card.scss";
</style>

<script lang="js">
import draggable from 'vuedraggable'
import YAML from 'yaml'
import {resizeImage} from '../utils'
export default {
    name: "EditProject",
    components: {draggable},
    data: function() {
        return {
            title: "",
            content: "",
            gallery: []
        } 
    },

    computed: {
        filename: function(){
            const jekyll = this.$store.state.jekyll;
            return jekyll.slugify(this.title)+".md"
        }
    },

    methods:{
        imageUrl(image){
            const jekyll = this.$store.state.jekyll
            if(image.url.startsWith("data:")){
                return image.url
            }else{
                return jekyll.getRawContentUrl(image.url)
            }
        },

        create(){
            const jekyll = this.$store.state.jekyll;

            this.$Progress.start()
            jekyll.saveNewProject({
                title: this.title,
                content: this.content,
                gallery: JSON.parse(JSON.stringify(this.gallery))
            })
            .then(()=>{
                this.$Progress.finish();
                alert(`Project ${this.title} created`);
                this.$router.push({name: 'listProjects'})
            })
            .catch((err)=>{
                this.$Progress.fail();
                alert(err.name+": "+err.message)
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