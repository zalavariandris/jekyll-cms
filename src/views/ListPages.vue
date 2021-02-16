<template>
    <div>
		<header>
			<h2>Pages</h2>
		</header>
        <ul>
            <li class="fadeEnter" v-for="page in pages" :key="page.id">
                <router-link :to="{name: 'editPage', params: {id: page.id}}">
                    {{page.title}}</br>
					<small>{{page.id}}</small>
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

	/* List */
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

<script>
export default {
	name: "ListPages",
	data: function(){
		return {
			pages: []	
		}
	},
	mounted(){
		this.get()
	},

	methods:{
		get(){
			
			const jekyll = this.$store.state.jekyll

			this.$Progress.start()	
			jekyll.listPages()
			.then((pages)=>{
				this.pages=pages;
				this.$Progress.finish();
			})
			.catch(()=>{
				this.$Progress.fail()
			})
		}
	}
};
</script>