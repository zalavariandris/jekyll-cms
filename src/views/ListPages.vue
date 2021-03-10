<template>
	<v-container>
		<v-toolbar flat>
			<v-toolbar-title>Pages</v-toolbar-title>
		</v-toolbar>

		<v-divider></v-divider>

		<v-list
			two-line
			v-for="page in site.pages"
			:key="page.id"
		>
			<v-list-item
				:to="{name: 'editPage', params: {id: page.id}}"
			>
				<v-list-item-content>
					<v-list-item-title>
					{{page.title}}
					</v-list-item-title>
					<v-list-item-subtitle>
					{{page.id}}
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

<script>
import {mapState} from 'vuex'
export default {
	name: "ListPages",
	computed: mapState(['site'])
};
</script>