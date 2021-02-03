<template>
	<div>
		<header>
			<h2>Posts</h2>        
        </header>
		<div class="actions">
			<router-link to="/posts/new" class="button">
				New Post
			</router-link>
		</div>    
		<ul>
			<li v-for="post in posts" :key="post.id">
				<router-link :to="{name: 'editPost', params: {id: post.id}}">
					{{post.title}}</br>
					<small>{{post.date}}</small>
				</router-link>
			</li>
		</ul>
	</div>
</template>

<style scoped>
	header{
		display: flex;
		justify-content: space-between;
		padding: 1rem;
	}

	li{
		padding: 0;
	}

	li a{
		padding: 1rem 1rem;
		display: block;
	}

	li a small{
		color: grey;
		font-style: italic;
	}

	li a:hover{
		/* background-color: rgb(245,245,245); */
		/* text-decoration: none; */
	}
	li:not(:last-of-type){
		border-bottom: 1px solid lightgrey;
	}
</style>

<script lang="js">
export default {
	name: "ListPosts",
	data: function(){
		return {
			posts: []	
		}
	},
	mounted(){
		const jekyll = this.$store.state.jekyll;

		this.$Progress.start()	
		jekyll.listPosts()
		.then((posts)=>{
			this.posts=posts;
			this.$Progress.finish();
		})
		.catch(()=>{
			this.$Progress.fail();
		})
	}
};
</script>