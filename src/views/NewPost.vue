<template>
    <form @submit.prevent="create" class="editor">
        <header>
            <h2>New Post</h2>
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

            <div class="field">
				<label>date</label>
				<div class="control">
                    <input v-model="date" type="date"/>
				</div>
			</div>

            <div class="fieldset">
                <label>image</label>
                <div class="card">
                    <div class="card-media">
                        <div v-if="image" class="control">
                            <img :src="imageUrl(image)" :title= "image.title"/>
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
                    <div class="card-buttons">
                        <button v-if="image" type="button" class="button icon" @click="setImage(null)">
                            <i class="trash"></i>
                        </button>
                    </div>
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
    @import "../style/form.scss";
    @import "../style/card.scss";
</style>

<script lang="js">
import moment from 'moment'
import {resizeImage} from '../utils'

export default {
    name: "NewPost",
    data: function() {
        return {
            title: "",
            date: moment().format("YYYY-MM-DD"),
            content: "",
            image: null
        } 
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
                alert(`Post ${this.title} created`);
                this.$router.push({name: 'listPosts'})
            })
            .catch((err)=>{
                this.$Progress.fail()
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
                    .then(dataURL=>{
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