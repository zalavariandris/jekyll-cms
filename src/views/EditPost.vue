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
        <v-chip>name: {{page.name}}</v-chip>
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
                :src="page.image.url"
                max-height="200"
                max-width="200"
            >
            </v-img>
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


    computed: {
        ...mapState(['site', 'page'])
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
            this.page.name = moment(this.page.date).format("YYYY-MM-DD")+"-"+slugify(this.page.title, "_").toLowerCase()+".md";
            this.page.path = "_posts/"+this.page.name;
            this.page.id = "/"+moment(this.page.date).format("YYYY/MM/DD")+"/"+slugify(this.page.title, "_").toLowerCase()
        },

        delete(){
            // remove project from site
			this.$store.dispatch('deletePost', this.page.id)
            .then(()=>{
                this.$router.push({name: 'listPosts'})
            })
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

        setImage(file){
            if(!file){
                delete this.page.image
            }else{
                var reader = new FileReader();
                reader.addEventListener('load', e=>{
                    let dataURL = e.target.result;

                    resizeImage(dataURL)
                    .then(dataUrl=>{
                        console.log(this.page)
                        this.page.image = {
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