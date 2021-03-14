<template>
    <v-form @submit.prevent="save">
        <v-container v-if="page">
            <v-toolbar flat>
                <v-toolbar-title>Edit Page</v-toolbar-title>

                <v-spacer></v-spacer>

                <v-tooltip bottom show>
                    <template v-slot:activator="{ on, attrs }">
                        <v-chip 
                            v-bind="attrs"
                            v-on="on"
                        >
                        md
                        </v-chip>
                    </template>
                    <span>{{md[0]}}</span>
                    <pre style="white-space: pre-wrap">{{md[1]}}</pre>
                </v-tooltip>
            </v-toolbar>

            <v-text-field
                v-model="page.title"
                label="title"
            ></v-text-field>

            <v-chip>id: {{page.id}}</v-chip>
            <v-chip>path: {{page.path}}</v-chip>

            <v-checkbox label="exclude" v-model="page.exclude"></v-checkbox>

            <v-textarea
                v-model="page.content"
                auto-grow
                rows="2"
                label="content"
            ></v-textarea>

        </v-container>
    </v-form>
</template>



<script>
import {mapState, mapGetters} from 'vuex'
import pathParse from 'path-parse'
import slugify from 'slugify'
import urljoin from 'url-join'
import {Base64} from 'js-base64';
import {page_to_blob} from '@/jekyll2'

export default {
    name: "EditPage",

    computed: {
        ...mapState(['site', 'page']),
        ...mapGetters(['getRawContentUrl']),
        md(){
            const [path, blob] = page_to_blob(this.page)
            return [path, Base64.decode(blob.content)]
        }
    },

    watch: {
        'page.title': function(){
            this.update()
        }
    },

    methods:{
        update(){
            let {dir, base} = pathParse(this.page.path)
            base = slugify(this.page.title, "_").toLowerCase()+".md"
            const path = urljoin([dir, base])
            this.page.path = path
        }
    }
}
</script>