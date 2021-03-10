<template>
	<v-container>
		<v-toolbar flat>
			<v-toolbar-title>Projects</v-toolbar-title>
			<v-spacer></v-spacer>
			<v-btn
				color="primary"
				:to="{name:'newProject'}"
			>
				<v-icon left>mdi-plus</v-icon>
				New Project
			</v-btn>
		</v-toolbar>

		<v-divider></v-divider>

		<v-list
			subheader
			two-line
			v-for="project in site.projects"
			:key="project.id"
		>
			<v-list-item
				:to="{name: 'editProject', params: {id: project.id}}"
			>
				<v-list-item-content>
					<v-list-item-title>
					{{project.title}}
					</v-list-item-title>
					<v-list-item-subtitle>
					{{project.year}}
					</v-list-item-subtitle>
				</v-list-item-content>
				<v-list-item-action>
					<v-btn icon>
						<v-icon color="grey lighten-1">mdi-pencil</v-icon>
					</v-btn>
				</v-list-item-action>
			</v-list-item>
		</v-list>
	</v-container>
</template>

<script lang="js">
import { mapState } from 'vuex'
export default {
	name: "ListProjects",
	computed: mapState(['site'])
};
</script>