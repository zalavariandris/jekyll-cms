<template>
    <form @submit.prevent="save" class="editor">
        <header>
            <h2>Edit Project</h2>

            <div class="actions">
                <input class="is-primary" type="submit" value="save">
                <button type="button" class="is-danger" v-on:click="remove">delete</button>
            </div>
        </header>

		<section v-if="title">			
            <div class="field">
                <label>title</label>
                <div class="control">
                    <input v-model="title" type="text" placeholder="title">
                    <output v-show="filename!=id" class="label">{{filename}}</output>
                </div>
            </div>

            <div class="year">
                <label>title</label>
                <div class="control">
                    <input v-model="year" type="number" placeholder="year">
                </div>
            </div>

            <div class="fieldset">
                <label>gallery</label>
                <draggable class="grid" tag="div" v-model="gallery" >
                    <div class="card" v-for="fig in gallery" :key="fig.image.title">
                        <div class="card-media">
                            <img :src="imageUrl(fig.image)" :title= "fig.image.title"/>
                        </div>
                        <div class="card-text">
                            <textarea-autosize rows="1" v-model="fig.caption" placeholder="{caption}"/>
                        </div>
                        <div class="card-buttons">
                            <button type="button" class="button icon" v-on:click="removeFigure(fig)">
                                <i class="trash"></i>
                            </button>
                        </div>
                    </div>
                </draggable>

                <div class="field">
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
            </div>
        </section>

        <section v-if="title">
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
import {resizeImage} from '../utils'

export default {
    name: "EditProject",
    components: {draggable},
    data: function() {
        return {
            title: "",
            content: "",
            year: 2000,
            gallery: []
        } 
    },

    computed: {
        id: function(){
            return this.$route.params.id
        },
        filename: function(){
            const jekyll = this.$store.state.jekyll;
            return jekyll.slugify(this.title)+".md"
        },
    },

    created(){
        this.fetch()
    },

    methods:{
        fetch(){
            const filename = this.$route.params.id;
            const jekyll = this.$store.state.jekyll;

            this.$Progress.start()
            jekyll.fetchProject(filename)
            .then((project)=>{
                this.title = project.title;
                this.year = project.year;
                this.content = project.content;
                this.gallery = project.gallery;
                this.$Progress.finish()
            })
            .catch((error)=>{
                this.$Progress.fail()
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

        imageUrl(image){
            const jekyll = this.$store.state.jekyll
            if(image.url.startsWith("data:")){
                return image.url
            }else{
                return jekyll.getRawContentUrl(image.url)
            }
        },

        save(){
            const jekyll = this.$store.state.jekyll;
            const project_id = this.$route.params.id

            this.$Progress.start()
            jekyll.saveProject(
                this.$route.params.id,
            {
                title: this.title,
                year: parseInt(this.year),
                content: this.content,
                gallery: JSON.parse(JSON.stringify(this.gallery))
            })
            .then((filename)=>{
                this.$Progress.finish();
                alert(`Project '${project_id} updated`);
                this.$router.push({name: 'listProjects'})
            })
            .catch((err)=>{
                this.$Progress.fail();
                alert(err.name+"\n"+err.message)
            })
        },

        remove(){
            const jekyll = this.$store.state.jekyll;
            const project_id = this.$route.params.id

            this.$Progress.start()
            jekyll.deleteProject(project_id)
            .then(()=>{
                this.$Progress.finish();
                alert(`Project '${project_id} deleted`);
                this.$router.push({name: 'listProjects'});
            })
            .catch((err)=>{
                this.$Progress.fail();
                alert(err.name+"\n"+err.message)
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
            const idx = this.gallery.indexOf(figure)
            if(idx>=0){
                this.gallery.splice(idx, 1)
            }
        }
    }
}
</script>