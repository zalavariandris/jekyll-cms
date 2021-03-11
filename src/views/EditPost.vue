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
        <output>{{page.id}}</output>

        <v-container>
            <v-file-input
                multiple
                hide-input
                label="image"
                @change="onFileChange"
            ></v-file-input>
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
import { mapState } from 'vuex'
import slugify from 'slugify'
export default {
    name: "NewPost",

    mounted(){

    },

    computed: {
        ...mapState(['site', 'page']),
        name(){
            return slugify(this.page.title, "_").toLowerCase()+".md";
        },
        path(){
            return "_posts/"+this.page.name;
        },
        id(){
            return this.page.path
        }
    },

    watch:{
        name(value){
            this.page.name = value
        },
        path(value){
            this.page.path = value
        },
        id(value){
            this.page.id = value
        }
    },

    methods:{
        delete(){
            // remove project from site
			this.$store.dispatch('deletePost', this.page.id)
            .then(()=>{
                this.$router.push({name: 'listPosts'})
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

        // save(){
        //     const jekyll = this.$store.state.jekyll;
        //     let post = {
        //         title: this.title,
        //         date: moment(this.date).format("YYYY-MM-DD"),
        //         content: this.content
        //     }
        //     if(this.image){
        //         post.image = JSON.parse(JSON.stringify(this.image))
        //     }
        //     this.$Progress.start()
        //     jekyll.saveNewPost(post)
        //     .then(()=>{
        //         this.$Progress.finish();
        //         alert(`Post ${this.title} updated`);
        //         this.$router.push({name: 'listPosts'});
        //     })
        //     .catch((err)=>{
        //         this.$Progress.fail();
        //         alert(err.name+"\n"+err.message);
        //     })
        // },

        // remove(){
        //     const jekyll = this.$store.state.jekyll;
        //     const post_id = this.$route.params.id

        //     this.$Progress.start()
        //     jekyll.deletePost(post_id)
        //     .then(()=>{
        //         this.$Progress.finish();
        //         alert(`Post '${post_id} deleted`)
        //         this.$router.push({name: 'listPosts'})
        //     })
        //     .catch((err)=>{
        //         this.$Progress.fail();
        //         alert(err.name+"\n"+err.message)
        //     })
        // },

        onFileChange(event){
            const files = event.target.files;
            if(files && files[0]){
                this.setImage(files[0])
            }
            event.target.value = ""
        },

        setImage(file){
            if(!file){
                this.image = null
            }else{
                var reader = new FileReader();

                reader.addEventListener('load', e=>{
                    let dataURL = e.target.result;

                    resizeImage(dataURL)
                    .then(dataUrl=>{
                        this.image = {
                            url: dataURL,
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