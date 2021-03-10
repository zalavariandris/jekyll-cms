<template>
	<v-container>
		<v-toolbar flat>
			<v-toolbar-title>Posts</v-toolbar-title>
			<v-spacer></v-spacer>
			<v-btn
				color="primary"
			>
				<v-icon left>mdi-plus</v-icon>
				New Post
			</v-btn>
		</v-toolbar>

		<v-divider></v-divider>

		<v-list
			subheader
			two-line
			v-for="post in site.posts"
			:key="post.id"
		>
			<v-list-item
				:to="{name: 'editPost', params: {id: post.id}}"
			>
				<v-list-item-content>
					<v-list-item-title>
						{{post.title}}
					</v-list-item-title>
					<v-list-item-subtitle>
						{{post.date}}
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
	name: "ListPosts",
	computed: mapState(['site'])
};
</script>