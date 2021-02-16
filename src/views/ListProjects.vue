<template>
	<div>
		<header>
            <h2>Projects</h2>
        </header>
		<div class="actions">
			<router-link to="/projects/new" class="button">
				New project
			</router-link>
		</div>
		<ul>
			<li v-for="project in projects" :key="project.id">
				<router-link :to="{name: 'editProject', params: {id: project.id}}">
					{{project.title}}<br/>
					<small>{{project.year}}</small>
				</router-link>
			</li>
		</ul>
	</div>
</template>

<style scoped lang="scss">
@import "../style/form.scss";
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
	name: "ListProjects",
	data: function(){
		return {
			projects: []	
		}
	},
	mounted(){
		this.fetch()
	},

	methods:{
		fetch(){
			const jekyll = this.$store.state.jekyll;

			this.$Progress.start()
			jekyll.listProjects()
			.then((projects)=>{
				this.projects=projects;
				this.$Progress.finish();
			})
			.catch(()=>{
				this.$Progress.fail();
			})
		}
	}
};
</script>