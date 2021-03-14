<template>
    <v-form @submit.prevent="save">
        <v-container v-if="page">
            <v-toolbar flat>
                <v-toolbar-title>Edit Page</v-toolbar-title>
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



<script lang="ts">
import {mapState, mapGetters} from 'vuex'
import pathParse from 'path-parse'
import slugify from 'slugify'
import urljoin from 'url-join'

interface IPage{
    /* The content of the Page, rendered or un-rendered depending upon
       what Liquid is being processed and what page is. */
    content: string;

    /* The title of the Page. */
    title: string;

    /* The un-rendered excerpt of a document. */
    readonly excerpt: string;

    /* The URL of the Post without the domain, but with a leading slash, e.g. 
       /2008/12/14/my-post.html */
    readonly url:string;

    /* The Date assigned to the Post. This can be overridden in a Post’s 
       front matter by specifying a new date/time in the format
       YYYY-MM-DD HH:MM:SS (assuming UTC), or 
       YYYY-MM-DD HH:MM:SS +/-TTTT (to specify a time zone using an 
       offset from UTC. e.g. 2008-12-14 10:30:00 +0900). */
    readonly date:string;

    /* An identifier unique to a document in a Collection or a Post (useful in 
       RSS feeds). e.g. /2008/12/14/my-post
       /my-collection/my-document */
    readonly id:string;

    /* The list of categories to which this post belongs. Categories are
       derived from the directory structure above the _posts directory.
       For example, a post at /work/code/_posts/2008-12-24-closures.md would have this field
       set to ['work', 'code']. These can also be specified in the front
       matter.
    */
   readonly categories: string[];

    /* The label of the collection to which this document belongs. e.g.
        posts for a post, or puppies for a document at path 
       _puppies/rover.md. If not part of a collection, an empty string is 
       returned.
    */
   collection: string;

    /*The list of tags to which this post belongs. These can be specified in
      the front matter. */
   tags: string[];

    /* The path to the raw post or page. Example usage: Linking back to the page or post’s source on GitHub. This can be overridden in the front matter. */
   readonly path: string;

   /* The path between the source directory and the file of the post or
      page, e.g. /pages/. This can be overridden by permalink in the
      front matter. */
    readonly dir: string;

    /* the filename of the page, e.g. about.md */
    readonly name: string;
}

export default {
    name: "EditPage",

    computed: {
        ...mapState(['site', 'page']),
        ...mapGetters(['getRawContentUrl'])
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