<template>
    <form @submit.prevent="save" class="editor">
        <header>
            <h2>Edit Post</h2>
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

            <div class="field">
				<label>date</label>
				<div class="control">
                    <input v-model="date" type="date"/>
				</div>
			</div>

            <div class="field" style="border: 0.5px solid grey; padding: 1em; border-radius: 0.3em;">
				<label>image</label>
                <div v-if="image" class="control">
                    <img :src="imageUrl(image)" :title= "image.title"/>
                    <button type="button" @click="setImage(null)">
                        <i class="trash"></i>
                    </button>
                </div>

				<div v-else class="control">
                    <label class="file-input" for="gallery">+ set image</label>
					<input 
						name="gallery" 
						id="gallery" 
						type="file" 
						accept="image/png image/jpg" 
						v-on:change="onFileChange"
					/>
				</div>
			</div>
        </section>

        <section v-if="title">
            <div class="field">
				<label>Content</label>
				<div class="control">
					<textarea-autosize rows="1" v-model="content" placeholder="markdown"></textarea-autosize>
				</div>
			</div>
        </section>
	</form>
</template>

<style scoped lang="scss">
@import"../style/form.scss";
header{
    display: flex;
    justify-content: space-between;
}
</style>



<script lang="js">
import moment from 'moment'
import {resizeImage} from '../utils'
export default {
    name: "NewPost",
    data: function() {
        return {
            title: "",
            date: "",
            content: "",
            image: null
        } 
    },

    mounted: function(){
        this.fetch()
    },

    computed: {
        id: function(){
            return this.$route.params.id
        },

        filename: function(){
            const jekyll = this.$store.state.jekyll;
            return this.date+"-"+jekyll.slugify(this.title)+".md"
        }
    },

    methods:{
        fetch(){
            const jekyll = this.$store.state.jekyll;
            const post_id = this.$route.params.id

            this.$Progress.start()
            jekyll.fetchPost(post_id)
            .then(post=>{
                this.title = post.title;
                this.date = post.date;
                this.content = post.content;
                this.image = post.image;

                this.$Progress.finish();
            })
            .catch(()=>{
                this.$Progress.fail();
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

        save(){
            const jekyll = this.$store.state.jekyll;
            let post = {
                title: this.title,
                date: moment(this.date).format("YYYY-MM-DD"),
                content: this.content
            }
            if(this.image){
                post.image = JSON.parse(JSON.stringify(this.image))
            }
            this.$Progress.start()
            jekyll.saveNewPost(post)
            .then(()=>{
                this.$Progress.finish();
                alert(`Post ${this.title} updated`);
                this.$router.push({name: 'listPosts'});
            })
            .catch((err)=>{
                this.$Progress.fail();
                alert(err.name+"\n"+err.message);
            })
        },

        remove(){
            const jekyll = this.$store.state.jekyll;
            const post_id = this.$route.params.id

            this.$Progress.start()
            jekyll.deletePost(post_id)
            .then(()=>{
                this.$Progress.finish();
                alert(`Post '${post_id} deleted`)
                this.$router.push({name: 'listPosts'})
            })
            .catch((err)=>{
                this.$Progress.fail();
                alert(err.name+"\n"+err.message)
            })
        },

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