<template>
    <form @submit.prevent="save">
        <header>
            <h3>Edit Page</h3>
            <div class="actions">
                <input type="submit" value="save" class="is-primary">
            </div>
        </header>
        <section v-if="title">
            <div class="field">
                <label>Title</label>
                <div class="control">
                    <input type="text" v-model="title"/>
                </div>
            </div>
            <div class="field">
                <label>Exclude</label>
                <div class="control">
                    <input type="checkbox" v-model="exclude"/>
                </div>
            </div>
        </section>
        <section v-if="title">
            <div class="field"> 
                <label>Content</label>
                <div class="control">
                    <textarea-autosize v-model="content" ref="markdownEditor"/>
                </div>
            </div>
        </section>
    </form>
</template>

<script>
export default {
    data: function(){
        return {
            title: "",
            content: "",
            exclude: false
        }
    },

    created(){
        this.fetch()
    },

    methods:{
        fetch(){
            const jekyll = this.$store.state.jekyll;
            const page_id = this.$route.params.id;

            this.$Progress.start();
            jekyll.fetchPage(page_id)
            .then(page=>{
                this.title = page.title
                this.content = page.content
                this.exclude = page.exclude

                this.$Progress.finish();
            })
            .catch(()=>{
                this.$Progress.fail();
            })
        },

        save(){
            const jekyll = this.$store.state.jekyll;
            const page_id = this.$route.params.id

            this.$Progress.start();
            jekyll.savePage(page)
            .then(()=>{
                this.$Progress.finish();
                alert(`Page ${this.title} updated`);
                this.$router.push({name: 'listPages'})
            })
            .catch((err)=>{
                this.$Progress.fail();
                alert(err.name+"\n"+err.message)
            })
        }
    }
}
</script>